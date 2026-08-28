import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MAX_COMMENT_BLOCK_LINES, checkFile, commentBlocks, commentLines } from "./index.mjs";

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

  it("picks up html comments, single and multi-line", () => {
    expect(commentLines("<!-- one -->\n<div />\n<!--\n  two\n-->\n").map(([line]) => line)).toEqual([1, 3, 4, 5]);
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
    "// Switched to the grid layout.",
    "// Removed the old fallback since it is dead.",
    "// Reverted back to the previous version.",
    "// Not sure if this is the right place.",
    "// Hopefully this covers all the cases.",
    "// I've extracted this into a helper.",
    "// Commented out for testing.",
    "// Leaving the original implementation below in case.",
    "<!-- as requested, hide the badge -->",
  ])("flags %s", (comment) => {
    expect(check(`${comment}\nconst a = 1;\n`)).toHaveLength(1);
  });

  it("flags a narration line inside a multi-line html comment", () => {
    const findings = check("<!--\n  Switched to the grid layout.\n-->\n");

    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(2);
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
    "// Remove the specific filterValue from termValues",
    "// Update the reactive reference",
    "// undefined lets the server apply its default sort",
    "// TODO: https://virtocommerce.atlassian.net/browse/ST-5119",
  ])("allows %s", (comment) => {
    expect(check(`${comment}\nconst a = 1;\n`)).toEqual([]);
  });
});

describe("block length", () => {
  const body = (n, line = "prose") =>
    Array.from({ length: n }, (_, i) => `// ${line} ${i}`).join("\n") + "\nconst a = 1;\n";

  it(`allows a block of exactly ${MAX_COMMENT_BLOCK_LINES} lines`, () => {
    expect(check(body(MAX_COMMENT_BLOCK_LINES))).toEqual([]);
  });

  it("flags one line past the limit, reporting the block start", () => {
    const findings = check(body(MAX_COMMENT_BLOCK_LINES + 1));

    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(1);
    expect(findings[0].message).toContain(`${MAX_COMMENT_BLOCK_LINES + 1} lines`);
  });

  it.each([
    ["carrying tags", ["/**", " * Does a thing.", " * @param a - the input", " * @returns the output"]],
    ["of plain prose", ["/**", " * Does a thing."]],
  ])("exempts jsdoc %s, however long", (_label, doc) => {
    expect(
      check([...doc, ...Array.from({ length: 12 }, (_, i) => ` * more ${i}`), " */", "const a = 1;"].join("\n")),
    ).toEqual([]);
  });

  it("still reads the phrase rules inside an exempt jsdoc block", () => {
    const findings = check(["/**", " * @param a - the input", " * Switched to the batcher.", " */"].join("\n"));

    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(3);
  });

  it("does not exempt an ordinary block comment", () => {
    const block = ["/*", ...Array.from({ length: 8 }, (_, i) => ` prose ${i}`), "*/"].join("\n");

    expect(check(block)).toHaveLength(1);
  });

  it("measures blocks separately when code splits them", () => {
    // Two at-limit blocks that would exceed the limit if they were counted as one.
    const half = Array.from({ length: MAX_COMMENT_BLOCK_LINES }, (_, i) => `// x ${i}`).join("\n");

    expect(check(`${half}\nconst a = 1;\n${half}\n`)).toEqual([]);
  });

  it("groups only consecutive lines", () => {
    expect(
      commentBlocks([
        [1, "// a"],
        [2, "// b"],
        [7, "// c"],
      ]).map((b) => [b.start, b.end]),
    ).toEqual([
      [1, 2],
      [7, 7],
    ]);
  });
});

describe("reported position", () => {
  it("points at the offending line", () => {
    const findings = check("const a = 1;\n\n// for now, bail early\nconst b = 2;\n");

    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(3);
  });
});
