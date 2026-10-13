// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BACKEND_REQUIREMENTS } from "@/core-api/backend-requirements.mjs";
import { gitIn } from "@/core-api/git.mjs";
import {
  STOREFRONT_PLUGIN_TARGETS,
  TARGETS_IMPORT,
  checkArtifact,
  checkEnvironment,
  checkModuleFiles,
  listZipEntries,
  parseModuleManifest,
} from "@/core-api/plugin-module.mjs";
import type { ICheckResult } from "@/core-api/plugin-module.mjs";

const XAPI = "VirtoCommerce.Xapi";
const XFRONTEND = "VirtoCommerce.XFrontend";
const PIN = "0.2.3";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function manifestXml(platformVersion: string, dependencies: string): string {
  return `<module>
  <id>VirtoCommerce.Foo</id>
  <platformVersion>${platformVersion}</platformVersion>
  <dependencies>
${dependencies}
  </dependencies>
</module>`;
}

const floorDependencies = Object.entries(BACKEND_REQUIREMENTS.modules)
  .map(([id, version]) => `    <dependency id="${id}" version="${version}" />`)
  .join("\n");

/** A module that passes every source check; each test breaks one thing. */
function createModule(): { root: string; webDir: string; write: (path: string, content: string) => void } {
  const root = mkdtempSync(join(tmpdir(), "plugin-module-"));
  tempDirs.push(root);
  const webDir = join(root, "src", "Foo.Web");
  const write = (path: string, content: string) => {
    mkdirSync(join(webDir, path, ".."), { recursive: true });
    writeFileSync(join(webDir, path), content);
  };

  gitIn(root)(["init", "-q"]);
  writeFileSync(join(root, ".gitignore"), "/src/Foo.Web/plugins/\n");
  write("module.manifest", manifestXml(BACKEND_REQUIREMENTS.platform, floorDependencies));
  write("Foo.Web.csproj", `<Project Sdk="Microsoft.NET.Sdk.Web">\n  ${TARGETS_IMPORT}\n</Project>\n`);
  write("StorefrontApp/storefront-plugin.targets", STOREFRONT_PLUGIN_TARGETS);
  write(
    "StorefrontApp/package.json",
    JSON.stringify({
      packageManager: "yarn@4.17.0",
      dependencies: {
        "@vc-frontend/core": `https://github.com/VirtoCommerce/vc-frontend/releases/download/core-v${PIN}/vc-frontend-core-${PIN}.tgz`,
      },
    }),
  );
  write("StorefrontApp/yarn.lock", "");
  write(
    "StorefrontApp/vite.config.ts",
    `federation(createRemoteFederationOptions({ name: "foo", requiredHostVersion: "^${PIN}" }));
build: { outDir: "../plugins/vc-frontend", emptyOutDir: true }`,
  );
  write(
    "StorefrontApp/public/plugin.json",
    JSON.stringify({ id: "foo", remote: { name: "foo", exposed: "./plugin" } }),
  );
  return { root, webDir, write };
}

const failures = (results: ICheckResult[]) => results.filter((result) => result.status === "fail");
const withStatus = (results: ICheckResult[], status: ICheckResult["status"]) =>
  results.filter((result) => result.status === status);

describe("parseModuleManifest", () => {
  it("reads dependencies whatever the attribute order, and skips commented-out ones", () => {
    const facts = parseModuleManifest(
      manifestXml(
        "3.1078.0",
        `<dependency version="3.1027.0" id="${XAPI}" />\n<!-- <dependency id="${XFRONTEND}" version="3.1005.0" /> -->`,
      ),
    );

    expect(facts.platformVersion).toBe("3.1078.0");
    expect(facts.dependencies).toEqual({ [XAPI]: "3.1027.0" });
  });

  it("reads nothing after a comment that is never closed", () => {
    const facts = parseModuleManifest(
      manifestXml(
        "3.1078.0",
        `<dependency id="${XAPI}" version="3.1027.0" />\n<!-- <dependency id="${XFRONTEND}" version="3.1005.0" />`,
      ),
    );

    expect(facts.dependencies).toEqual({ [XAPI]: "3.1027.0" });
    expect(facts.platformVersion).toBe("3.1078.0");
  });
});

