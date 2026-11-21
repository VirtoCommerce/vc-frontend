import { describe, expect, it } from "vitest";
import { toAssetSrcset, toAssetUrl } from "./urls";

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
    expect(toAssetUrl(url, BASE)).toBe(isKept ? url : undefined);
  });

  it("takes no image when the theme names no asset library", () => {
    expect(toAssetUrl(`${BASE}/hero.png`, undefined)).toBeUndefined();
    expect(toAssetUrl("/cms-content/assets/hero.png", undefined)).toBeUndefined();
  });
});

describe("toAssetSrcset", () => {
  it("drops the whole srcset when any candidate is not the asset library's", () => {
    expect(toAssetSrcset(`${BASE}/a.png 1x, ${BASE}/b.png 2x`, BASE)).toBe(`${BASE}/a.png 1x, ${BASE}/b.png 2x`);
    expect(toAssetSrcset(`${BASE}/a.png 1x, https://evil.example/b.png 2x`, BASE)).toBeUndefined();
    expect(toAssetSrcset(`${BASE}/a.png 1x, ${BASE}/../b.png 2x`, BASE)).toBeUndefined();
  });
});
