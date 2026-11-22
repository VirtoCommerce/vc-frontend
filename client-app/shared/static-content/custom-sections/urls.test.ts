import { describe, expect, it } from "vitest";
import { toAssetSrcset, toAssetUrl, toSectionLink } from "./urls";

const BASE = "https://cdn.example.com/stores/b2b/assets";

describe("toAssetUrl", () => {
  it.each([
    [`${BASE}/hero.png`, true],
    [`${BASE}/team/../hero.png`, true],
    [`${BASE}-other/hero.png`, false],
    [`${BASE}/../../other/hero.png`, false],
    [`${BASE}/%2e%2e/%2e%2e/other/hero.png`, false],
    [`${BASE}/..%2F..%2Fother/hero.png`, false],
    [`${BASE}/..%5c..%5cother/hero.png`, false],
    ["https://evil.example/hero.png", false],
    ["/cms-content/assets/hero.png", false],
    ["//evil.example/hero.png", false],
    ["javascript:alert(1)", false],
  ])("takes only the asset library's images, read as the browser resolves them: %s → %s", (url, isKept) => {
    expect(toAssetUrl(url, BASE)).toBe(isKept ? `${BASE}/hero.png` : undefined);
  });

  it("gives the address it checked, so a relative path cannot load from another page's folder", () => {
    const library = new URL("/assets", document.baseURI).href;

    expect(toAssetUrl("assets/hero.png", library)).toBe(`${library}/hero.png`);
  });

  it("trims ASCII whitespace only, as the URL parser does", () => {
    expect(toAssetUrl(` ${BASE}/hero.png\t`, BASE)).toBe(`${BASE}/hero.png`);
    expect(toAssetUrl(`\u00A0${BASE}/hero.png`, BASE)).toBeUndefined();
  });

  it("takes no image when the theme names no asset library", () => {
    expect(toAssetUrl(`${BASE}/hero.png`, undefined)).toBeUndefined();
    expect(toAssetUrl("/cms-content/assets/hero.png", undefined)).toBeUndefined();
  });
});

describe("toSectionLink", () => {
  it.each([
    ["/catalog", "/catalog"],
    [" /catalog\n", "/catalog"],
    ["\u00A0/catalog", undefined],
    ["/\t/evil.example", undefined],
    ["/\n/evil.example", undefined],
  ])("reads %j as the link %j, trimmed of ASCII whitespace only", (value, link) => {
    expect(toSectionLink(value)).toBe(link);
  });
});

describe("toAssetSrcset", () => {
  it("drops the whole srcset when any candidate is not the asset library's", () => {
    expect(toAssetSrcset(`${BASE}/a.png 1x, ${BASE}/b.png 2x`, BASE)).toBe(`${BASE}/a.png 1x, ${BASE}/b.png 2x`);
    expect(toAssetSrcset(`${BASE}/a.png 1x, https://evil.example/b.png 2x`, BASE)).toBeUndefined();
    expect(toAssetSrcset(`${BASE}/a.png 1x, ${BASE}/../b.png 2x`, BASE)).toBeUndefined();
  });

  it("gives each candidate as the address it checked", () => {
    expect(toAssetSrcset(`${BASE}/team/../a.png 1x, ${BASE}/b.png 2x`, BASE)).toBe(
      `${BASE}/a.png 1x, ${BASE}/b.png 2x`,
    );
  });

  it("reads a candidate as the browser does, split on ASCII whitespace only", () => {
    expect(toAssetSrcset(`${BASE}/a.png\u00A0/../../x.png 2x`, BASE)).toBeUndefined();
    expect(toAssetSrcset(`${BASE}/a.png\t2x`, BASE)).toBe(`${BASE}/a.png 2x`);
    expect(toAssetSrcset(`\u00A0${BASE}/a.png 2x`, BASE)).toBeUndefined();
  });
});