describe("checkModuleFiles", () => {
  it("passes a module wired the way the scaffolder prints", () => {
    const { webDir } = createModule();

    expect(failures(checkModuleFiles(webDir))).toEqual([]);
    expect(withStatus(checkModuleFiles(webDir), "warn")).toEqual([]);
  });

  it("fails a platform floor below the requirement and names the line to write", () => {
    const { webDir, write } = createModule();
    write("module.manifest", manifestXml("3.1048.0", floorDependencies));

    expect(failures(checkModuleFiles(webDir))).toEqual([
      expect.objectContaining({ fix: `<platformVersion>${BACKEND_REQUIREMENTS.platform}</platformVersion>` }),
    ]);
  });

  it("accepts a prerelease of a floor, the way the platform compares versions", () => {
    const { webDir, write } = createModule();
    write("module.manifest", manifestXml(`${BACKEND_REQUIREMENTS.platform}-alpha.1`, floorDependencies));

    expect(failures(checkModuleFiles(webDir))).toEqual([]);
  });

  it("fails a missing XFrontend dependency", () => {
    const { webDir, write } = createModule();
    write("module.manifest", manifestXml(BACKEND_REQUIREMENTS.platform, `<dependency id="${XAPI}" version="9.0.0" />`));

    expect(failures(checkModuleFiles(webDir))).toEqual([
      expect.objectContaining({
        fix: `<dependency id="${XFRONTEND}" version="${BACKEND_REQUIREMENTS.modules[XFRONTEND]}" />`,
      }),
    ]);
  });

  it("fails a .csproj that does not build the plugin, and only warns on hand-written targets", () => {
    const { webDir, write } = createModule();
    write("Foo.Web.csproj", "<Project />");
    expect(failures(checkModuleFiles(webDir))).toEqual([
      expect.objectContaining({ fix: expect.stringContaining(TARGETS_IMPORT) }),
    ]);

    write(
      "Foo.Web.csproj",
      '<Project><Target Name="BuildStorefrontPlugin" /><Target Name="PublishStorefrontPlugin" /></Project>',
    );
    const results = checkModuleFiles(webDir);
    expect(failures(results)).toEqual([]);
    expect(withStatus(results, "warn")).toHaveLength(1);
  });

  it("fails when the built folder would be committed, naming the ignore line for this module", () => {
    const { root, webDir } = createModule();
    writeFileSync(join(root, ".gitignore"), "");

    expect(failures(checkModuleFiles(webDir))).toEqual([
      expect.objectContaining({ fix: expect.stringContaining("/src/Foo.Web/plugins/") }),
    ]);
  });

  it("fails a local facade link left in package.json", () => {
    const { webDir, write } = createModule();
    write(
      "StorefrontApp/package.json",
      JSON.stringify({
        packageManager: "yarn@4.17.0",
        dependencies: { "@vc-frontend/core": "file:.yalc/@vc-frontend/core" },
      }),
    );

    expect(failures(checkModuleFiles(webDir))).toEqual([
      expect.objectContaining({ message: expect.stringContaining("file:.yalc") }),
    ]);
  });

  it("fails a contract range below the facade pin and only warns on one above it", () => {
    const { webDir, write } = createModule();
    const viteConfig = (range: string) =>
      `createRemoteFederationOptions({ name: "foo", requiredHostVersion: "${range}" });\noutDir: "../plugins/vc-frontend"`;

    write("StorefrontApp/vite.config.ts", viteConfig("^0.2.0"));
    expect(failures(checkModuleFiles(webDir))).toHaveLength(1);

    write("StorefrontApp/vite.config.ts", viteConfig("^0.2.4"));
    const results = checkModuleFiles(webDir);
    expect(failures(results)).toEqual([]);
    expect(withStatus(results, "warn")).toHaveLength(1);
  });

  it("fails a plugin.json whose remote name is not the federation name", () => {
    const { webDir, write } = createModule();
    write(
      "StorefrontApp/public/plugin.json",
      JSON.stringify({ id: "foo", remote: { name: "bar", exposed: "./plugin" } }),
    );

    expect(failures(checkModuleFiles(webDir))).toHaveLength(1);
  });

  it("fails a build that does not write into the probed folder", () => {
    const { webDir, write } = createModule();
    write(
      "StorefrontApp/vite.config.ts",
      `createRemoteFederationOptions({ name: "foo", requiredHostVersion: "^${PIN}" });\noutDir: "dist"`,
    );

    expect(failures(checkModuleFiles(webDir))).toHaveLength(1);
  });
});

