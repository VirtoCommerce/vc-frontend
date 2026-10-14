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
  write("StorefrontApp/yarn.lock", "__metadata:\n  version: 10\n");
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

  it("fails a missing yarn.lock and the empty one the scaffold writes", () => {
    const { webDir, write } = createModule();
    write("StorefrontApp/yarn.lock", "");
    expect(failures(checkModuleFiles(webDir))).toEqual([
      expect.objectContaining({ message: "yarn.lock is empty", fix: expect.stringContaining("yarn install") }),
    ]);

    rmSync(join(webDir, "StorefrontApp", "yarn.lock"));
    expect(failures(checkModuleFiles(webDir))).toEqual([expect.objectContaining({ message: "yarn.lock is missing" })]);
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

  it("fails a contract range that reaches past the facade's breaking line, or admits nothing", () => {
    const { webDir, write } = createModule();
    const viteConfig = (range: string) =>
      `createRemoteFederationOptions({ name: "foo", requiredHostVersion: "${range}" });\noutDir: "../plugins/vc-frontend"`;

    for (const range of [`>=${PIN}`, `${PIN} - 1.0.0`, ">1.0.0 <1.0.0"]) {
      write("StorefrontApp/vite.config.ts", viteConfig(range));
      expect(failures(checkModuleFiles(webDir)), range).toEqual([
        expect.objectContaining({ fix: `requiredHostVersion: "^${PIN}"` }),
      ]);
    }
  });

  it("only warns when the federation name is not a literal it can compare", () => {
    const { webDir, write } = createModule();
    write(
      "StorefrontApp/vite.config.ts",
      `createRemoteFederationOptions({ name: PLUGIN_NAME, requiredHostVersion: "^${PIN}" });\noutDir: "../plugins/vc-frontend"`,
    );

    const results = checkModuleFiles(webDir);
    expect(failures(results)).toEqual([]);
    expect(withStatus(results, "warn")).toEqual([expect.objectContaining({ fix: 'Make sure it equals "foo".' })]);
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

  it("copies the bundle beside the publish dir, where the platform probes, not into bin/", () => {
    expect(STOREFRONT_PLUGIN_TARGETS).toContain('DestinationFiles="$(PublishDir)\\..\\plugins\\%(RecursiveDir)');
  });

  it("keeps the plugin sources and the built bundle out of every default item type", () => {
    for (const itemType of ["Compile", "Content", "EmbeddedResource", "None"]) {
      expect(STOREFRONT_PLUGIN_TARGETS).toContain(
        `<${itemType} Remove="$(StorefrontAppDir)**;$(StorefrontPluginOutDir)**" />`,
      );
    }
  });

  it("installs, type-checks and builds through corepack, and reinstalls only when Clean broke node_modules", () => {
    const build = /<Target Name="BuildStorefrontPlugin"[\s\S]*?<\/Target>/.exec(STOREFRONT_PLUGIN_TARGETS)?.[0] ?? "";
    const commands = [...build.matchAll(/<Exec Command="([^"]+)"/g)].map(([, command]) => command);

    expect(commands).toEqual([
      "corepack --version",
      "corepack yarn install --immutable",
      "corepack yarn type-check",
      "corepack yarn build",
    ]);
    expect(build).toContain(
      `<RemoveDir Directories="$(StorefrontAppDir)node_modules" Condition="!Exists('$(StorefrontAppDir)node_modules\\vite\\bin\\vite.js')" />`,
    );
  });

  it("stops with a readable error, before any yarn call, when corepack is missing", () => {
    const build = /<Target Name="BuildStorefrontPlugin"[\s\S]*?<\/Target>/.exec(STOREFRONT_PLUGIN_TARGETS)?.[0] ?? "";
    const error = /<Error Condition="'\$\(StorefrontCorepackExitCode\)' != '0'" Text="([^"]+)" \/>/.exec(build);

    expect(build).toContain('<Output TaskParameter="ExitCode" PropertyName="StorefrontCorepackExitCode" />');
    expect(error?.[1]).toContain("-p:SkipStorefrontPlugin=true");
    expect(build.indexOf("<Error ")).toBeLessThan(build.indexOf("corepack yarn"));
  });

  it("skips building and copying under SkipStorefrontPlugin, and says the package has no plugin", () => {
    const targets = [...STOREFRONT_PLUGIN_TARGETS.matchAll(/<Target Name="(\w+)"[^>]*Condition="([^"]+)"/g)];

    expect(Object.fromEntries(targets.map(([, name, condition]) => [name, condition]))).toEqual({
      ReportStorefrontPluginSkipped: "'$(SkipStorefrontPlugin)' == 'true'",
      BuildStorefrontPlugin: "'$(SkipStorefrontPlugin)' != 'true'",
      PublishStorefrontPlugin: "'$(SkipStorefrontPlugin)' != 'true'",
    });
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
  const SHOP = "https://shop.example.com";
  const ENTRY = "/modules/VirtoCommerce.Foo/plugins/vc-frontend/remoteEntry.js";
  const PLUGIN = { pluginId: "foo", moduleId: "VirtoCommerce.Foo" };
  const atFloors = Object.entries(BACKEND_REQUIREMENTS.modules).map(([moduleId, version]) => ({ moduleId, version }));
  const installed = (modules: { moduleId: string; version: string }[]) =>
    Response.json({ data: { store: { settings: { modules } } } });
  const listing = (plugins: unknown[]) => Response.json({ data: { store: { plugins } } });
  const graphqlError = (message: string) => Response.json({ errors: [{ message }] });

  /** Answers the three requests in the order the check makes them: module versions, plugins, manifest. */
  function environment(...responses: Response[]) {
    const request = vi.fn();
    for (const response of responses) {
      request.mockResolvedValueOnce(response);
    }
    return request;
  }

  it("passes an environment that serves the plugin, and fetches the manifest beside its entry", async () => {
    const request = environment(
      installed([...atFloors, { moduleId: "VirtoCommerce.Foo", version: "3.1000.0" }]),
      listing([{ id: "foo", remote: { name: "foo" }, entry: { path: ENTRY } }]),
      Response.json({ name: "foo", metaData: { requiredHostVersion: `^${PIN}` } }),
    );

    const results = await checkEnvironment(SHOP, PLUGIN, request);

    expect(failures(results)).toEqual([]);
    // Gate 1 is the storefront's to evaluate; the check prints the range to compare with.
    expect(results).toContainEqual(
      expect.objectContaining({
        status: "pass",
        message: expect.stringContaining(`requires @vc-frontend/core ^${PIN}`),
      }),
    );
    expect(String(request.mock.calls[2][0])).toBe(
      `${SHOP}/modules/VirtoCommerce.Foo/plugins/vc-frontend/mf-manifest.json`,
    );
    expect(JSON.parse(request.mock.calls[0][1].body).variables).toEqual({ domain: "shop.example.com" });
  });

  it("fails a backend module below its floor and the plugin's own module when it is not installed", async () => {
    const request = environment(
      installed(
        atFloors.map((module) => (module.moduleId === XAPI ? { moduleId: XAPI, version: "3.1020.0" } : module)),
      ),
      listing([{ id: "foo", entry: { path: ENTRY } }]),
      Response.json({ name: "foo" }),
    );

    expect(failures(await checkEnvironment(SHOP, PLUGIN, request))).toEqual([
      expect.objectContaining({ message: `${XAPI} is 3.1020.0, below ${BACKEND_REQUIREMENTS.modules[XAPI]}` }),
      expect.objectContaining({ message: "VirtoCommerce.Foo is not installed" }),
    ]);
  });

  it("only warns when the environment hides module versions, instead of calling the modules not installed", async () => {
    const request = environment(
      installed(atFloors.map(({ moduleId }) => ({ moduleId, version: "" }))),
      listing([{ id: "foo", entry: { path: ENTRY } }]),
      Response.json({ name: "foo" }),
    );

    const results = await checkEnvironment(SHOP, PLUGIN, request);

    expect(failures(results)).toEqual([]);
    expect(results).toContainEqual(
      expect.objectContaining({ status: "warn", message: expect.stringContaining("ReturnModuleVersion") }),
    );
  });

  it("only warns when the module versions cannot be read, and goes on to the plugin list", async () => {
    const request = environment(
      graphqlError("settings unavailable"),
      listing([{ id: "foo", entry: { path: ENTRY } }]),
      Response.json({ name: "foo" }),
    );

    const results = await checkEnvironment(SHOP, PLUGIN, request);

    expect(failures(results)).toEqual([]);
    expect(withStatus(results, "warn")).toHaveLength(1);
  });

  it("fails when the plugin query errors, pointing at the x-api floor", async () => {
    const request = environment(installed(atFloors), graphqlError("contributions not found"));

    expect(failures(await checkEnvironment(SHOP, { pluginId: "foo" }, request))).toEqual([
      expect.objectContaining({ fix: expect.stringContaining(BACKEND_REQUIREMENTS.modules[XAPI]) }),
    ]);
  });

  it("fails when the plugin is not listed", async () => {
    const request = environment(installed(atFloors), listing([{ id: "other" }]));

    expect(failures(await checkEnvironment(SHOP, { pluginId: "foo" }, request))).toEqual([
      expect.objectContaining({ message: expect.stringContaining("listed: other") }),
    ]);
  });

  it("points at the package and a platform restart when the module is installed but its plugin is not listed", async () => {
    const request = environment(
      installed([...atFloors, { moduleId: "VirtoCommerce.Foo", version: "3.1000.0" }]),
      listing([]),
    );

    expect(failures(await checkEnvironment(SHOP, PLUGIN, request))).toEqual([
      expect.objectContaining({ fix: expect.stringMatching(/The module is installed.*--artifact.*restarted/) }),
    ]);
  });

  it("fails a listed plugin whose manifest is not routed, pointing at /modules", async () => {
    const request = environment(
      installed(atFloors),
      listing([{ id: "foo", entry: { path: ENTRY } }]),
      new Response("not found", { status: 404 }),
    );

    expect(failures(await checkEnvironment(SHOP, { pluginId: "foo" }, request))).toEqual([
      expect.objectContaining({ fix: expect.stringContaining("/modules/VirtoCommerce.Foo/plugins/vc-frontend/") }),
    ]);
  });
});
