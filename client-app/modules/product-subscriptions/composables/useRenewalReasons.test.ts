import { describe, expect, it, vi } from "vitest";
import en from "../locales/en.json";
import { useRenewalReasons } from "./useRenewalReasons";

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  const messages = (await import("../locales/en.json")).default;
  const i18n = actual.createI18n({ legacy: false, locale: "en", messages: { en: messages } });
  return { ...actual, useI18n: () => i18n.global };
});

const reviewReasons = en.product_subscriptions.renewal.review_reasons;
const errors = en.product_subscriptions.renewal.errors;

describe("useRenewalReasons", () => {
  const { reviewReasonText, errorText } = useRenewalReasons();

  it("translates every review reason code the backend sends", () => {
    expect(reviewReasonText({ reviewReasonCode: "ITEMS_UNAVAILABLE" })).toBe(reviewReasons.ITEMS_UNAVAILABLE);
    expect(reviewReasonText({ reviewReasonCode: "NO_SHIPPING_METHOD" })).toBe(reviewReasons.NO_SHIPPING_METHOD);
  });

  it("shows a price increase with the totals the server formatted", () => {
    const text = reviewReasonText({
      reviewReasonCode: "PRICE_INCREASED",
      notifiedTotalMoney: { amount: 10, formattedAmount: "10,00 €" },
      previewTotalMoney: { amount: 12, formattedAmount: "12,00 €" },
    });

    expect(text).toBe("The total went up from 10,00 € to 12,00 €. Please confirm the new price.");
  });

  it("falls back to the generic text for a price increase without both totals", () => {
    expect(reviewReasonText({ reviewReasonCode: "PRICE_INCREASED" })).toBe(reviewReasons.UNHANDLED);
  });

  it("never shows a raw key for a code the storefront doesn't know", () => {
    expect(reviewReasonText({ reviewReasonCode: "SOMETHING_NEW" })).toBe(reviewReasons.UNHANDLED);
    expect(errorText("SOMETHING_NEW")).toBe(errors.UNHANDLED);
  });

  it("translates every payment error code the backend sends", () => {
    const codes = [
      "AUTHENTICATION_REQUIRED",
      "CARD_REQUIRED",
      "CARD_NEEDS_UPDATE",
      "CARD_DECLINED",
      "CARD_DECLINED_WILL_RETRY",
      "CARD_DECLINED_PROVIDER_RETRY",
      "CARD_DECLINED_ON_CAPTURE",
      "RETRIES_EXHAUSTED",
      "PAYMENT_FAILED",
      "PAYMENT_NOT_CONFIRMED",
      "PROVIDER_UNAVAILABLE",
    ] as const;

    codes.forEach((code) => expect(errorText(code)).toBe(errors[code]));
  });

  it("gives nothing without a code", () => {
    expect(reviewReasonText({ reviewReasonCode: null })).toBeUndefined();
    expect(errorText(undefined)).toBeUndefined();
  });
});