describe("STOREFRONT_PLUGIN_TARGETS", () => {
  it("has no '--' inside an XML comment, which MSBuild refuses to load", () => {
    const comments = [...STOREFRONT_PLUGIN_TARGETS.matchAll(/<!--([\s\S]*?)-->/g)].map(([, body]) => body);

    expect(comments.length).toBeGreaterThan(0);
    expect(comments.filter((body) => body.includes("--"))).toEqual([]);
  });
});

/** A zip reduced to what listZipEntries reads: central directory records and the end record. */
function zipWithEntries(names: string[]): Buffer {
  const records = names.map((name) => {
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(Buffer.byteLength(name), 28);
    return Buffer.concat([header, Buffer.from(name)]);
  });
  const directory = Buffer.concat(records);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(names.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(0, 16);
  return Buffer.concat([directory, end]);
}

function writeZip(names: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), "plugin-zip-"));
  tempDirs.push(dir);
  const path = join(dir, "module.zip");
  writeFileSync(path, zipWithEntries(names));
  return path;
}

const pluginFiles = (prefix: string) =>
  ["remoteEntry.js", "mf-manifest.json", "plugin.json"].map((file) => `${prefix}plugins/vc-frontend/${file}`);

describe("checkArtifact", () => {
  it("reads entry names from the central directory", () => {
    expect(listZipEntries(readFileSync(writeZip(["a.txt", "dir/b.js"])))).toEqual(["a.txt", "dir/b.js"]);
  });

  it("passes a package with the plugin at its root", () => {
    expect(failures(checkArtifact(writeZip(["module.manifest", ...pluginFiles("")])))).toEqual([]);
  });

  it("fails a package whose plugin landed in bin/", () => {
    expect(failures(checkArtifact(writeZip(["module.manifest", ...pluginFiles("bin/")])))).toEqual([
      expect.objectContaining({ message: expect.stringContaining("bin/plugins/vc-frontend/") }),
    ]);
  });

  it("fails a package without the plugin, naming what is missing", () => {
    expect(failures(checkArtifact(writeZip(["module.manifest", "plugins/vc-frontend/plugin.json"])))).toEqual([
      expect.objectContaining({ message: expect.stringContaining("remoteEntry.js, mf-manifest.json") }),
    ]);
  });
});

describe("checkEnvironment", () => {
  const ENTRY = "/modules/VirtoCommerce.Foo/plugins/vc-frontend/remoteEntry.js";
  const listing = (plugins: unknown[]) => Response.json({ data: { store: { plugins } } });

  it("finds the plugin and fetches the manifest beside its entry", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(listing([{ id: "foo", remote: { name: "foo" }, entry: { path: ENTRY } }]))
      .mockResolvedValueOnce(Response.json({ name: "foo" }));

    const results = await checkEnvironment("https://shop.example.com", "foo", request);

    expect(failures(results)).toEqual([]);
    expect(String(request.mock.calls[1][0])).toBe(
      "https://shop.example.com/modules/VirtoCommerce.Foo/plugins/vc-frontend/mf-manifest.json",
    );
    expect(JSON.parse(request.mock.calls[0][1].body).variables).toEqual({ domain: "shop.example.com" });
  });

  it("fails when the plugin query errors, pointing at the x-api floor", async () => {
    const request = vi.fn().mockResolvedValue(Response.json({ errors: [{ message: "contributions not found" }] }));

    expect(await checkEnvironment("https://shop.example.com", "foo", request)).toEqual([
      expect.objectContaining({ status: "fail", fix: expect.stringContaining(BACKEND_REQUIREMENTS.modules[XAPI]) }),
    ]);
  });

  it("fails when the plugin is not listed", async () => {
    const request = vi.fn().mockResolvedValue(listing([{ id: "other" }]));

    expect(await checkEnvironment("https://shop.example.com", "foo", request)).toEqual([
      expect.objectContaining({ status: "fail", message: expect.stringContaining("listed: other") }),
    ]);
  });

  it("fails a listed plugin whose manifest is not routed, pointing at /modules", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(listing([{ id: "foo", entry: { path: ENTRY } }]))
      .mockResolvedValueOnce(new Response("not found", { status: 404 }));

    expect(failures(await checkEnvironment("https://shop.example.com", "foo", request))).toEqual([
      expect.objectContaining({ fix: expect.stringContaining("/modules") }),
    ]);
  });
});
