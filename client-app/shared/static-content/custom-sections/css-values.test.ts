import { describe, expect, it } from "vitest";
import { decodeCssEscapes, findFunctionCalls, isAllowedValue } from "./css-values";

describe("decodeCssEscapes", () => {
  it("decodes hex and character escapes", () => {
    expect(decodeCssEscapes(String.raw`image-s\65 t( \(x\)`)).toBe("image-set( (x)");
  });
});

describe("findFunctionCalls", () => {
  it("reads each call's argument to its own parenthesis, past the ones in strings, nested calls included", () => {
    expect(findFunctionCalls('image-set(url("/a)b.png") 1x, var(--x))')).toEqual([
      { name: "image-set", argument: 'url("/a)b.png") 1x, var(--x)' },
      { name: "url", argument: '"/a)b.png"' },
      { name: "var", argument: "--x" },
    ]);
  });
});

describe("isAllowedValue", () => {
  const base = "https://cdn.example.com/assets";

  it.each([
    [`url("${base}/a)b.png")`, true],
    ["linear-gradient(var(--color-primary-500), transparent)", true],
    [`image-set("${base}/a.png" 1x)`, true],
    ["image-set(var(--x) 1x)", false],
    [`url(${base}/a.png)`, true],
    ["url(https://example.com/a.png)", false],
    ['image-set("/a.png" 1x)', false],
    ['url("data:image/png;base64,AAAA")', true],
    ["url(javascript:alert(1))", false],
    ["-moz-element(#secret)", false],
  ])("judges %s: %s", (value, isAllowed) => {
    expect(isAllowedValue(value, base)).toBe(isAllowed);
  });

  it.each([
    String.raw`url("${base}/\2e\2e/\2e\2e/other/a.png")`,
    String.raw`url(${base}/\2e\2e\2f\2e\2e\2fother/a.png)`,
    String.raw`image-set("${base}/../other/a.png" 1x)`,
  ])("refuses an image that steps out of the library, escapes decoded: %s", (value) => {
    expect(isAllowedValue(value, base)).toBe(false);
  });

  it("allows only inline images when the theme names no asset library", () => {
    expect(isAllowedValue(`url("${base}/a.png")`, undefined)).toBe(false);
    expect(isAllowedValue('url("data:image/png;base64,AAAA")', undefined)).toBe(true);
  });

  it("reads a long word in one pass, not one per letter", () => {
    const startedAt = performance.now();

    expect(isAllowedValue("a".repeat(60_000), base)).toBe(true);
    expect(performance.now() - startedAt).toBeLessThan(500);
  });
});
