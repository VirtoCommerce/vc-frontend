import { describe, expect, it } from "vitest";
import { toAssetSrcset, toAssetUrl } from "./urls";

const BASE = "https://cdn.example.com/stores/b2b/assets";

describe("toAssetUrl", () => {
  it.each([
    [`${BASE}/hero.png`, true],
    [`${BASE}-other/hero.png`, false],
    ["https://evil.example/hero.png", false],
    ["/cms-content/assets/hero.png", false],
  ])("takes only the asset library's images once the theme names it: %s → %s", (url, isKept) => {
    expect(toAssetUrl(url, BASE)).toBe(isKept ? url : undefined);
  });

  it.each([
    ["/cms-content/assets/hero.png", true],
    ["https://cdn.example.com/hero.png", true],
    ["//evil.example/hero.png", false],
    ["javascript:alert(1)", false],
  ])("keeps the older rule for a theme that does not name it: %s → %s", (url, isKept) => {
    expect(toAssetUrl(url)).toBe(isKept ? url : undefined);
  });
});

describe("toAssetSrcset", () => {
  it("drops the whole srcset when any candidate is not the asset library's", () => {
    expect(toAssetSrcset(`${BASE}/a.png 1x, ${BASE}/b.png 2x`, BASE)).toBe(`${BASE}/a.png 1x, ${BASE}/b.png 2x`);
    expect(toAssetSrcset(`${BASE}/a.png 1x, https://evil.example/b.png 2x`, BASE)).toBeUndefined();
  });
});
