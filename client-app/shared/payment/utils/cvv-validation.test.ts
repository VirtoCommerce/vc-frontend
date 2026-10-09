import { describe, expect, it } from "vitest";
import {
  AMEX_CVV_LENGTH,
  DEFAULT_CVV_LENGTH,
  getCardSchemeFromNumber,
  getCvvLength,
  isAmexScheme,
} from "./cvv-validation";

// Shared per-brand CVV length core (VCST-5344 / VCST-5202). American Express requires a 4-digit
// CVV; every other (or not-yet-detected) brand requires exactly 3. Both card forms derive their
// rule/mask/length from this single decision, so a malformed CVV is rejected client-side instead
// of enabling Place order and producing a processor decline / unpaid ghost order.
describe("getCvvLength", () => {
  it("requires 4 digits for American Express", () => {
    expect(getCvvLength("AMEX")).toBe(AMEX_CVV_LENGTH);
  });

  it("requires 3 digits for non-Amex brands", () => {
    for (const scheme of ["VISA", "MASTERCARD", "DISCOVER"]) {
      expect(getCvvLength(scheme)).toBe(DEFAULT_CVV_LENGTH);
    }
  });

  it("defaults to 3 digits when the brand is not yet detected", () => {
    expect(getCvvLength()).toBe(DEFAULT_CVV_LENGTH);
    expect(getCvvLength(null)).toBe(DEFAULT_CVV_LENGTH);
    expect(getCvvLength("")).toBe(DEFAULT_CVV_LENGTH);
  });
});

// The two data sources spell Amex differently: the Skyflow SDK enum uses "AMEX"; the Skyflow vault
// (surfaced by the backend) uses the full network name "AMERICAN EXPRESS". Both — in any casing —
// must resolve to Amex.
describe("isAmexScheme", () => {
  it("matches every Amex spelling the SDK and the vault emit, case-insensitively", () => {
    for (const scheme of ["AMEX", "amex", "American Express", "AMERICAN EXPRESS"]) {
      expect(isAmexScheme(scheme)).toBe(true);
    }
  });

  it("does not match other brands or an undetected brand", () => {
    for (const scheme of ["VISA", "MASTERCARD", "DISCOVER", "", null, undefined]) {
      expect(isAmexScheme(scheme)).toBe(false);
    }
  });
});

// The Authorize.Net bank-card form has no SDK, so it detects the brand from the typed card number's
// IIN prefix. Only Amex (34/37) needs distinguishing; everything else falls back to the 3-digit rule.
describe("getCardSchemeFromNumber", () => {
  it("detects Amex from an Amex card number (IIN 34/37)", () => {
    expect(getCardSchemeFromNumber("370000000000002")).toBe("AMEX"); // Amex test card (37)
    expect(getCardSchemeFromNumber("341111111111111")).toBe("AMEX"); // Amex (34)
    // Non-digit characters (spaces / mask chars) are stripped before matching.
    expect(getCardSchemeFromNumber("3700 0000 0000 002")).toBe("AMEX");
  });

  it("returns undefined for non-Amex brands so the 3-digit default applies", () => {
    expect(getCardSchemeFromNumber("4007000000027")).toBeUndefined(); // Visa
    expect(getCardSchemeFromNumber("5555555555554444")).toBeUndefined(); // Mastercard
  });

  it("returns undefined while the prefix is still empty or incomplete", () => {
    expect(getCardSchemeFromNumber("")).toBeUndefined();
    expect(getCardSchemeFromNumber(null)).toBeUndefined();
    expect(getCardSchemeFromNumber()).toBeUndefined();
    expect(getCardSchemeFromNumber("3")).toBeUndefined(); // 34/37 not yet distinguishable
  });

  it("feeds getCvvLength to require 4 digits for a detected Amex card, 3 otherwise", () => {
    expect(getCvvLength(getCardSchemeFromNumber("370000000000002"))).toBe(AMEX_CVV_LENGTH);
    expect(getCvvLength(getCardSchemeFromNumber("4007000000027"))).toBe(DEFAULT_CVV_LENGTH);
  });
});
