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
  it.each([
    ['url("/a)b.png")', true],
    ["linear-gradient(var(--color-primary-500), transparent)", true],
    ['image-set("/a.png" 1x)', true],
    ["image-set(var(--x) 1x)", false],
    ["url(https://example.com/a.png)", true],
    ["url(javascript:alert(1))", false],
    ["-moz-element(#secret)", false],
  ])("judges %s: %s", (value, isAllowed) => {
    expect(isAllowedValue(value)).toBe(isAllowed);
  });

  it("takes only the asset library's images, and inline ones, once the theme names the library", () => {
    const base = "https://cdn.example.com/assets/";

    expect(isAllowedValue(`url("${base}a.png")`, base)).toBe(true);
    expect(isAllowedValue('url("data:image/png;base64,AAAA")', base)).toBe(true);
    expect(isAllowedValue('url("https://example.com/a.png")', base)).toBe(false);
    expect(isAllowedValue('image-set("/a.png" 1x)', base)).toBe(false);
  });

  it("reads a long word in one pass, not one per letter", () => {
    const startedAt = performance.now();

    expect(isAllowedValue("a".repeat(60_000))).toBe(true);
    expect(performance.now() - startedAt).toBeLessThan(500);
  });
});
