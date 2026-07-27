// Per-brand CVV (security code) length rules shared by every manual/embedded card form
// (the Authorize.Net `bank-card-form`, the Skyflow form). American Express uses a 4-digit CVV
// ("CID"); every other brand uses 3 digits. This module is the single source of truth for that
// decision — each form derives the concrete artifacts it needs (a yup `.length()` rule, a maska
// mask, `maxlength`, a `REGEX_MATCH_RULE` regex, a placeholder) from the one length returned here,
// so the constants and the Amex rule are never duplicated per processor.

export const AMEX_CVV_LENGTH = 4;
export const DEFAULT_CVV_LENGTH = 3;

/** Canonical Amex scheme token (matches `Skyflow.CardType.AMEX`). */
export const AMEX_SCHEME = "AMEX";

// Every string the card data sources emit for Amex, normalized to letters-only + uppercase:
// the Skyflow SDK enum `Skyflow.CardType.AMEX` -> "AMEX"; the Skyflow vault `card_scheme`
// (surfaced by the backend) -> "AMERICAN EXPRESS".
const AMEX_SCHEME_ALIASES = new Set(["AMEX", "AMERICANEXPRESS"]);

// Amex issuer identification numbers (IIN/BIN) start with 34 or 37.
const AMEX_IIN_RE = /^3[47]/;

/** True when the scheme name (in any casing/spelling the data sources emit) is American Express. */
export function isAmexScheme(cardScheme?: string | null): boolean {
  const normalized = (cardScheme ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  return AMEX_SCHEME_ALIASES.has(normalized);
}

/**
 * Detects the card scheme from a (possibly partially masked) card number by its IIN prefix.
 * Only Amex needs distinguishing (4-digit CVV), so this returns {@link AMEX_SCHEME} for an Amex
 * prefix (34/37) and `undefined` otherwise. Non-digit characters (spaces, mask characters) are
 * stripped first, so a masked value with the leading digits intact still resolves correctly.
 */
export function getCardSchemeFromNumber(cardNumber?: string | null): string | undefined {
  const digits = (cardNumber ?? "").replace(/\D/g, "");
  return AMEX_IIN_RE.test(digits) ? AMEX_SCHEME : undefined;
}

/**
 * The required CVV length for a detected card scheme: Amex -> 4, every other (or unknown) -> 3.
 *
 * @param cardScheme the resolved scheme (from {@link getCardSchemeFromNumber}, the Skyflow CHANGE
 *   event's `selectedCardScheme`, or a saved card's `cardScheme`/`cardType`), or undefined before
 *   a brand is detected.
 */
export function getCvvLength(cardScheme?: string | null): number {
  return isAmexScheme(cardScheme) ? AMEX_CVV_LENGTH : DEFAULT_CVV_LENGTH;
}
