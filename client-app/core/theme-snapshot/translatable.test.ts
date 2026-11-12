import { describe, expect, it } from "vitest";
import { isTranslatableDictionary, pickTranslation, resolveTranslatableValues } from "./translatable";

describe("isTranslatableDictionary", () => {
  it.each([
    [{ "en-US": "Hi", "de-DE": "Hallo" }, true],
    [{ "sr-Latn-RS": "Zdravo", "EN-us": "Hi" }, true],
    [{ en: "Hi", "de-DE": "Hallo" }, true],
    [{ "en-US": "Hi", "de-DE": 1 }, false],
    [{ sku: "X1" }, false],
    [{ "en-US": "Hi", title: "x" }, false],
    [{}, false],
    [["en-US"], false],
  ])("takes %j as a dictionary: %s", (value, expected) => {
    expect(isTranslatableDictionary(value)).toBe(expected);
  });
});

describe("pickTranslation", () => {
  const dictionary = { "en-US": "Hi", "de-DE": "Hallo", "sr-Latn-RS": "Zdravo" };

  it("takes the exact culture, ignoring case", () => {
    expect(pickTranslation(dictionary, "sr-latn-rs", "en-US")).toBe("Zdravo");
  });

  it("takes a culture of the same language, the bare language first", () => {
    expect(pickTranslation(dictionary, "de-AT", "en-US")).toBe("Hallo");
    expect(pickTranslation({ "de-DE": "Hallo", de: "Servus" }, "de-AT", "en-US")).toBe("Servus");
  });

  it("takes the store default language, else the first text", () => {
    expect(pickTranslation(dictionary, "fr-FR", "de-DE")).toBe("Hallo");
    expect(pickTranslation(dictionary, "fr-FR", "it-IT")).toBe("Hi");
  });
});

describe("resolveTranslatableValues", () => {
  it("resolves dictionaries inside lists and objects and keeps rows that only look like one", () => {
    const value = {
      title: { "en-US": "Hi", "de-DE": "Hallo" },
      skus: [{ sku: "X1" }],
      links: [{ label: { "en-US": "Shop", "de-DE": "Laden" } }],
    };

    expect(resolveTranslatableValues(value, "de-CH", "en-US")).toEqual({
      title: "Hallo",
      skus: [{ sku: "X1" }],
      links: [{ label: "Laden" }],
    });
  });
});
