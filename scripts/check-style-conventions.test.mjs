import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { checkFile, stripComments, styleRanges } from "./check-style-conventions.mjs";

// Not `import.meta.url`: under the jsdom environment that resolves to an http:// URL, which
// fileURLToPath rejects. Vitest sets `root` to the repo root, so cwd is reliable here.
const SCRIPT = join(process.cwd(), "scripts/check-style-conventions.mjs");

let dir;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "style-conventions-"));
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

/** Writes `source` to a temp file with the given extension and returns the findings for it. */
function check(name, source) {
  const file = join(dir, name);

  writeFileSync(file, source);

  return checkFile(file);
}

const tokens = (findings) => findings.map((f) => f.token).sort();

describe("style ranges", () => {
  it("scans a whole .scss file", () => {
    expect(styleRanges("a { @apply ml-1; }", "x.scss")).toEqual([[0, 18]]);
  });

  it("scans only <style> blocks in a .vue file", () => {
    const src = '<template><div class="ml-4" /></template>\n<style>.a { @apply pl-2; }</style>';
    const [[start, end]] = styleRanges(src, "x.vue");

    expect(src.slice(start, end)).toBe(".a { @apply pl-2; }");
  });

  it("handles an unterminated <style> block without throwing", () => {
    expect(() => styleRanges("<style>.a { @apply pl-2;", "x.vue")).not.toThrow();
  });
});

describe("template vs style ownership", () => {
  // The template side is ESLint's job (vue/no-restricted-class). This script must stay out of it,
  // otherwise every violation gets reported twice.
  it("ignores physical utilities in a template class attribute", () => {
    const findings = check("template-only.vue", '<template><div class="ml-4 text-left rounded-lg" /></template>');

    expect(findings).toEqual([]);
  });

  it("reports the same utilities inside a <style> block", () => {
    const findings = check("style-block.vue", "<template><div /></template>\n<style>.a { @apply ml-4; }</style>");

    expect(tokens(findings)).toEqual(["ml-4"]);
  });
});

describe("variant prefixes", () => {
  // The bug that shipped first time round: `^ml-` never matches `xl:ml-4`.
  it("matches a breakpoint-prefixed utility", () => {
    expect(tokens(check("variant.scss", ".a { @apply xl:ml-4; }"))).toContain("xl:ml-4");
  });

  it("matches a state-prefixed utility", () => {
    expect(tokens(check("hover.scss", ".a { @apply hover:pr-2; }"))).toContain("hover:pr-2");
  });
});

describe("radius rules", () => {
  it.each(["rounded", "rounded-sm", "rounded-lg", "rounded-3xl"])("flags %s", (cls) => {
    expect(check("r.scss", `.a { @apply ${cls}; }`)).toHaveLength(1);
  });

  it.each(["rounded-full", "rounded-[--vc-radius]"])("allows %s", (cls) => {
    expect(check("r-ok.scss", `.a { @apply ${cls}; }`)).toEqual([]);
  });
});

describe("logical-property rules", () => {
  it.each([
    ["ml-4", 1],
    ["mr-4", 1],
    ["pl-2", 1],
    ["pr-2", 1],
    ["text-left", 1],
    ["text-right", 1],
    ["float-left", 1],
    ["border-l-2", 1],
    ["ms-4", 0],
    ["me-4", 0],
    ["ps-2", 0],
    ["text-start", 0],
    ["text-end", 0],
    ["float-start", 0],
    ["border-s-2", 0],
  ])("%s -> %i finding(s)", (cls, expected) => {
    expect(check("logical.scss", `.a { @apply ${cls}; }`)).toHaveLength(expected);
  });
});

describe("raw CSS declarations", () => {
  it.each(["margin-left: 4px", "padding-right: 2px", "border-left: 1px solid red", "text-align: right"])(
    "flags %s",
    (decl) => {
      expect(check("raw.scss", `.a { ${decl}; }`)).toHaveLength(1);
    },
  );

  it("allows the logical equivalents", () => {
    expect(
      check("raw-ok.scss", ".a { margin-inline-start: 4px; padding-inline-end: 2px; text-align: start; }"),
    ).toEqual([]);
  });
});

describe("responsive variants in @apply", () => {
  it("flags a breakpoint variant that belongs in an @media block", () => {
    const findings = check("resp.scss", ".a { @apply grid sm:grid-cols-2; }");

    expect(tokens(findings)).toContain("@apply <breakpoint>:");
  });

  it("does not flag a plain @apply", () => {
    expect(check("resp-ok.scss", ".a { @apply grid gap-4; }")).toEqual([]);
  });
});

describe("comments", () => {
  it("blanks comments while preserving offsets, so line numbers stay right", () => {
    const src = "/* ml-4 */\n.a { @apply pl-2; }";

    expect(stripComments(src)).toHaveLength(src.length);
  });

  it("ignores a commented-out violation", () => {
    expect(check("comment-block.scss", "/* .a { @apply ml-4; } */")).toEqual([]);
  });

  it("ignores a line-commented violation", () => {
    expect(check("comment-line.scss", "// .a { @apply ml-4; }")).toEqual([]);
  });
});

describe("reported line numbers", () => {
  it("points at the line the violation is on", () => {
    const findings = check("lines.scss", ".a {\n  color: red;\n}\n\n.b {\n  @apply pl-2;\n}\n");

    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(6);
  });

  it("accounts for the <template> above a .vue style block", () => {
    const findings = check(
      "lines.vue",
      "<template>\n  <div />\n</template>\n\n<style>\n.a {\n  @apply ml-1;\n}\n</style>\n",
    );

    expect(findings[0].line).toBe(7);
  });
});

// The --changed path needs a real repository, so this drives the CLI in a throwaway one.
describe("--changed only reports lines that differ from HEAD", () => {
  let repo;

  const git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" });
  const run = (...flags) => execFileSync("node", [SCRIPT, ...flags, "a.scss"], { cwd: repo, encoding: "utf8" });

  beforeAll(() => {
    repo = mkdtempSync(join(tmpdir(), "style-conventions-git-"));
    git("init", "--quiet");
    git("config", "user.email", "t@example.com");
    git("config", "user.name", "t");
    writeFileSync(join(repo, "a.scss"), ".legacy {\n  @apply ml-4;\n}\n");
    git("add", "a.scss");
    git("commit", "--quiet", "-m", "legacy violation");
  });

  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it("stays quiet when the committed violation is untouched", () => {
    expect(run("--changed")).toContain("no issues");
  });

  it("still reports it without the flag, so the full audit is unaffected", () => {
    expect(run()).toContain("ml-4");
  });

  it("reports only the newly added line", () => {
    writeFileSync(join(repo, "a.scss"), ".legacy {\n  @apply ml-4;\n}\n.fresh {\n  @apply pr-9;\n}\n");

    const out = run("--changed");

    expect(out).toContain("pr-9");
    expect(out).not.toContain("ml-4");
  });

  it("treats an untracked file as entirely new", () => {
    writeFileSync(join(repo, "a.scss"), ".legacy {\n  @apply ml-4;\n}\n");
    writeFileSync(join(repo, "b.scss"), ".b {\n  @apply pl-1;\n}\n");

    const out = execFileSync("node", [SCRIPT, "--changed", "b.scss"], { cwd: repo, encoding: "utf8" });

    expect(out).toContain("pl-1");
  });
});
