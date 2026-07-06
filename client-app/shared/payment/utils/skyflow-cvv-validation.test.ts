import { describe, expect, it } from "vitest";
import { getCardSchemeFromNumber, getCvvValidation } from "./skyflow-cvv-validation";

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

  // The component re-validates the already-entered CVV whenever a brand change alters the required
  // length. That reset is gated on the CVV regex actually changing, so Amex must yield a regex
  // distinct from the non-Amex / not-yet-detected default — otherwise a 3-digit CVV entered before
  // a late Amex number would keep its stale validity and leave Place order enabled (VCST-5202).
  it("yields a length-distinct regex for Amex vs non-Amex so a late brand switch retriggers validation", () => {
    expect(getCvvValidation("AMEX").regex).not.toBe(getCvvValidation("VISA").regex);
    expect(getCvvValidation("AMEX").regex).not.toBe(getCvvValidation().regex);
    // A non-Amex brand must NOT change the rule from the default, so the common path never resets.
    expect(getCvvValidation("VISA").regex).toBe(getCvvValidation().regex);
  });

  // The two data sources spell Amex differently: the Skyflow SDK CHANGE event uses the
  // Skyflow.CardType enum ("AMEX"); the Skyflow vault (surfaced by the backend as
  // SkyflowCardType.cardScheme) uses the full network name "AMERICAN EXPRESS". Both must map to 4.
  it("requires 4 digits for every real Amex spelling emitted by the SDK and the vault", () => {
    for (const scheme of ["AMEX", "American Express", "AMERICAN EXPRESS", "american express"]) {
      const { regex, placeholder } = getCvvValidation(scheme);

      expect(matches(regex, "1234")).toBe(true);
      expect(matches(regex, "123")).toBe(false);
      expect(placeholder).toBe("1111");
    }
  });
});

// The Skyflow SDK only populates `selectedCardScheme` on an explicit card-brand-choice selection
// (co-badged cards), so a plain auto-detected Amex must be recognised from the card number itself.
describe("getCardSchemeFromNumber (VCST-5202)", () => {
  it("detects Amex from a full card number (IIN 34/37)", () => {
    expect(getCardSchemeFromNumber("378282246310005")).toBe("AMEX"); // Amex test card (37)
    expect(getCardSchemeFromNumber("341111111111111")).toBe("AMEX"); // Amex (34)
  });

  it("detects Amex from the partially masked value the SDK returns in PROD", () => {
    // PROD CARD_NUMBER value keeps the first 6 digits and masks the rest with 'X'.
    expect(getCardSchemeFromNumber("378282XXXXXXXXX")).toBe("AMEX");
    expect(getCardSchemeFromNumber("3782 82XX XXXX XXX")).toBe("AMEX");
  });

  it("returns undefined for non-Amex brands so the 3-digit default applies", () => {
    expect(getCardSchemeFromNumber("4111111111111111")).toBeUndefined(); // Visa
    expect(getCardSchemeFromNumber("5555555555554444")).toBeUndefined(); // Mastercard
    expect(getCardSchemeFromNumber("6011111111111117")).toBeUndefined(); // Discover
  });

  it("returns undefined while the prefix is still incomplete or empty", () => {
    expect(getCardSchemeFromNumber("")).toBeUndefined();
    expect(getCardSchemeFromNumber(null)).toBeUndefined();
    expect(getCardSchemeFromNumber()).toBeUndefined();
    expect(getCardSchemeFromNumber("3")).toBeUndefined(); // 34/37 not yet distinguishable
  });

  it("feeds getCvvValidation to require 4 digits for a detected Amex card", () => {
    const { regex } = getCvvValidation(getCardSchemeFromNumber("378282XXXXXXXXX"));
    expect(new RegExp(regex).test("1234")).toBe(true);
    expect(new RegExp(regex).test("123")).toBe(false);
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
