// @vitest-environment node
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer, normalizePath } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inlineAssetUrlImports, inlineAssetUrls } from "./vitest-inline-asset-urls.js";
import type { ViteDevServer } from "vite";

// `/repo` on POSIX, `C:/repo` on Windows: the form Vite passes on each OS.
const ROOT = normalizePath(path.resolve("/repo"));
const OPTIONS = { root: ROOT, publicDir: `${ROOT}/client-app/public`, base: "/", mayInlineSvg: () => false };
const IMPORTER_DIR = `${ROOT}/client-app/ui-kit/utilities`;
const ALIAS = "@/";
// Kept out of the literals below: the plugin also transforms this file.
const URL_QUERY = "?url";

// Stands in for Vite's resolver: the `@` alias, root-relative and relative specifiers.
async function resolveImport(specifier: string): Promise<string | undefined> {
  if (specifier.startsWith(ALIAS)) {
    return `${ROOT}/client-app/${specifier.slice(ALIAS.length)}`;
  }
  if (specifier.startsWith("/")) {
    return path.join(ROOT, specifier);
  }
  return specifier.startsWith(".") ? path.resolve(IMPORTER_DIR, specifier) : undefined;
}

describe("inlineAssetUrlImports", () => {
  it("inlines the dev-server URL of every `?url` import in the expanded glob", async () => {
    const code = [
      `import { default as __vite_glob_0_0 } from "../icons/solid/academic-cap.svg${URL_QUERY}";import __vite_glob_0_1 from "/client-app/assets/images/404.jpg${URL_QUERY}";`,
      'const urls = Object.assign({"../icons/solid/academic-cap.svg": __vite_glob_0_0});',
    ].join("\n");

    expect(await inlineAssetUrlImports(code, resolveImport, OPTIONS)).toBe(
      [
        'const __vite_glob_0_0 = "/client-app/ui-kit/icons/solid/academic-cap.svg";const __vite_glob_0_1 = "/client-app/assets/images/404.jpg";',
        'const urls = Object.assign({"../icons/solid/academic-cap.svg": __vite_glob_0_0});',
      ].join("\n"),
    );
  });

  it("inlines an import that goes through a `resolve.alias`", async () => {
    const code = `import noImageUrl from "@/ui-kit/images/no-image.svg${URL_QUERY}";`;

    expect(await inlineAssetUrlImports(code, resolveImport, OPTIONS)).toBe(
      'const noImageUrl = "/client-app/ui-kit/images/no-image.svg";',
    );
  });

  it("keeps an import that Vite does not resolve to a file", async () => {
    const code = `import icon from "pkg/icon.svg${URL_QUERY}";`;

    expect(await inlineAssetUrlImports(code, resolveImport, OPTIONS)).toBeUndefined();
  });

  it("prefixes the configured base", async () => {
    const code = `import icon from "./icon.svg${URL_QUERY}";`;

    expect(await inlineAssetUrlImports(code, resolveImport, { ...OPTIONS, base: "/themes/b2b/" })).toBe(
      'const icon = "/themes/b2b/client-app/ui-kit/utilities/icon.svg";',
    );
  });

  it("keeps an `.svg` that the dev server may serve as a `data:` URL", async () => {
    const code = [
      `import icon from "../icons/solid/academic-cap.svg${URL_QUERY}";`,
      `import image from "../../assets/images/no-image.svg${URL_QUERY}";`,
    ].join("\n");
    const options = { ...OPTIONS, mayInlineSvg: (file: string) => file.includes("/assets/images/") };

    expect(await inlineAssetUrlImports(code, resolveImport, options)).toBe(
      [
        'const icon = "/client-app/ui-kit/icons/solid/academic-cap.svg";',
        `import image from "../../assets/images/no-image.svg${URL_QUERY}";`,
      ].join("\n"),
    );
  });

  it("keeps imports that the dev server does not serve from the root as is", async () => {
    const code = [
      `import a from "../../public/logo.svg${URL_QUERY}";`,
      `import b from "../../../node_modules/pkg/icon.svg${URL_QUERY}";`,
      `import c from "../../../../outside.svg${URL_QUERY}";`,
    ].join("\n");

    expect(await inlineAssetUrlImports(code, resolveImport, OPTIONS)).toBeUndefined();
  });

  it("keeps an import that binds more than the default export", async () => {
    const code = `import { default as icon, other } from "./icon.svg${URL_QUERY}";`;

    expect(await inlineAssetUrlImports(code, resolveImport, OPTIONS)).toBeUndefined();
  });

  it("leaves an import that is not at the start of a statement", async () => {
    const code = `const text = 'import icon from "./icon.svg${URL_QUERY}";';`;

    expect(await inlineAssetUrlImports(code, resolveImport, OPTIONS)).toBeUndefined();
  });

  it("returns undefined for code without `?url` imports", async () => {
    expect(await inlineAssetUrlImports('import x from "./x.svg?raw";', resolveImport, OPTIONS)).toBeUndefined();
  });
});

describe("inlineAssetUrls in a Vite dev server", () => {
  let fixtureRoot: string;
  let server: ViteDevServer;

  beforeAll(async () => {
    fixtureRoot = realpathSync(mkdtempSync(path.join(os.tmpdir(), "inline-asset-urls-")));
    mkdirSync(path.join(fixtureRoot, "src/assets"), { recursive: true });
    writeFileSync(path.join(fixtureRoot, "src/assets/a.png"), "");
    writeFileSync(path.join(fixtureRoot, "src/assets/b.png"), "");
    writeFileSync(
      path.join(fixtureRoot, "src/entry.js"),
      [
        `import aliased from "@/assets/a.png${URL_QUERY}";`,
        `import relative from "./assets/b.png${URL_QUERY}";`,
        `import rootRelative from "/src/assets/a.png${URL_QUERY}";`,
        "export { aliased, relative, rootRelative };",
      ].join("\n"),
    );

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
          // Matches the file but not the `?url` request, so Vite does not apply it to the imports above.
          { find: /^\/src\/assets\/a\.png$/, replacement: "/src/assets/b.png" },
        ],
      },
    });
  });

  afterAll(async () => {
    await server.close();
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it("inlines the URL of the file Vite resolves the `?url` request to", async () => {
    const result = await server.transformRequest("/src/entry.js");

    expect(result?.code).toContain('const aliased = "/src/assets/a.png";');
    expect(result?.code).toContain('const relative = "/src/assets/b.png";');
    expect(result?.code).toContain('const rootRelative = "/src/assets/a.png";');
  });
});
