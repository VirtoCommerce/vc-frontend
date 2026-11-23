import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { Logger } from "@/core/utilities";
import {
  BUILT_IN_BEHAVIOR_NAMES,
  BUILT_IN_TAG_NAMES,
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

function toFields(count: number): Record<string, ICustomSectionField> {
  return Object.fromEntries(Array.from({ length: count }, (_, index) => [`field-${index}`, { type: "string" }]));
}

function toOptions(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `option-${index}`);
}

describe("the kit registry", () => {
  beforeEach(() => {
    vi.spyOn(Logger, "warn").mockImplementation(() => undefined);
    Object.keys(getCustomSectionTags()).forEach(unregisterCustomSectionTag);
    Object.keys(getCustomSectionBehaviors()).forEach(unregisterCustomSectionBehavior);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("takes a tag named vc-* and keeps the first registration of a name", () => {
    const other = { ...TAG, description: "Other." };

    registerCustomSectionTag("vc-stars", TAG);
    registerCustomSectionTag("vc-stars", other);
    registerCustomSectionTag("rating", TAG);
    registerCustomSectionTag("vc-Rating", TAG);

    expect(getCustomSectionTags()).toEqual({ "vc-stars": TAG });
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
    "data-each",
    "data-if",
    "data-html",
    "data-sb",
    "data-sb-type",
    "data-pb-field",
    "command",
    "commandfor",
    "interestfor",
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
    ["a max out of the server's range", { type: "number", max: 1e29 }],
    ["a min that is not finite", { type: "number", min: Number.NEGATIVE_INFINITY }],
    ["a description that is not text", { type: "string", description: 42 }],
    ["a description too long", { type: "string", description: "x".repeat(1025) }],
  ])("refuses a field with %s, as the server would refuse the whole kit for it", (_, field) => {
    registerCustomSectionTag("vc-promo", { ...TAG, attributes: { label: field as ICustomSectionField } });
    registerCustomSectionBehavior("glow", { ...BEHAVIOR, options: { color: field as ICustomSectionField } });
    registerCustomSectionBehavior("shine", { ...BEHAVIOR, value: field as ICustomSectionField });

    expect(getCustomSectionTags()).toEqual({});
    expect(getCustomSectionBehaviors()).toEqual({});
  });

  it.each([0, 1.5, 5001, Number.NaN, "2"])("refuses a tag whose cost is %s", (cost) => {
    registerCustomSectionTag("vc-promo", { ...TAG, cost: cost as number });

    expect(getCustomSectionTags()).toEqual({});
  });

  it("refuses a tag whose hasSideEffects is not true or false", () => {
    registerCustomSectionTag("vc-promo", { ...TAG, hasSideEffects: "yes" as unknown as boolean });

    expect(getCustomSectionTags()).toEqual({});
  });

  it.each([1, 5000])("takes a tag that costs %s, a whole number of elements within the render budget", (cost) => {
    registerCustomSectionTag("vc-promo", { ...TAG, cost });

    expect(getCustomSectionTags()["vc-promo"]?.cost).toBe(cost);
  });

  it("takes a tag and a behavior exactly at the server's caps", () => {
    const options = Array.from({ length: 256 }, (_, index) => String(index).padStart(256, "x"));
    const tag: ICustomSectionTag = {
      ...TAG,
      attributes: { ...toFields(63), [`a${"b".repeat(63)}`]: { type: "select", options } },
    };
    const behavior: ICustomSectionBehavior = {
      ...BEHAVIOR,
      value: { type: "string" },
      options: toFields(63),
      writes: Array.from({ length: 32 }, (_, index) => `--${String(index).padStart(126, "w")}`),
    };

    registerCustomSectionTag(`vc-${"a".repeat(61)}`, tag);
    registerCustomSectionBehavior(`g${"a".repeat(63)}`, behavior);

    expect([Object.keys(getCustomSectionTags()), Object.keys(getCustomSectionBehaviors())]).toEqual([
      [`vc-${"a".repeat(61)}`],
      [`g${"a".repeat(63)}`],
    ]);
  });

  it.each<[string, Partial<ICustomSectionTag>]>([
    ["more than 64 attributes", { attributes: toFields(65) }],
    ["an attribute name longer than 64 characters", { attributes: { [`a${"b".repeat(64)}`]: { type: "string" } } }],
    ["a select of more than 256 options", { attributes: { size: { type: "select", options: toOptions(257) } } }],
    ["an option longer than 256 characters", { attributes: { size: { type: "select", options: ["x".repeat(257)] } } }],
  ])("refuses a tag with %s, past the server's caps", (_, shape) => {
    registerCustomSectionTag("vc-promo", { ...TAG, ...shape });

    expect(getCustomSectionTags()).toEqual({});
  });

  it.each<[string, Partial<ICustomSectionBehavior>]>([
    ["a value and 64 options", { value: { type: "string" }, options: toFields(64) }],
    ["more than 32 writes", { writes: Array.from({ length: 33 }, (_, index) => `--w${index}`) }],
    ["a write longer than 128 characters", { writes: [`--${"w".repeat(127)}`] }],
  ])("refuses a behavior with %s, past the server's caps", (_, shape) => {
    registerCustomSectionBehavior("glow", { ...BEHAVIOR, ...shape });

    expect(getCustomSectionBehaviors()).toEqual({});
  });

  it("refuses a name longer than 64 characters", () => {
    registerCustomSectionTag(`vc-${"a".repeat(62)}`, TAG);
    registerCustomSectionBehavior(`g${"a".repeat(64)}`, BEHAVIOR);

    expect([getCustomSectionTags(), getCustomSectionBehaviors()]).toEqual([{}, {}]);
  });

  it("keeps room for the storefront's own tags and behaviors within the server's caps of 256 each", () => {
    for (let index = 0; index < 253; index++) {
      registerCustomSectionTag(`vc-tag-${index}`, TAG);
      registerCustomSectionBehavior(`glow-${index}`, BEHAVIOR);
    }

    expect([Object.keys(getCustomSectionTags()).length, Object.keys(getCustomSectionBehaviors()).length]).toEqual([
      256 - BUILT_IN_TAG_NAMES.length,
      256 - BUILT_IN_BEHAVIOR_NAMES.length,
    ]);
  });

  it("refuses a select with neither options nor optionsFrom, whose value nothing could fit", () => {
    registerCustomSectionTag("vc-promo", { ...TAG, attributes: { size: { type: "select" } } });

    expect(getCustomSectionTags()).toEqual({});
  });

  it.each<[string, Partial<ICustomSectionBehavior>]>([
    ["writes that are not a list of names", { writes: ["text", 1] as string[] }],
    ["a repeatsChildren that is not true or false", { repeatsChildren: "yes" as unknown as boolean }],
  ])("refuses a behavior with %s, as the server would refuse the whole kit for it", (_, shape) => {
    registerCustomSectionBehavior("glow", { ...BEHAVIOR, ...shape });

    expect(getCustomSectionBehaviors()).toEqual({});
  });

  it("takes a field of every shape the server reads", () => {
    registerCustomSectionTag("vc-promo", {
      ...TAG,
      description: "x".repeat(1024),
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

  it.each<[string, Partial<ICustomSectionBehavior>]>([
    ["text attributes that are not a list", { textAttributes: "data-glow" as unknown as string[] }],
    ["a text attribute not under its name, which would empty other elements", { textAttributes: ["title"] }],
  ])("refuses a behavior with %s", (_, shape) => {
    registerCustomSectionBehavior("glow", { ...BEHAVIOR, ...shape });

    expect(getCustomSectionBehaviors()).toEqual({});
  });

  it("takes a behavior whose text attributes are its own or under its name", () => {
    registerCustomSectionBehavior("glow", { ...BEHAVIOR, textAttributes: ["data-glow", "data-glow-label"] });

    expect(Object.keys(getCustomSectionBehaviors())).toEqual(["glow"]);
  });

  it("takes a behavior whose name only starts like a binding's", () => {
    ["if-visible", "each-row", "html-clamp", "sbx"].forEach((name) => registerCustomSectionBehavior(name, BEHAVIOR));

    expect(Object.keys(getCustomSectionBehaviors())).toEqual(["if-visible", "each-row", "html-clamp", "sbx"]);
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
