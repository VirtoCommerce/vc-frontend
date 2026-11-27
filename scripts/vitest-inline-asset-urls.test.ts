// @vitest-environment node
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inlineAssetUrls } from "./vitest-inline-asset-urls.js";
import type { ViteDevServer } from "vite";

// Kept out of the literals below: the plugin also transforms this file.
const URL_QUERY = "?url";

describe("inlineAssetUrls", () => {
  let fixtureRoot: string;
  let server: ViteDevServer;

  async function transform(lines: string[]): Promise<string | undefined> {
    writeFileSync(path.join(fixtureRoot, "src/entry.js"), lines.join("\n"));
    server.environments.client.moduleGraph.invalidateAll();

    return (await server.transformRequest("/src/entry.js"))?.code;
  }

  beforeAll(async () => {
    fixtureRoot = realpathSync(mkdtempSync(path.join(os.tmpdir(), "inline-asset-urls-")));
    mkdirSync(path.join(fixtureRoot, "src/assets"), { recursive: true });
    writeFileSync(path.join(fixtureRoot, "src/assets/a.png"), "");
    writeFileSync(path.join(fixtureRoot, "src/assets/b.png"), "");
    writeFileSync(path.join(fixtureRoot, "src/assets/icon.svg"), '<svg xmlns="http://www.w3.org/2000/svg"/>');

    server = await createServer({
      configFile: false,
      root: fixtureRoot,
      logLevel: "silent",
      server: { middlewareMode: true, hmr: false, ws: false },
      optimizeDeps: { noDiscovery: true },
      plugins: [inlineAssetUrls()],
      resolve: {
        alias: [
          { find: "@", replacement: path.join(fixtureRoot, "src") },
          // Matches the file but not the `?url` request, so Vite does not apply it to the imports below.
          { find: /^\/src\/assets\/a\.png$/, replacement: "/src/assets/b.png" },
        ],
      },
    });
  });

  afterAll(async () => {
    await server.close();
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it("inlines the URL Vite serves for the file the `?url` request resolves to", async () => {
    const code = await transform([
      `import aliased from "@/assets/a.png${URL_QUERY}";`,
      `import relative from "./assets/b.png${URL_QUERY}";`,
      `import rootRelative from "/src/assets/a.png${URL_QUERY}";`,
      `import { default as globbed } from "./assets/a.png${URL_QUERY}";`,
      "export { aliased, relative, rootRelative, globbed };",
    ]);

    expect(code).toContain('const aliased = "/src/assets/a.png";');
    expect(code).toContain('const relative = "/src/assets/b.png";');
    expect(code).toContain('const rootRelative = "/src/assets/a.png";');
    expect(code).toContain('const globbed = "/src/assets/a.png";');
  });

  it("inlines a small `.svg` as the `data:` URL Vite serves for it", async () => {
    const code = await transform([`import icon from "./assets/icon.svg${URL_QUERY}";`, "export { icon };"]);

    expect(code).toMatch(/const icon = "data:image\/svg\+xml,/);
  });

  it("keeps an import that binds more than the default export", async () => {
    const code = await transform([
      `import { default as icon, other } from "./assets/a.png${URL_QUERY}";`,
      "export { icon, other };",
    ]);

    expect(code).not.toContain("const icon =");
  });

  it("leaves an import Vite does not resolve to Vite's own error", async () => {
    await expect(
      transform([`import missing from "./assets/missing.png${URL_QUERY}";`, "export { missing };"]),
    ).rejects.toThrow('Failed to resolve import "./assets/missing.png?url"');
  });
});
