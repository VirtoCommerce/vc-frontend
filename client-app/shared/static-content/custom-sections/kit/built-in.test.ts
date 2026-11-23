import { describe, expect, it } from "vitest";
import { registerBuiltInKit } from "./built-in";
import {
  BUILT_IN_BEHAVIOR_NAMES,
  BUILT_IN_TAG_NAMES,
  getBehaviorShapeRefusal,
  getCustomSectionBehaviors,
  getCustomSectionTags,
  getTagShapeRefusal,
  unregisterCustomSectionTag,
} from "./registry";

describe("registerBuiltInKit", () => {
  it("registers the storefront's kit under its reserved names, which nobody can remove", () => {
    registerBuiltInKit();
    unregisterCustomSectionTag("vc-button");

    expect(Object.keys(getCustomSectionTags())).toEqual([...BUILT_IN_TAG_NAMES]);
    expect(Object.keys(getCustomSectionBehaviors())).toEqual([...BUILT_IN_BEHAVIOR_NAMES]);
  });

  it("holds the storefront's own tags and behaviors to the shapes the server takes, as a plugin's", () => {
    registerBuiltInKit();

    expect(Object.entries(getCustomSectionTags()).map(([name, tag]) => [name, getTagShapeRefusal(tag)])).toEqual(
      BUILT_IN_TAG_NAMES.map((name) => [name, undefined]),
    );
    expect(
      Object.entries(getCustomSectionBehaviors()).map(([name, behavior]) => [
        name,
        getBehaviorShapeRefusal(name, behavior),
      ]),
    ).toEqual(BUILT_IN_BEHAVIOR_NAMES.map((name) => [name, undefined]));
  });

  it("tells the agent the facts and defaults it writes by", () => {
    registerBuiltInKit();
    const tags = getCustomSectionTags();
    const behaviors = getCustomSectionBehaviors();

    expect(tags["vc-button"].description).toContain("without `to` it does nothing");
    expect(tags["vc-icon"].attributes.size.description).toContain("a whole number of pixels, such as 24");
    expect(tags["vc-products"].attributes.view.description).toContain("grid by default");
    expect(tags["vc-image"].description).toContain("put it under data-if when its setting may be unset");
    expect(tags["vc-image"].attributes.alt.description).toContain('"" (the default)');
    expect(tags["vc-rating"].attributes["with-text"].description).toContain('on unless written "false"');
    expect(tags["vc-shape"].attributes.size.description).toContain("40 by default");
    expect(tags["vc-typography"].attributes.tag.options).not.toContain("h1");
    expect(behaviors["count-up"].options?.duration.description).toContain("1500 by default");
    expect(behaviors["count-up"].options?.decimals.description).toContain("0 by default");
    expect(behaviors.copy.description).toMatch(/Enter or Space.*button.*says nothing/);
  });
});
