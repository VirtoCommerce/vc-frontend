import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { Logger } from "@/core/utilities";
import {
  getCustomSectionBehaviors,
  getCustomSectionTags,
  getBehaviorAttributeNames,
  registerCustomSectionBehavior,
  registerCustomSectionTag,
  unregisterCustomSectionBehavior,
  unregisterCustomSectionTag,
} from "./registry";
import type { ICustomSectionBehavior, ICustomSectionField, ICustomSectionTag } from "../types";

const TAG: ICustomSectionTag = {
  component: defineComponent({ template: "<div />" }),
  description: "Stars.",
  attributes: { value: { type: "number" } },
};
const BEHAVIOR: ICustomSectionBehavior = { directive: () => Promise.resolve({}), description: "Glows." };

describe("the kit registry", () => {
  beforeEach(() => {
    vi.spyOn(Logger, "warn").mockImplementation(() => undefined);
    Object.keys(getCustomSectionTags()).forEach(unregisterCustomSectionTag);
    Object.keys(getCustomSectionBehaviors()).forEach(unregisterCustomSectionBehavior);
  });

  it("takes a tag named vc-* and keeps the first registration of a name", () => {
    const other = { ...TAG, description: "Other." };

    registerCustomSectionTag("vc-rating", TAG);
    registerCustomSectionTag("vc-rating", other);
    registerCustomSectionTag("rating", TAG);
    registerCustomSectionTag("vc-Rating", TAG);

    expect(getCustomSectionTags()).toEqual({ "vc-rating": TAG });
    expect(Logger.warn).toHaveBeenCalledWith('registerCustomSectionTag: "rating" is not a kit tag name; ignoring.');
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
    registerCustomSectionTag("vc-promo", { ...TAG, attributes: { [attribute]: { type: "string" } } });

    expect(getCustomSectionTags()).toEqual({});
  });

  it.each<[string, unknown]>([
    ["an unknown type", { type: "url" }],
    ["an extra key", { type: "string", label: "Value" }],
    ["options that are not strings", { type: "select", options: [1, 2] }],
    ["optionsFrom on a string", { type: "string", optionsFrom: "icons" }],
    ["another optionsFrom", { type: "select", optionsFrom: "colors" }],
    ["a min that is not a number", { type: "number", min: "1" }],
    ["a description that is not text", { type: "string", description: 42 }],
    ["a description too long", { type: "string", description: "x".repeat(501) }],
  ])("refuses a field with %s, as the server would refuse the whole kit for it", (_, field) => {
    registerCustomSectionTag("vc-promo", { ...TAG, attributes: { label: field as ICustomSectionField } });
    registerCustomSectionBehavior("glow", { ...BEHAVIOR, options: { color: field as ICustomSectionField } });
    registerCustomSectionBehavior("shine", { ...BEHAVIOR, value: field as ICustomSectionField });

    expect(getCustomSectionTags()).toEqual({});
    expect(getCustomSectionBehaviors()).toEqual({});
  });

  it("takes a field of every shape the server reads", () => {
    registerCustomSectionTag("vc-promo", {
      ...TAG,
      attributes: {
        icon: { type: "select", optionsFrom: "icons", description: "An icon." },
        size: { type: "select", options: ["sm", "lg"] },
        count: { type: "number", min: 1, max: 9 },
        enabled: { type: "boolean" },
        to: { type: "link" },
        until: { type: "date" },
      },
    });

    expect(Object.keys(getCustomSectionTags())).toEqual(["vc-promo"]);
  });

  it("takes a behavior by a name no template attribute of its own uses", () => {
    ["glow", "each", "if", "html", "sb-type", "pb-field", "Glow"].forEach((name) =>
      registerCustomSectionBehavior(name, BEHAVIOR),
    );

    expect(getCustomSectionBehaviors()).toEqual({ glow: BEHAVIOR });
  });

  it("refuses a behavior whose attributes another behavior writes", () => {
    registerCustomSectionBehavior("glow", { ...BEHAVIOR, options: { color: { type: "string" } } });

    registerCustomSectionBehavior("glow-color", BEHAVIOR);
    registerCustomSectionBehavior("shine", { ...BEHAVIOR, options: { up: { type: "string" } } });
    registerCustomSectionBehavior("count", { ...BEHAVIOR, options: { up: { type: "string" } } });
    registerCustomSectionBehavior("inview-delay", BEHAVIOR);

    expect(Object.keys(getCustomSectionBehaviors())).toEqual(["glow", "shine"]);
  });

  it("refuses the storefront's own names to anyone else", () => {
    registerCustomSectionTag("vc-button", TAG);
    registerCustomSectionBehavior("count-up", BEHAVIOR);

    expect(getCustomSectionTags()).toEqual({});
    expect(getCustomSectionBehaviors()).toEqual({});
  });

  it("names a behavior's attributes, its own first", () => {
    expect(getBehaviorAttributeNames("glow", { ...BEHAVIOR, options: { color: { type: "string" } } })).toEqual([
      "data-glow",
      "data-glow-color",
    ]);
  });
});
