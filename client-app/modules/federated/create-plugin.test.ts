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

    for (const file of [
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "src/index.ts",
      "index.html",
      "public/plugin.json",
    ]) {
      expect(existsSync(join(dir, file)), `${file} should exist`).toBe(true);
    }

    // The platform reads this to learn the expose key; without it it assumes "./Module" and the
    // host would loadRemote a key this plugin does not export.
    const descriptor = JSON.parse(readFileSync(join(dir, "public", "plugin.json"), "utf8")) as {
      id: string;
      remote: { name: string; exposed: string };
    };
    expect(descriptor).toEqual({ id: "my-plugin", remote: { name: "my-plugin", exposed: "./plugin" } });

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

  it("rejects a non-kebab-case plugin name", () => {
    const { status, stderr } = runScaffolder("My_Plugin", ["--yes"]);
    expect(status).not.toBe(0);
    expect(stderr).toContain("kebab-case");
  });
});
