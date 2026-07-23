import { describe, it, expect, beforeAll } from "vitest";
import { getColorValue, isMainColorType, isValidColor, isValidCssVariableName } from "./css";

// jsdom does not implement CSS.supports; polyfill it via CSSStyleDeclaration,
// which jsdom does validate against real CSS grammar.
beforeAll(() => {
  globalThis.CSS ??= {} as typeof CSS;
  globalThis.CSS.supports = ((property: string, value: string) => {
    const el = document.createElement("div");
    el.style.setProperty(property, "");
    el.style.setProperty(property, value);
    return el.style.getPropertyValue(property) !== "";
  }) as typeof CSS.supports;
});

describe("getColorValue", () => {
  it("should return undefined (not an empty string) for an empty string", () => {
    // Load-bearing: VcIcon relies on `undefined` normalizing to the invalid
    // CSS keyword `initial` via v-bind, so the var() fallback chain kicks in.
    // Returning "" here would break that fallback silently.
    expect(getColorValue("")).toBeUndefined();
    expect(getColorValue("")).not.toBe("");
  });

  it("should return undefined for undefined input", () => {
    expect(getColorValue(undefined)).toBeUndefined();
  });

  it("should wrap a CSS custom property name in var()", () => {
    expect(getColorValue("--my-color")).toBe("var(--my-color)");
  });

  it("should map a main color token to its 500-shade CSS variable", () => {
    expect(getColorValue("primary")).toBe("var(--color-primary-500)");
    expect(getColorValue("danger")).toBe("var(--color-danger-500)");
  });

  it("should return a valid raw CSS color string as-is", () => {
    expect(getColorValue("red")).toBe("red");
    expect(getColorValue("#ff0000")).toBe("#ff0000");
  });

  it("should return undefined for a string that is not a css var, main color, or valid color", () => {
    expect(getColorValue("not-a-real-color")).toBeUndefined();
  });
});

describe("isValidCssVariableName", () => {
  it("should return true for valid CSS custom property names", () => {
    expect(isValidCssVariableName("--my-color")).toBe(true);
    expect(isValidCssVariableName("--vc-icon-color")).toBe(true);
  });

  it("should return false for names not starting with --", () => {
    expect(isValidCssVariableName("my-color")).toBe(false);
    expect(isValidCssVariableName("-my-color")).toBe(false);
  });
});

describe("isMainColorType", () => {
  it("should return true for main color tokens", () => {
    expect(isMainColorType("primary")).toBe(true);
    expect(isMainColorType("secondary")).toBe(true);
  });

  it("should return false for non-main-color strings", () => {
    expect(isMainColorType("additional")).toBe(false);
    expect(isMainColorType("not-a-color")).toBe(false);
  });
});

describe("isValidColor", () => {
  it("should return true for valid CSS color values", () => {
    expect(isValidColor("red")).toBe(true);
    expect(isValidColor("#ff0000")).toBe(true);
  });

  it("should return false for invalid CSS color values", () => {
    expect(isValidColor("not-a-real-color")).toBe(false);
  });
});
