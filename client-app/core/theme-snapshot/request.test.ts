// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isThemeForLanguage } from "./request";

describe("isThemeForLanguage", () => {
  it.each([
    ["the culture in another case", { cultureName: "de-DE" }, "DE-de"],
    ["its bare language", { cultureName: "DE" }, "de-AT"],
    ["the default language served for its language", { cultureName: "en-US", requestedCultureName: "FR" }, "fr-FR"],
  ])("takes %s", (_name, theme, cultureName) => {
    expect(isThemeForLanguage(theme, cultureName)).toBe(true);
  });

  it.each([
    ["the default language served for another language", { cultureName: "en-US", requestedCultureName: "fr" }, "de-DE"],
    ["another culture served for its language", { cultureName: "EN-US", requestedCultureName: "en" }, "en-GB"],
  ])("does not take %s", (_name, theme, cultureName) => {
    expect(isThemeForLanguage(theme, cultureName)).toBe(false);
  });
});
