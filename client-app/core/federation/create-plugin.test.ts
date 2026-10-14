// @vitest-environment node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { lt, minVersion } from "semver";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";
import { STOREFRONT_PLUGIN_TARGETS, TARGETS_IMPORT } from "@/core-api/plugin-module.mjs";

/**
 * Smoke test for the scaffolder (core-api/create-plugin.mjs). The generated project's
 * sources exist only as template strings, so the repo's own eslint/vue-tsc never check
 * them — this is the guard against shipping a scaffold with a syntax error or a broken
 * flag. It runs the real script in a child process (non-TTY => no prompts) against a
 * temp dir; no `yarn install`/build, so it stays fast.
 */

const SCRIPT = resolve(__dirname, "../../core-api/create-plugin.mjs");

const tempDirs: string[] = [];

/** Runs the real scaffolder against a fresh temp dir; callers assert on status/stderr/dir. */
function runScaffolder(name: string, flags: string[]): { dir: string; status: number | null; stderr: string } {
  const parent = mkdtempSync(join(tmpdir(), "mf-scaffold-"));
  tempDirs.push(parent);
  const dir = join(parent, name);
  const { status, stderr } = spawnSync(process.execPath, [SCRIPT, name, dir, ...flags], { encoding: "utf8" });
  return { dir, status, stderr };
}

const MODULE_MANIFEST = "<module><id>VirtoCommerce.Foo</id><platformVersion>3.1048.0</platformVersion></module>";
const MODULE_CSPROJ = '<Project Sdk="Microsoft.NET.Sdk.Web" />';

/** A backend module's *.Web project as the scaffolder finds it: a manifest and a .csproj. */
function createModuleWebDir(): string {
  const parent = mkdtempSync(join(tmpdir(), "mf-module-"));
  tempDirs.push(parent);
  const webDir = join(parent, "Foo.Web");
  mkdirSync(webDir);
  writeFileSync(join(webDir, "module.manifest"), MODULE_MANIFEST);
  writeFileSync(join(webDir, "Foo.Web.csproj"), MODULE_CSPROJ);
  return webDir;
}

function runScaffolderInModule(name: string, webDir: string, flags: string[]) {
  return spawnSync(process.execPath, [SCRIPT, name, "--module", webDir, ...flags], { encoding: "utf8" });
}

function scaffoldExpectingSuccess(name: string, flags: string[]): string {
  const { dir, status, stderr } = runScaffolder(name, flags);
  expect(status, stderr).toBe(0);
  return dir;
}

