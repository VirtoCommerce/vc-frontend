// Per-brand CVV (security code) rules for the Skyflow card form.
// American Express uses a 4-digit CVV (CID); all other brands use 3 digits.
// The Skyflow SDK detects the brand on the CARD_NUMBER element and surfaces it as
// `selectedCardScheme` (a Skyflow.CardType value, e.g. "AMEX") on the CHANGE event, so the
// CVV element's REGEX_MATCH_RULE and placeholder can be derived from the detected brand
// instead of the brand-agnostic `^[0-9]{3,4}$` that accepts a malformed CVV for either case.

const AMEX_CVV_LENGTH = 4;
const DEFAULT_CVV_LENGTH = 3;

/** Skyflow.CardType.AMEX surfaces as this string on the CARD_NUMBER CHANGE event. */
const AMEX_SCHEME = "AMEX";

export type SkyflowCvvValidationType = {
  /** Anchored regex passed to Skyflow's REGEX_MATCH_RULE. */
  regex: string;
  /** Placeholder reflecting the expected digit count for the detected brand. */
  placeholder: string;
};

/**
 * Derives the CVV regex + placeholder for a detected card scheme.
 * Amex -> 4 digits ("1111"); every other (or unknown) brand -> 3 digits ("111").
 *
 * @param cardScheme the `selectedCardScheme` from the Skyflow CARD_NUMBER CHANGE event,
 *   the saved card's `cardScheme`/`cardType`, or undefined before a brand is detected.
 */
export function getCvvValidation(cardScheme?: string | null): SkyflowCvvValidationType {
  const isAmex = (cardScheme ?? "").toUpperCase() === AMEX_SCHEME;
  const length = isAmex ? AMEX_CVV_LENGTH : DEFAULT_CVV_LENGTH;

  return {
    regex: `^[0-9]{${length}}$`,
    placeholder: "1".repeat(length),
  };
}
