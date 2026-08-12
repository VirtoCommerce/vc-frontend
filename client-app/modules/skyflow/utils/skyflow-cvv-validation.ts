// Skyflow-specific CVV (security code) shaping. The per-brand length decision and the card-number
// brand detection live in the shared `./cvv-validation` core (also consumed by the Authorize.Net
// `bank-card-form`); this module only turns that length into the `{ regex, placeholder }` shape
// Skyflow's REGEX_MATCH_RULE expects, and re-exports the shared detector for the Skyflow form.
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
//     (e.g. "AMERICAN EXPRESS"), whereas the SDK enum uses "AMEX", so matching is normalized
//     inside the shared core.

import { getCvvLength } from "@/shared/payment/utils/cvv-validation";

export { getCardSchemeFromNumber } from "@/shared/payment/utils/cvv-validation";

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
 * @param cardScheme the resolved scheme (from {@link getCardSchemeFromNumber} / the CHANGE
 *   event's `selectedCardScheme` for a new card, or the saved card's `cardScheme`/`cardType`),
 *   or undefined before a brand is detected.
 */
export function getCvvValidation(cardScheme?: string | null): SkyflowCvvValidationType {
  const length = getCvvLength(cardScheme);

  return {
    regex: `^[0-9]{${length}}$`,
    placeholder: "1".repeat(length),
  };
}