function expectParseableTs(filePath: string): void {
  const source = readFileSync(filePath, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
  });
  expect(result.diagnostics ?? []).toEqual([]);
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("create-plugin scaffolder", () => {
  it("scaffolds a default plugin whose generated TS parses and whose JSON is valid", () => {
    const dir = scaffoldExpectingSuccess("my-plugin", ["--yes"]);

    for (const file of [
      "package.json",
      "vite.config.ts",
      "plugin.config.ts",
      "tsconfig.json",
      "src/index.ts",
      "index.html",
      "public/plugin.json",
      "eslint.config.js",
      "vitest.config.ts",
      "src/mocks/vc-frontend-core.ts",
      ".prettierrc.json",
      ".editorconfig",
      ".vscode/settings.json",
    ]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }

    // The platform reads this to learn the expose key; without it it assumes "./Module" and the
    // host would loadRemote a key this plugin does not export.
    const descriptor = JSON.parse(readFileSync(join(dir, "public", "plugin.json"), "utf8")) as {
      id: string;
      remote: { name: string; exposed: string };
    };
    expect(descriptor).toEqual({
      id: "my-plugin",
      remote: { name: "my-plugin", exposed: "./plugin" },
    });

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      name: string;
      packageManager: string;
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.name).toBe("my-plugin");
    expect(pkg.dependencies["@vc-frontend/core"]).toContain("releases/download/core-v");
    // Type-peers are unconditional — without them facade types silently resolve to `any`.
    expect(pkg.devDependencies).toHaveProperty("@vueuse/core");
    JSON.parse(readFileSync(join(dir, "tsconfig.json"), "utf8"));

    expectParseableTs(join(dir, "vite.config.ts"));
    expectParseableTs(join(dir, "plugin.config.ts"));
    expect(readFileSync(join(dir, "vite.config.ts"), "utf8")).toContain("pluginContributions(contributions)");
    const tsconfig = JSON.parse(readFileSync(join(dir, "tsconfig.json"), "utf8"));
    expect(tsconfig.include).toContain("plugin.config.ts");
    expect(tsconfig.compilerOptions.lib).toContain("DOM.Iterable");
    expectParseableTs(join(dir, "src", "index.ts"));
    expectParseableTs(join(dir, "vitest.config.ts"));
    expectParseableTs(join(dir, "eslint.config.js"));
    expectParseableTs(join(dir, "src", "mocks", "vc-frontend-core.ts"));
    expectParseableTs(join(dir, "src", "pages", "my-page.test.ts"));

    expect(readFileSync(join(dir, ".yarnrc.yml"), "utf8")).toMatch(/^npmMinimalAgeGate: /m);
    // Its own Yarn project even under a parent package.json; `yarn install` fills it.
    expect(readFileSync(join(dir, "yarn.lock"), "utf8")).toBe("");
    // `yarn install` writes it beside the lockfile; it must not ride along when StorefrontApp/ is committed.
    expect(readFileSync(join(dir, ".gitignore"), "utf8").split("\n")).toEqual(
      expect.arrayContaining([".yarn/install-state.gz", ".env", "*.local"]),
    );
    // yarn 1 ignores the .yarnrc.yml this writes and knows no `portal:`/`link:` protocol.
    expect(pkg.packageManager).toMatch(/^yarn@/);
    expect(Object.keys(pkg.scripts)).toEqual(expect.arrayContaining(["lint", "format", "test", "type-check"]));

    // The README carries only the sections of the options chosen.
    const readme = readFileSync(join(dir, "README.md"), "utf8");
    expect(readme).toContain("https://localhost:3000/my-plugin");
    expect(readme).not.toContain("## GraphQL");
    expect(readme).not.toContain("storefront-plugin.targets");

    // CLAUDE.md imports the README rather than repeating it, and names only the chosen options' steps.
    const claudeMd = readFileSync(join(dir, "CLAUDE.md"), "utf8");
    expect(claudeMd).toContain("@README.md");
    expect(claudeMd).not.toContain("check:plugin-module");
    expect(claudeMd).not.toContain("generate:graphql-types");

    // Default = router on: the route page and the addRoute init must be generated.
    expect(existsSync(join(dir, "src", "pages", "my-page.vue"))).toBe(true);
    expect(readFileSync(join(dir, "src", "index.ts"), "utf8")).toContain("globals.router.addRoute");
    // Unused optional groups must be dropped from MF shared (spurious-gate protection).
    const viteConfig = readFileSync(join(dir, "vite.config.ts"), "utf8");
    expect(viteConfig).toContain('"@apollo/client": false');
    // Quoting a valid identifier fails the scaffold's own prettier rule.
    expect(viteConfig).toContain(" graphql: false");
    // cors: true would let any web page read the dev server's sources; Vite's default allows localhost only.
    expect(viteConfig).not.toContain("cors:");
    // Importing a library left out of shared bundles a second copy; the README says to delete its line first.
    expect(readme).toContain("is not shared.** Delete its line");
  });

  it("wires the test and type-check config the generated specs and templates depend on", () => {
    const dir = scaffoldExpectingSuccess("my-plugin", ["--yes"]);

    // A string key matches by prefix and would send @vc-frontend/core/testing to the mock too.
    expect(readFileSync(join(dir, "vitest.config.ts"), "utf8")).toContain(String.raw`find: /^@vc-frontend\/core$/`);

    const tsconfig = JSON.parse(readFileSync(join(dir, "tsconfig.json"), "utf8")) as {
      compilerOptions: { types: string[] };
      vueCompilerOptions: { strictTemplates: boolean };
    };
    expect(tsconfig.vueCompilerOptions.strictTemplates).toBe(true);
    // Under strictTemplates every ui-kit tag is an error unless the facade's GlobalComponents load.
    expect(tsconfig.compilerOptions.types).toContain("@vc-frontend/core");

    const { scripts } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    // A fixing `lint` passes CI on every auto-fixable error.
    expect(scripts.lint).toBe("eslint .");
    expect(scripts["lint:fix"]).toBe("eslint . --fix");
  });

  it("scaffolds the --no-router variant without a page, and its test run still passes", () => {
    const dir = scaffoldExpectingSuccess("bare-plugin", ["--yes", "--no-router"]);

    expect(existsSync(join(dir, "src", "pages", "my-page.vue"))).toBe(false);
    expect(existsSync(join(dir, "src", "pages", "my-page.test.ts"))).toBe(false);
    expect(readFileSync(join(dir, "src", "index.ts"), "utf8")).not.toContain("addRoute");
    // With no spec, `vitest run` exits 1.
    expect(readFileSync(join(dir, "vitest.config.ts"), "utf8")).toContain("passWithNoTests: true");
  });

  it("scaffolds the apollo variant with codegen wired to the facade's config", () => {
    const dir = scaffoldExpectingSuccess("gql-plugin", ["--yes", "--with-apollo"]);

    for (const file of ["codegen.ts", ".env.example", "src/api/graphql/queries/ping/pingQuery.graphql"]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }
    expectParseableTs(join(dir, "codegen.ts"));

    const codegen = readFileSync(join(dir, "codegen.ts"), "utf8");
    // Scalars must come from the host, or the same backend value gets two TypeScript types.
    expect(codegen).toContain('from "@vc-frontend/core/codegen"');
    expect(codegen).toContain("/graphql/gql-plugin");

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.scripts).toHaveProperty("generate:graphql-types");
    expect(readFileSync(join(dir, "README.md"), "utf8")).toContain("## GraphQL");
    expect(readFileSync(join(dir, "CLAUDE.md"), "utf8")).toContain("generate:graphql-types");
    // The generated types.ts imports it; the host resolves it transitively, a plugin must not.
    expect(pkg.devDependencies).toHaveProperty("@graphql-typed-document-node/core");
  });

  it("scaffolds the tailwind variant with the config/styles files", () => {
    const dir = scaffoldExpectingSuccess("tw-plugin", ["--yes", "--with-tailwind"]);

    for (const file of ["tailwind.config.cjs", "postcss.config.cjs", "src/styles.css"]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }
    expect(readFileSync(join(dir, "src", "index.ts"), "utf8")).toContain('import "./styles.css"');
  });

  it("rejects unknown flags instead of silently ignoring them", () => {
    // "--tailwind" is the natural typo for "--with-tailwind"; silently ignoring it would
    // scaffold WITHOUT tailwind in CI/non-TTY runs where no prompt can catch the mistake.
    const { status, stderr } = runScaffolder("typo-plugin", ["--yes", "--tailwind"]);
    expect(status).not.toBe(0);
    expect(stderr).toContain("Unknown flag");
  });

  it("rejects stray positional arguments instead of silently ignoring them", () => {
    const { status, stderr } = runScaffolder("my-plugin", ["--yes", "stray-token"]);
    expect(status).not.toBe(0);
    expect(stderr).toContain("Unexpected argument");
  });

  it("adds the typed-document alias only to a plugin with GraphQL, and only on a host that needs it", () => {
    const hostMfVite = (
      JSON.parse(readFileSync(resolve(__dirname, "../../../package.json"), "utf8")) as {
        devDependencies: Record<string, string>;
      }
    ).devDependencies["@module-federation/vite"];
    const hostNeedsAlias = lt(minVersion(hostMfVite) ?? "0.0.0", "1.23.1");

    const withApollo = readFileSync(
      join(scaffoldExpectingSuccess("gql", ["--yes", "--with-apollo"]), "vite.config.ts"),
      "utf8",
    );
    const plain = readFileSync(join(scaffoldExpectingSuccess("plain", ["--yes"]), "vite.config.ts"), "utf8");

    expect(withApollo.includes('"@graphql-typed-document-node/core": fileURLToPath(')).toBe(hostNeedsAlias);
    expect(plain).not.toContain("@graphql-typed-document-node/core");
    expectParseableTs(join(scaffoldExpectingSuccess("gql-parse", ["--yes", "--with-apollo"]), "vite.config.ts"));
  });

  it("shares every library when every group is picked, and its README has no sharedOverrides rule", () => {
    const dir = scaffoldExpectingSuccess("my-plugin", ["--yes", "--with-i18n", "--with-apollo", "--with-vueuse"]);

    expect(readFileSync(join(dir, "vite.config.ts"), "utf8")).not.toContain("sharedOverrides");
    expect(readFileSync(join(dir, "README.md"), "utf8")).not.toContain("is not shared.");
  });

  it("scaffolds --with-i18n with messages under one key, merged into the storefront's i18n", () => {
    const dir = scaffoldExpectingSuccess("my-plugin", ["--yes", "--with-i18n"]);

    // One file per language the host ships, so a language the host adds reaches new plugins.
    const hostLocales = readdirSync(resolve(__dirname, "../../../locales")).filter((name) =>
      /^[a-z]{2}\.json$/.test(name),
    );
    expect(readdirSync(join(dir, "src", "locales"))).toEqual(expect.arrayContaining(hostLocales));
    expect(readdirSync(join(dir, "src", "locales"))).toHaveLength(hostLocales.length);
    expect(JSON.parse(readFileSync(join(dir, "src", "locales", "en.json"), "utf8"))).toHaveProperty("my_plugin.title");
    expectParseableTs(join(dir, "src", "i18n.ts"));
    expect(readFileSync(join(dir, "src", "i18n.ts"), "utf8")).toContain('registerLocaleLoader("plugin:my-plugin"');
    expect(readFileSync(join(dir, "src", "index.ts"), "utf8")).toContain("loadLocales();");
    expect(readFileSync(join(dir, "src", "pages", "my-page.vue"), "utf8")).toContain('$t("my_plugin.title")');
    expect(readFileSync(join(dir, "README.md"), "utf8")).toContain("## Translations");
  });

  it("writes no translations without --with-i18n", () => {
    const dir = scaffoldExpectingSuccess("my-plugin", ["--yes"]);

    expect(existsSync(join(dir, "src", "i18n.ts"))).toBe(false);
    expect(existsSync(join(dir, "src", "locales"))).toBe(false);
    expect(readFileSync(join(dir, "src", "index.ts"), "utf8")).not.toContain("loadLocales");
  });

  it("refuses a folder that already has one of its files, and writes nothing", () => {
    const parent = mkdtempSync(join(tmpdir(), "mf-scaffold-"));
    tempDirs.push(parent);
    const dir = join(parent, "repo");
    mkdirSync(dir);
    writeFileSync(join(dir, "README.md"), "my repo");
    writeFileSync(join(dir, "LICENSE"), "MIT");

    const { status, stderr } = spawnSync(process.execPath, [SCRIPT, "foo-plugin", dir, "--yes"], { encoding: "utf8" });

    expect(status).not.toBe(0);
    expect(stderr).toContain("README.md");
    expect(stderr).toContain("refusing to overwrite");
    expect(readFileSync(join(dir, "README.md"), "utf8")).toBe("my repo");
    expect(existsSync(join(dir, "package.json"))).toBe(false);
  });

  it("scaffolds into a folder that holds only files it does not write", () => {
    const parent = mkdtempSync(join(tmpdir(), "mf-scaffold-"));
    tempDirs.push(parent);
    const dir = join(parent, "repo");
    mkdirSync(dir);
    writeFileSync(join(dir, "LICENSE"), "MIT");

    const { status, stderr } = spawnSync(process.execPath, [SCRIPT, "foo-plugin", dir, "--yes"], { encoding: "utf8" });

    expect(status, stderr).toBe(0);
    expect(readFileSync(join(dir, "LICENSE"), "utf8")).toBe("MIT");
    expect(existsSync(join(dir, "package.json"))).toBe(true);
  });

  it("rejects a non-kebab-case plugin name", () => {
    const { status, stderr } = runScaffolder("My_Plugin", ["--yes"]);
    expect(status).not.toBe(0);
    expect(stderr).toContain("kebab-case");
  });
  it("installs every package the facade's published files import, so its subpaths resolve", () => {
    const dir = scaffoldExpectingSuccess("my-plugin", ["--yes"]);
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    const facadePeers = JSON.parse(readFileSync(resolve(__dirname, "../../core-api/package.json"), "utf8")) as {
      peerDependencies: Record<string, string>;
    };

    // A package manager installs none of these on its own. lodash-es is the one that bit: it is
    // imported at runtime by @vc-frontend/core/testing, so the first spec in a scaffolded plugin
    // died on `Cannot find module` - the subpath was unusable by the only consumer it exists for.
    expect(Object.keys(pkg.devDependencies)).toEqual(expect.arrayContaining(Object.keys(facadePeers.peerDependencies)));
    expect(pkg.devDependencies["lodash-es"]).toBeTruthy();
  });
});

