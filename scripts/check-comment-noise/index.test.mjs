import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { checkFile, commentLines } from "./index.mjs";

let dir;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "comment-noise-"));
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

function check(source) {
  const file = join(dir, "f.ts");

  writeFileSync(file, source);

  return checkFile(file);
}

describe("comment extraction", () => {
  it("picks up line and block comments", () => {
    expect(commentLines("// one\nconst a = 1;\n/* two */\n")).toEqual([
      [1, "// one"],
      [3, "/* two */"],
    ]);
  });

  it("follows a multi-line block to its end", () => {
    expect(commentLines("/**\n * body\n */\nconst a = 1;\n").map(([line]) => line)).toEqual([1, 2, 3]);
  });

  it("ignores code", () => {
    expect(commentLines("const url = 'https://x/y';\n")).toEqual([]);
  });
});

describe("session-only comments are flagged", () => {
  it.each([
    "// as requested, keep the old path",
    "// as we discussed, this stays",
    "// per review, renamed the prop",
    "// per your comment above",
    "// skipping validation for now",
    "/* temporary workaround */",
    "// temp fix until the API lands",
    "// no longer needed",
    "// keeping this for now",
    "// note to self: revisit",
    "// WAS: return null",
    "// CHANGED: use the batcher",
  ])("flags %s", (comment) => {
    expect(check(`${comment}\nconst a = 1;\n`)).toHaveLength(1);
  });
});

describe("comments that earn their place are left alone", () => {
  it.each([
    "// Maps platform status codes to the labels the design uses.",
    "// Apollo writes the whole cart on every response, so batching avoids a lost update.",
    "// Before that, the FOUC script in index.html manages the class.",
    "/* After field stripping, prunes fragments that are no longer referenced. */",
    "// ADDED via overrides must get identical semantics.",
    "// NEW CARD START",
    "// 3rd arg used to be the culture name.",
    "// Called when an in-flight request settles, if a flush was requested.",
    "/** A set of temporary ids assigned before the server responds. */",
  ])("allows %s", (comment) => {
    expect(check(`${comment}\nconst a = 1;\n`)).toEqual([]);
  });
});

describe("reported position", () => {
  it("points at the offending line", () => {
    const findings = check("const a = 1;\n\n// for now, bail early\nconst b = 2;\n");

    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(3);
  });
});
