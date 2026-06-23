import { describe, expect, it } from "vitest";
import { getCvvValidation } from "./skyflow-cvv-validation";

// VCST-5202: Skyflow CVV validation must be per-brand.
// The brand-agnostic `^[0-9]{3,4}$` accepted a 3-digit CVV on Amex (needs 4) and a 4-digit
// CVV on other brands (needs 3). The derived regex must be brand-exact so a malformed CVV is
// rejected client-side instead of enabling Place order and producing a processor decline.
describe("getCvvValidation (VCST-5202)", () => {
  function matches(regex: string, value: string): boolean {
    return new RegExp(regex).test(value);
  }

  it("requires exactly 4 digits for American Express", () => {
    const { regex, placeholder } = getCvvValidation("AMEX");

    expect(matches(regex, "1234")).toBe(true);
    // The bug: a 3-digit CVV must NOT pass for Amex.
    expect(matches(regex, "123")).toBe(false);
    expect(placeholder).toBe("1111");
  });

  it("requires exactly 3 digits for non-Amex brands", () => {
    for (const scheme of ["VISA", "MASTERCARD", "DISCOVER"]) {
      const { regex, placeholder } = getCvvValidation(scheme);

      expect(matches(regex, "123")).toBe(true);
      // Mirror asymmetry from the bug: a 4-digit CVV must NOT pass for non-Amex.
      expect(matches(regex, "1234")).toBe(false);
      expect(placeholder).toBe("111");
    }
  });

  it("defaults to 3 digits when the brand is not yet detected", () => {
    const { regex, placeholder } = getCvvValidation();

    expect(matches(regex, "123")).toBe(true);
    expect(matches(regex, "1234")).toBe(false);
    expect(placeholder).toBe("111");
  });

  it("is case-insensitive for the scheme name", () => {
    expect(getCvvValidation("amex").regex).toBe(getCvvValidation("AMEX").regex);
  });

  // Saved cards expose their brand via the GraphQL SkyflowCardType.cardScheme / cardType fields
  // (the component derives the rule from `cardScheme ?? cardType`). Whichever field carries the
  // scheme, a saved Amex card must still require 4 digits.
  it("derives the 4-digit rule for a saved Amex card from cardScheme or cardType", () => {
    // Mirrors `selectedSkyflowCard.cardScheme ?? selectedSkyflowCard.cardType` in the component.
    const resolveSavedCardRule = (card: { cardScheme?: string | null; cardType?: string | null }) =>
      getCvvValidation(card.cardScheme ?? card.cardType);

    const fromScheme = resolveSavedCardRule({ cardScheme: "AMEX", cardType: null });
    const fromCardType = resolveSavedCardRule({ cardScheme: null, cardType: "AMEX" });

    for (const { regex, placeholder } of [fromScheme, fromCardType]) {
      expect(new RegExp(regex).test("123")).toBe(false);
      expect(new RegExp(regex).test("1234")).toBe(true);
      expect(placeholder).toBe("1111");
    }
  });
});
