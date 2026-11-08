import { Logger } from "@/core/utilities";

/**
 * How a saved card is named to the customer: brand and last 4 digits, never more of the number.
 * `fallbackBrand` is the translated word for a card whose brand is unknown, e.g. `t("shared.payment.saved_cards.card")`.
 */
export function savedCardLabel(
  brand: string | null | undefined,
  last4: string | null | undefined,
  fallbackBrand: string,
): string {
  return `${brand || fallbackBrand} •••• ${last4 ?? "????"}`;
}

/**
 * The text shown for a failed saved-card operation: always the translated fallback. The server's own message (e.g.
 * "This card pays for 2 subscriptions.") is not translated, so it only goes to the log.
 */
export function savedCardErrorMessage(error: unknown, fallback: string): string {
  Logger.error("saved-cards", error);
  return fallback;
}
