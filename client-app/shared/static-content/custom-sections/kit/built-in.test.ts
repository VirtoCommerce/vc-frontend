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
});
