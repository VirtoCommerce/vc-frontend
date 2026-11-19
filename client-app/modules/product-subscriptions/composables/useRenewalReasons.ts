import { useI18n } from "vue-i18n";
import type { RenewalFieldsFragment } from "../api/graphql/types";

const FALLBACK = "UNHANDLED";

type RenewalReviewType = Pick<RenewalFieldsFragment, "reviewReasonCode" | "notifiedTotalMoney" | "previewTotalMoney">;

/**
 * Shopper-facing text for a renewal's review reason and payment problem. The server sends stable codes (its English
 * text is for the admin and logs); the codes are enumerated in the backend module, so a newer server can send one the
 * storefront doesn't know yet, and that one gets a generic text instead of a raw key.
 */
export function useRenewalReasons() {
  const { t, te } = useI18n();

  function codeText(
    namespace: "review_reasons" | "errors",
    code: string,
    params: Record<string, unknown> = {},
  ): string {
    const key = `product_subscriptions.renewal.${namespace}.${code}`;

    return te(key) ? t(key, params) : t(`product_subscriptions.renewal.${namespace}.${FALLBACK}`);
  }

  /** Why the renewal needs a review, or nothing when it doesn't. */
  function reviewReasonText(renewal: RenewalReviewType): string | undefined {
    const code = renewal.reviewReasonCode;
    if (!code) {
      return undefined;
    }

    if (code === "PRICE_INCREASED") {
      const from = renewal.notifiedTotalMoney?.formattedAmount;
      const to = renewal.previewTotalMoney?.formattedAmount;

      // Without both totals the sentence would show blanks; the generic text is better.
      return from && to ? codeText("review_reasons", code, { from, to }) : codeText("review_reasons", FALLBACK);
    }

    return codeText("review_reasons", code);
  }

  /** The last payment problem, or nothing when there is none. */
  function errorText(code: string | null | undefined): string | undefined {
    return code ? codeText("errors", code) : undefined;
  }

  return { reviewReasonText, errorText };
}
