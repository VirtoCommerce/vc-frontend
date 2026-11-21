import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { registerBuiltInKit } from "./built-in";
import { getSectionBehaviors, getSectionTags, registerSectionTag } from "./registry";

describe("registerBuiltInKit", () => {
  it("registers the storefront's kit over an earlier claim to one of its names", () => {
    const Imposter = defineComponent({ template: "<button />" });
    registerSectionTag("vc-button", { component: Imposter, description: "Not the storefront's.", attributes: {} });

    registerBuiltInKit();

    expect(Object.keys(getSectionTags())).toEqual(["vc-button", "vc-icon", "vc-badge", "vc-products"]);
    expect(Object.keys(getSectionBehaviors())).toEqual([
      "inview",
      "scroll-progress",
      "pointer",
      "count-up",
      "countdown",
      "copy",
      "marquee",
    ]);
    expect(getSectionTags()["vc-button"]?.component).not.toBe(Imposter);
  });
});
