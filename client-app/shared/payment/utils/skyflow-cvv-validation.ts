// Per-brand CVV (security code) rules for the Skyflow card form.
// American Express uses a 4-digit CVV (CID); all other brands use 3 digits.
//
// Resolving the brand differs by path:
//   - New card: the Skyflow SDK exposes the brand on the CARD_NUMBER CHANGE event only as
//     `selectedCardScheme`, and (per the skyflow-js README) that is populated ONLY when a
//     card-brand-choice selection is triggered (co-badged cards) — for an auto-detected
//     single-scheme card such as Amex it stays an empty string. So the brand is derived from
//     the card number's IIN prefix instead (the SDK still returns the leading digits of the
//     CARD_NUMBER `value` even in PROD: the first 6 for Amex, 8 for others).
//   - Saved card: the brand comes from the GraphQL SkyflowCardType.cardScheme / cardType, which
//     the backend passes through verbatim from the Skyflow vault. Those use full network names
//     (e.g. "AMERICAN EXPRESS"), whereas the SDK enum uses "AMEX", so matching is normalized.

const AMEX_CVV_LENGTH = 4;
const DEFAULT_CVV_LENGTH = 3;

/** Canonical Amex scheme token (matches Skyflow.CardType.AMEX). */
const AMEX_SCHEME = "AMEX";

// Every string the two data sources emit for Amex, normalized to letters-only + uppercase:
// SDK `Skyflow.CardType.AMEX` -> "AMEX"; Skyflow vault `card_scheme` -> "AMERICAN EXPRESS".
const AMEX_SCHEME_ALIASES = new Set(["AMEX", "AMERICANEXPRESS"]);

// Amex issuer identification numbers (IIN/BIN) start with 34 or 37.
const AMEX_IIN_RE = /^3[47]/;

export type SkyflowCvvValidationType = {
  /** Anchored regex passed to Skyflow's REGEX_MATCH_RULE. */
  regex: string;
  /** Placeholder reflecting the expected digit count for the detected brand. */
  placeholder: string;
};

function isAmexScheme(cardScheme?: string | null): boolean {
  const normalized = (cardScheme ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  return AMEX_SCHEME_ALIASES.has(normalized);
}

/**
 * Detects the card scheme from a (possibly partially masked) card number by its IIN prefix.
 * Only Amex needs distinguishing (4-digit CVV), so this returns {@link AMEX_SCHEME} for an Amex
 * prefix (34/37) and `undefined` otherwise. Non-digit characters (spaces, mask characters) are
 * stripped first, so the SDK's masked `value` (leading digits intact) still resolves correctly.
 */
export function getCardSchemeFromNumber(cardNumber?: string | null): string | undefined {
  const digits = (cardNumber ?? "").replace(/\D/g, "");
  return AMEX_IIN_RE.test(digits) ? AMEX_SCHEME : undefined;
}

/**
 * Derives the CVV regex + placeholder for a detected card scheme.
 * Amex -> 4 digits ("1111"); every other (or unknown) brand -> 3 digits ("111").
 *
 * @param cardScheme the resolved scheme (from {@link getCardSchemeFromNumber} / the CHANGE
 *   event's `selectedCardScheme` for a new card, or the saved card's `cardScheme`/`cardType`),
 *   or undefined before a brand is detected.
 */
export function getCvvValidation(cardScheme?: string | null): SkyflowCvvValidationType {
  const length = isAmexScheme(cardScheme) ? AMEX_CVV_LENGTH : DEFAULT_CVV_LENGTH;

  return {
    regex: `^[0-9]{${length}}$`,
    placeholder: "1".repeat(length),
  };
}
