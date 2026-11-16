import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import RenewalPanel from "./renewal-panel.vue";
import type { RenewalFieldsFragment } from "../api/graphql/types";

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  const messages = (await import("../locales/en.json")).default;
  const i18n = actual.createI18n({ legacy: false, locale: "en", messages: { en: messages } });
  return { ...actual, useI18n: () => i18n.global };
});

const i18n = createI18n({ legacy: false, locale: "en", messages: { en } });

function renewal(overrides: Partial<RenewalFieldsFragment> = {}): RenewalFieldsFragment {
  return {
    id: "r1",
    number: "R-1",
    state: "Notified",
    scheduledDate: "2026-12-01T00:00:00Z",
    cutoffDate: "2026-11-30T00:00:00Z",
    isManual: false,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 0,
    attemptCount: 0,
    canSkip: true,
    canAcceptReview: false,
    canRetryPayment: false,
    requiresPaymentAction: false,
    previewTotalMoney: { amount: 12, formattedAmount: "12,00 €" },
    items: [],
    ...overrides,
  };
}

function mountPanel(value: RenewalFieldsFragment) {
  return mount(RenewalPanel, {
    props: { renewal: value },
    global: {
      plugins: [i18n],
      stubs: {
        VcIcon: true,
        VcButton: { template: "<button><slot /></button>" },
        VcAlert: { template: "<div class='alert'><slot /></div>" },
        VcPriceDisplay: { props: ["value"], template: "<span class='price'>{{ value?.formattedAmount }}</span>" },
        SubscriptionStatusBadge: true,
        RenewalItem: true,
      },
    },
  });
}

describe("renewal-panel", () => {
  it("shows the total the server formatted in the renewal's currency", () => {
    const wrapper = mountPanel(renewal());

    expect(wrapper.find(".price").text()).toBe("12,00 €");
  });

  it("translates the review reason code instead of showing the server's English text", () => {
    const wrapper = mountPanel(
      renewal({
        state: "ReviewRequired",
        canAcceptReview: true,
        reviewReasonCode: "PRICE_INCREASED",
        notifiedTotalMoney: { amount: 10, formattedAmount: "10,00 €" },
        previewTotalMoney: { amount: 12, formattedAmount: "12,00 €" },
      }),
    );

    expect(wrapper.find("[data-test-id='renewal-review-reason']").text()).toBe(
      "The total went up from 10,00 € to 12,00 €. Please confirm the new price.",
    );
  });

  it("translates the payment error code of a failed renewal", () => {
    const wrapper = mountPanel(renewal({ state: "Failed", lastErrorCode: "CARD_DECLINED" }));

    expect(wrapper.find("[data-test-id='renewal-last-error']").text()).toBe(
      en.product_subscriptions.renewal.errors.CARD_DECLINED,
    );
  });

  it("says why a payment needs the customer, with a generic text for an unknown code", () => {
    const known = mountPanel(renewal({ state: "PaymentActionRequired", lastErrorCode: "CARD_REQUIRED" }));
    const unknown = mountPanel(renewal({ state: "PaymentActionRequired", lastErrorCode: "SOMETHING_NEW" }));

    expect(known.find(".renewal-panel__message").text()).toBe(en.product_subscriptions.renewal.errors.CARD_REQUIRED);
    expect(unknown.find(".renewal-panel__message").text()).toBe(en.product_subscriptions.renewal.errors.UNHANDLED);
  });
});
