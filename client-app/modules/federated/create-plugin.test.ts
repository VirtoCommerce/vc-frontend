// @vitest-environment node
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";

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

    for (const file of ["package.json", "vite.config.ts", "tsconfig.json", "src/index.ts", "index.html"]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      name: string;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.name).toBe("my-plugin");
    expect(pkg.dependencies["@vc-frontend/core"]).toContain("releases/download/core-v");
    // Type-peers are unconditional — without them facade types silently resolve to `any`.
    expect(pkg.devDependencies).toHaveProperty("@vueuse/core");
    JSON.parse(readFileSync(join(dir, "tsconfig.json"), "utf8"));

    expectParseableTs(join(dir, "vite.config.ts"));
    expectParseableTs(join(dir, "src", "index.ts"));

    // Default = router on: the route page and the addRoute init must be generated.
    expect(existsSync(join(dir, "src", "pages", "my-page.vue"))).toBe(true);
    expect(readFileSync(join(dir, "src", "index.ts"), "utf8")).toContain("globals.router.addRoute");
    // Unused optional groups must be dropped from MF shared (spurious-gate protection).
    expect(readFileSync(join(dir, "vite.config.ts"), "utf8")).toContain('"@apollo/client": false');
  });

  it("scaffolds lint/format/git-hook tooling by default, and skips it all with --no-lint", () => {
    const dir = scaffoldExpectingSuccess("lint-plugin", ["--yes"]);

    for (const file of [
      "eslint.config.js",
      ".prettierrc.json",
      ".prettierignore",
      ".editorconfig",
      ".commitlintrc.cjs",
      ".vscode/settings.json",
      ".husky/pre-commit",
      ".husky/commit-msg",
    ]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.devDependencies).toHaveProperty("eslint");
    expect(pkg.devDependencies).toHaveProperty("utility-types");
    expect(pkg.devDependencies).toHaveProperty("maska");
    expect(pkg.scripts).toHaveProperty("lint");
    expectParseableTs(join(dir, "eslint.config.js"));
    // The scaffold's own emitted files must lint clean: .cjs configs use require()
    // by design, and `_`-prefixed unused args are the sanctioned convention.
    const eslintCfg = readFileSync(join(dir, "eslint.config.js"), "utf8");
    expect(eslintCfg).toContain("no-require-imports");
    expect(eslintCfg).toContain("argsIgnorePattern");

    const noLintDir = scaffoldExpectingSuccess("no-lint-plugin", ["--yes", "--no-lint"]);
    for (const file of [
      "eslint.config.js",
      ".prettierrc.json",
      ".prettierignore",
      ".editorconfig",
      ".commitlintrc.cjs",
      ".vscode/settings.json",
      ".husky/pre-commit",
      ".husky/commit-msg",
    ]) {
      expect(existsSync(join(noLintDir, file)), `${file} should NOT exist`).toBe(false);
    }
    const noLintPkg = JSON.parse(readFileSync(join(noLintDir, "package.json"), "utf8"));
    expect(noLintPkg.devDependencies).not.toHaveProperty("eslint");
    expect(noLintPkg.devDependencies).toHaveProperty("utility-types");
    expect(noLintPkg.devDependencies).toHaveProperty("maska");
    expect(noLintPkg.scripts).not.toHaveProperty("lint");
    expect(noLintPkg).not.toHaveProperty("lint-staged");
  });

  it("scaffolds the tailwind variant with the config/styles files", () => {
    const dir = scaffoldExpectingSuccess("tw-plugin", ["--yes", "--with-tailwind"]);

    for (const file of ["tailwind.config.cjs", "postcss.config.cjs", "src/styles.css"]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }
    expect(readFileSync(join(dir, "src", "index.ts"), "utf8")).toContain('import "./styles.css"');

    // Isolation is via Vue scoped styles, NOT a global utility layer: the config must not
    // set an `important` scope, styles.css must not emit `@tailwind utilities`, and the
    // demo page must carry a <style scoped> block.
    expect(readFileSync(join(dir, "tailwind.config.cjs"), "utf8")).not.toContain("important:");
    expect(readFileSync(join(dir, "src", "styles.css"), "utf8")).not.toMatch(/^@tailwind/m);
    expect(readFileSync(join(dir, "src", "pages", "my-page.vue"), "utf8")).toContain("<style scoped>");
  });

  it("scaffolds vitest tooling by default, and skips it all with --no-test", () => {
    const dir = scaffoldExpectingSuccess("test-plugin", ["--yes"]);

    for (const file of ["vitest.config.ts", "src/mocks/vc-frontend-core.ts"]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.devDependencies).toHaveProperty("vitest");
    expect(pkg.devDependencies).toHaveProperty("@vue/test-utils");
    expect(pkg.devDependencies).toHaveProperty("jsdom");
    expect(pkg.scripts).toHaveProperty("test", "vitest run");
    expect(pkg.scripts).toHaveProperty("test:watch", "vitest");
    expectParseableTs(join(dir, "vitest.config.ts"));
    expectParseableTs(join(dir, "src", "mocks", "vc-frontend-core.ts"));

    const noTestDir = scaffoldExpectingSuccess("no-test-plugin", ["--yes", "--no-test"]);
    for (const file of ["vitest.config.ts", "src/mocks/vc-frontend-core.ts"]) {
      expect(existsSync(join(noTestDir, file)), `${file} should NOT exist`).toBe(false);
    }
    const noTestPkg = JSON.parse(readFileSync(join(noTestDir, "package.json"), "utf8"));
    expect(noTestPkg.devDependencies).not.toHaveProperty("vitest");
    expect(noTestPkg.devDependencies).not.toHaveProperty("jsdom");
    expect(noTestPkg.scripts).not.toHaveProperty("test");
    expect(noTestPkg.scripts).not.toHaveProperty("test:watch");
  });

  it("scaffolds GraphQL codegen tooling with --with-apollo, and skips it without", () => {
    const dir = scaffoldExpectingSuccess("gql-plugin", ["--yes", "--with-apollo"]);

    for (const file of ["codegen.ts", ".env.example", "src/api/graphql/queries/.gitkeep"]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.scripts).toHaveProperty("generate:graphql-types");
    expect(pkg.devDependencies).toHaveProperty("@graphql-codegen/cli");
    // Generated types import it directly — relying on hoisting from @apollo/client is fragile.
    expect(pkg.devDependencies).toHaveProperty("@graphql-typed-document-node/core");
    expectParseableTs(join(dir, "codegen.ts"));
    const codegen = readFileSync(join(dir, "codegen.ts"), "utf8");
    // Scoped-schema convention: /graphql/<plugin-name>, correctable via the TODO comment.
    expect(codegen).toContain("/graphql/gql-plugin");
    // codegen-cli does not read .env itself — the config must load it and fail loudly.
    expect(codegen).toContain("APP_BACKEND_URL");
    expect(codegen).toContain("loadEnv");

    const plainDir = scaffoldExpectingSuccess("plain-plugin", ["--yes"]);
    for (const file of ["codegen.ts", ".env.example"]) {
      expect(existsSync(join(plainDir, file)), `${file} should NOT exist`).toBe(false);
    }
    const plainPkg = JSON.parse(readFileSync(join(plainDir, "package.json"), "utf8"));
    expect(plainPkg.scripts).not.toHaveProperty("generate:graphql-types");
    expect(plainPkg.devDependencies).not.toHaveProperty("@graphql-codegen/cli");
  });

  it("gitignores .env and yarn install state regardless of selected groups", () => {
    // .env may carry a real backend URL (and one day credentials); it must never be
    // committable from a scaffolded project, whether or not codegen was selected.
    const dir = scaffoldExpectingSuccess("env-plugin", ["--yes"]);
    const gitignore = readFileSync(join(dir, ".gitignore"), "utf8");
    expect(gitignore).toContain(".env");
    // Yarn 4 writes .yarn/install-state.gz even with nodeLinker: node-modules.
    expect(gitignore).toContain(".yarn/*");
    expect(gitignore).toContain("coverage/");
  });

  it("excludes generated GraphQL types from lint and format with --with-apollo", () => {
    // Mirrors the host: codegen output is not linted/formatted (eslint.config.js and
    // .prettierignore both carry the generated-types path).
    const dir = scaffoldExpectingSuccess("gql-ignore-plugin", ["--yes", "--with-apollo"]);
    expect(readFileSync(join(dir, "eslint.config.js"), "utf8")).toContain("src/api/graphql/types.ts");
    expect(readFileSync(join(dir, ".prettierignore"), "utf8")).toContain("src/api/graphql/types.ts");

    const plainDir = scaffoldExpectingSuccess("plain-ignore-plugin", ["--yes"]);
    expect(readFileSync(join(plainDir, "eslint.config.js"), "utf8")).not.toContain("src/api/graphql/types.ts");
    expect(readFileSync(join(plainDir, ".prettierignore"), "utf8")).not.toContain("src/api/graphql/types.ts");
  });

  it("README documents scripts and workflows matching the selected groups", () => {
    const dir = scaffoldExpectingSuccess("readme-plugin", ["--yes", "--with-apollo"]);
    const readme = readFileSync(join(dir, "README.md"), "utf8");
    expect(readme).toContain("generate:graphql-types");
    expect(readme).toContain("APP_BACKEND_URL");
    expect(readme).toContain("APP_MODULES_FEDERATION_REMOTES");
    expect(readme).toContain("requiredHostVersion");
    expect(readme).toContain("yarn test");

    const plainDir = scaffoldExpectingSuccess("readme-plain", ["--yes", "--no-test"]);
    const plainReadme = readFileSync(join(plainDir, "README.md"), "utf8");
    expect(plainReadme).not.toContain("generate:graphql-types");
    expect(plainReadme).not.toContain("yarn test");
    // Evergreen sections are unconditional.
    expect(plainReadme).toContain("APP_MODULES_FEDERATION_REMOTES");
    expect(plainReadme).toContain("requiredHostVersion");
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

  it("rejects a non-kebab-case plugin name", () => {
    const { status, stderr } = runScaffolder("My_Plugin", ["--yes"]);
    expect(status).not.toBe(0);
    expect(stderr).toContain("kebab-case");
  });
});
