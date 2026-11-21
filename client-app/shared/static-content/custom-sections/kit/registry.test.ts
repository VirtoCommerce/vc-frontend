import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { Logger } from "@/core/utilities";
import {
  getSectionBehaviors,
  getSectionTags,
  registerBuiltInKitEntries,
  registerSectionBehavior,
  registerSectionTag,
  unregisterSectionBehavior,
  unregisterSectionTag,
} from "./registry";
import type { ICustomSectionBehavior, ICustomSectionTag } from "../types";

const TAG: ICustomSectionTag = {
  component: defineComponent({ template: "<div />" }),
  description: "Stars.",
  attributes: { value: { type: "number" } },
};
const BEHAVIOR: ICustomSectionBehavior = { directive: () => Promise.resolve({}), description: "Glows." };

describe("the kit registry", () => {
  beforeEach(() => {
    vi.spyOn(Logger, "warn").mockImplementation(() => undefined);
    Object.keys(getSectionTags()).forEach(unregisterSectionTag);
    Object.keys(getSectionBehaviors()).forEach(unregisterSectionBehavior);
  });

  it("takes a tag named vc-* and keeps the first registration of a name", () => {
    const other = { ...TAG, description: "Other." };

    registerSectionTag("vc-rating", TAG);
    registerSectionTag("vc-rating", other);
    registerSectionTag("rating", TAG);
    registerSectionTag("vc-Rating", TAG);

    expect(getSectionTags()).toEqual({ "vc-rating": TAG });
    expect(Logger.warn).toHaveBeenCalledWith('registerSectionTag: "rating" is not a kit tag name; ignoring.');
  });

  it.each([
    "onclick",
    "style",
    "id",
    "is",
    "class",
    "srcdoc",
    "formaction",
    "popovertarget",
    "ping",
    "srcset",
    "poster",
    "action",
  ])("refuses a tag that takes the attribute %s", (attribute) => {
    registerSectionTag("vc-promo", { ...TAG, attributes: { [attribute]: { type: "string" } } });

    expect(getSectionTags()).toEqual({});
  });

  it("takes a behavior by a name no template attribute of its own uses", () => {
    ["glow", "each", "if", "html", "sb-type", "pb-field", "Glow"].forEach((name) =>
      registerSectionBehavior(name, BEHAVIOR),
    );

    expect(getSectionBehaviors()).toEqual({ glow: BEHAVIOR });
  });

  it("refuses a behavior whose attributes another behavior writes", () => {
    registerSectionBehavior("glow", { ...BEHAVIOR, options: { color: { type: "string" } } });

    registerSectionBehavior("glow-color", BEHAVIOR);
    registerSectionBehavior("shine", { ...BEHAVIOR, options: { up: { type: "string" } } });
    registerSectionBehavior("count", { ...BEHAVIOR, options: { up: { type: "string" } } });
    registerSectionBehavior("inview-delay", BEHAVIOR);

    expect(Object.keys(getSectionBehaviors())).toEqual(["glow", "shine"]);
  });

  it("refuses the storefront's own names to anyone else, and keeps its entries from removal", () => {
    const own = { ...TAG, description: "The storefront's button." };

    registerSectionTag("vc-button", TAG);
    registerSectionBehavior("count-up", BEHAVIOR);
    registerBuiltInKitEntries({ "vc-button": own }, {});
    unregisterSectionTag("vc-button");

    expect(getSectionTags()["vc-button"]).toBe(own);
    expect(getSectionBehaviors()["count-up"]).toBeUndefined();
  });
});
