import { afterEach, describe, expect, it } from "vitest";
import {
  getColorTokenVariableName,
  getThemeVariablesCss,
  toPaletteVariable,
  writeThemeVariables,
} from "./config.plugin";
import type { IThemeConfigPreset } from "../types";

function rules(): CSSStyleRule[] {
  const styleElement = document.getElementById("vc-theme-variables") as HTMLStyleElement;

  return [...(styleElement.sheet?.cssRules ?? [])] as CSSStyleRule[];
}

function preset(values: Record<string, string>): IThemeConfigPreset {
  return values as unknown as IThemeConfigPreset;
}

describe("writeThemeVariables", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("scopes each part of a palette with a dark variant to its mode", () => {
    writeThemeVariables(preset({ color_primary_500: "#111" }), preset({ color_primary_500: "#eee" }));

    expect(rules().map((rule) => [rule.selectorText, rule.style.getPropertyValue("--color-primary-500")])).toEqual([
      [":root:not(.dark)", "#111"],
      ["html.dark", "#eee"],
    ]);
  });

  it("replaces what an earlier call wrote", () => {
    writeThemeVariables(preset({ color_primary_500: "#111" }), preset({ color_primary_500: "#eee" }));
    writeThemeVariables(preset({ color_primary_500: "#222" }));

    expect(rules().map((rule) => [rule.selectorText, rule.style.getPropertyValue("--color-primary-500")])).toEqual([
      [":root", "#222"],
    ]);
  });

  it("does not let a value break out of its rule", () => {
    writeThemeVariables(
      preset({ color_primary_500: "red; } body { display: none } :root {", color_primary_600: "#666" }),
    );

    expect(rules()).toHaveLength(1);
    expect(rules()[0].style.getPropertyValue("--color-primary-600")).toBe("#666");
  });
});

describe("getThemeVariablesCss", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("returns every rule that was written", () => {
    writeThemeVariables(preset({ color_primary_500: "#111" }), preset({ color_primary_500: "#eee" }));

    const css = getThemeVariablesCss();

    expect(css).toContain(":root:not(.dark)");
    expect(css).toContain("#111");
    expect(css).toContain("html.dark");
    expect(css).toContain("#eee");
  });

  it("returns nothing before the variables are written", () => {
    expect(getThemeVariablesCss()).toBe("");
  });
});

describe("toPaletteVariable", () => {
  it.each([
    ["color_primary_500", "var(--color-primary-500)"],
    ["color_neutral_900", "var(--color-neutral-900)"],
    ["primary_500", "var(--color-primary-500)"],
    ["red; background: url(x)", undefined],
    ["Color_primary", undefined],
    [42, undefined],
  ])("reads %j as %j", (token, variable) => {
    expect(toPaletteVariable(token)).toBe(variable);
  });
});

describe("getColorTokenVariableName", () => {
  it.each([
    ["color_primary_500", "--color-primary-500"],
    ["primary_500", "--color-primary-500"],
    ["", undefined],
    ["red; background: url(x)", undefined],
    ["Primary_500", undefined],
    [42, undefined],
  ])("reads %j as %j", (token, name) => {
    expect(getColorTokenVariableName(token)).toBe(name);
  });
});
