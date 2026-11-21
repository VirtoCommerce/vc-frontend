import { describe, expect, it } from "vitest";
import { registerBuiltInKit } from "./built-in";
import {
  BUILT_IN_BEHAVIOR_NAMES,
  BUILT_IN_TAG_NAMES,
  getCustomSectionBehaviors,
  getCustomSectionTags,
  unregisterCustomSectionTag,
} from "./registry";

describe("registerBuiltInKit", () => {
  it("registers the storefront's kit under its reserved names, which nobody can remove", () => {
    registerBuiltInKit();
    unregisterCustomSectionTag("vc-button");

    expect(Object.keys(getCustomSectionTags())).toEqual([...BUILT_IN_TAG_NAMES]);
    expect(Object.keys(getCustomSectionBehaviors())).toEqual([...BUILT_IN_BEHAVIOR_NAMES]);
  });
});