describe("create-plugin --module", () => {
  it("scaffolds into StorefrontApp/, builds into the folder the platform probes and writes the MSBuild targets", () => {
    const webDir = createModuleWebDir();
    const { status, stderr, stdout } = runScaffolderInModule("foo-plugin", webDir, ["--yes"]);
    expect(status, stderr).toBe(0);

    const appDir = join(webDir, "StorefrontApp");
    expect(readFileSync(join(appDir, "storefront-plugin.targets"), "utf8")).toBe(STOREFRONT_PLUGIN_TARGETS);
    const viteConfig = readFileSync(join(appDir, "vite.config.ts"), "utf8");
    expect(viteConfig).toContain('outDir: "../plugins/vc-frontend"');
    expectParseableTs(join(appDir, "vite.config.ts"));
    const readme = readFileSync(join(appDir, "README.md"), "utf8");
    expect(readme).toContain("yarn check:plugin-module");
    const claudeMd = readFileSync(join(appDir, "CLAUDE.md"), "utf8");
    expect(claudeMd).toContain("yarn check:plugin-module");
    // The skill that makes the module edits is named where a person or an agent looks next.
    expect(claudeMd).toContain("`mf-new-plugin` skill");
    expect(stdout).toContain("`mf-new-plugin` skill");
    // The top is the author's, about the feature; the generated part sits under its own heading.
    expect(readme.startsWith("# foo-plugin: storefront plugin of VirtoCommerce.Foo\n")).toBe(true);
    expect(readme).toContain("\n## Working on this plugin\n");
    expect(readme).not.toMatch(/^## (First run|Files|Rules)$/m);
    // The edits it leaves to a person or a skill are printed with their exact lines.
    expect(stdout).toContain(TARGETS_IMPORT);
    expect(stdout).toContain('<dependency id="VirtoCommerce.XFrontend"');
  });

  it("leaves a commented-out off switch on the module's own setting in plugin.config.ts", () => {
    const webDir = createModuleWebDir();
    const { status, stderr } = runScaffolderInModule("foo-plugin", webDir, ["--yes"]);
    expect(status, stderr).toBe(0);

    const config = readFileSync(join(webDir, "StorefrontApp", "plugin.config.ts"), "utf8");
    expect(config).toContain('  // when: settingEnabled("VirtoCommerce.Foo", "Foo.StorefrontPlugin.Enabled"),\n');
    const switchedOn = config
      .replace("{ definePluginManifest }", "{ definePluginManifest, settingEnabled }")
      .replace("// when:", "when:");
    const result = ts.transpileModule(switchedOn, { reportDiagnostics: true });
    expect(result.diagnostics ?? []).toEqual([]);
  });

  it("never edits the module's own files", () => {
    const webDir = createModuleWebDir();
    runScaffolderInModule("foo-plugin", webDir, ["--yes"]);

    expect(readFileSync(join(webDir, "module.manifest"), "utf8")).toBe(MODULE_MANIFEST);
    expect(readFileSync(join(webDir, "Foo.Web.csproj"), "utf8")).toBe(MODULE_CSPROJ);
  });

  it("refuses a module that already has a StorefrontApp, and changes nothing in it", () => {
    const webDir = createModuleWebDir();
    mkdirSync(join(webDir, "StorefrontApp"));
    writeFileSync(join(webDir, "StorefrontApp", "storefront-plugin.targets"), "hand-tuned");

    const { status, stderr } = runScaffolderInModule("foo-plugin", webDir, ["--yes"]);

    expect(status).not.toBe(0);
    expect(stderr).toContain("refusing to overwrite");
    expect(readFileSync(join(webDir, "StorefrontApp", "storefront-plugin.targets"), "utf8")).toBe("hand-tuned");
  });

  it("refuses a path that is not a module's *.Web project", () => {
    const parent = mkdtempSync(join(tmpdir(), "mf-not-module-"));
    tempDirs.push(parent);

    const { status, stderr } = runScaffolderInModule("foo-plugin", parent, ["--yes"]);

    expect(status).not.toBe(0);
    expect(stderr).toContain("module.manifest");
    expect(existsSync(join(parent, "StorefrontApp"))).toBe(false);
  });

  it("rejects a target directory next to --module", () => {
    const webDir = createModuleWebDir();

    const { status, stderr } = runScaffolderInModule("foo-plugin", webDir, ["--yes", "extra-dir"]);

    expect(status).not.toBe(0);
    expect(stderr).toContain("Unexpected argument");
  });
});
