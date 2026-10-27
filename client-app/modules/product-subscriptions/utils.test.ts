import { describe, expect, it, vi } from "vitest";
import { SubscriptionDiscountType, SubscriptionIntervalUnit } from "./api/graphql/types";
import {
  applyDiscount,
  intervalKey,
  intervalLabel,
  needsCardPaymentMethodNotice,
  parseIntervalKey,
  shouldWithdrawCardSaving,
  toDateInputValue,
} from "./utils";

describe("toDateInputValue", () => {
  it("gives the UTC day, as the server counts delivery days", () => {
    // 20:30 in New York on Oct 26 is already Oct 27 in UTC
    expect(toDateInputValue("2026-10-27T00:30:00Z")).toBe("2026-10-27");
    expect(toDateInputValue(new Date(Date.UTC(2026, 0, 5, 23, 59)))).toBe("2026-01-05");
  });

  it("gives nothing for a missing or invalid date", () => {
    expect(toDateInputValue(undefined)).toBeUndefined();
    expect(toDateInputValue("not a date")).toBeUndefined();
  });
});

describe("applyDiscount", () => {
  it("takes a percent off and rounds to cents", () => {
    expect(applyDiscount(9.99, SubscriptionDiscountType.Percent, 10)).toBeCloseTo(8.99, 2);
  });

  it("takes a fixed amount off, never below zero", () => {
    expect(applyDiscount(10, SubscriptionDiscountType.FixedAmount, 2.5)).toBeCloseTo(7.5, 2);
    expect(applyDiscount(10, SubscriptionDiscountType.FixedAmount, 25)).toBe(0);
  });

  it("keeps the price without a discount", () => {
    expect(applyDiscount(10, SubscriptionDiscountType.None, 10)).toBe(10);
    expect(applyDiscount(10, SubscriptionDiscountType.Percent, 0)).toBe(10);
  });

  it("caps a percent at 100", () => {
    expect(applyDiscount(10, SubscriptionDiscountType.Percent, 150)).toBe(0);
  });
});

describe("intervalLabel", () => {
  it("translates by the lower-case unit, with the count for plurals", () => {
    const t = vi.fn((key: string, named: { count: number }) => `${key}:${named.count}`);

    expect(intervalLabel(t as never, SubscriptionIntervalUnit.Week, 2)).toBe("product_subscriptions.intervals.week:2");
    expect(t).toHaveBeenLastCalledWith("product_subscriptions.intervals.week", { count: 2 }, 2);
  });

  it("falls back to every 1 month", () => {
    const t = vi.fn((key: string, named: { count: number }) => `${key}:${named.count}`);

    expect(intervalLabel(t as never, undefined, 0)).toBe("product_subscriptions.intervals.month:1");
  });
});

describe("intervalKey / parseIntervalKey", () => {
  it("round-trips a frequency", () => {
    expect(parseIntervalKey(intervalKey(SubscriptionIntervalUnit.Month, 3))).toEqual({
      unit: SubscriptionIntervalUnit.Month,
      count: 3,
    });
  });
});

// A subscription cart is offered only payment methods that can save a card; with none, the shopper is told why.
describe("needsCardPaymentMethodNotice", () => {
  it("is needed when a subscription cart has no payment method", () => {
    expect(needsCardPaymentMethodNotice(true, [])).toBe(true);
    expect(needsCardPaymentMethodNotice(true, undefined)).toBe(true);
  });

  it("isn't needed when a method is offered or the cart has no subscription", () => {
    expect(needsCardPaymentMethodNotice(true, [{ code: "MockStoredCardPaymentMethod" }])).toBe(false);
    expect(needsCardPaymentMethodNotice(false, [])).toBe(false);
  });
});

describe("shouldWithdrawCardSaving", () => {
  const cart = (...ids: string[]) => ids.map((id) => ({ id }));

  it("withdraws when the subscribed lines stay in the cart: turned one-time or left out of checkout", () => {
    expect(shouldWithdrawCardSaving(["line-1"], cart("line-1", "line-2"))).toBe(true);
  });

  it("keeps the requirement when the subscribed lines left the cart: they were ordered and the order is paid next", () => {
    expect(shouldWithdrawCardSaving(["line-1"], cart("line-2"))).toBe(false);
    expect(shouldWithdrawCardSaving(["line-1"], undefined)).toBe(false);
  });

  it("has nothing to withdraw when there were no subscribed lines", () => {
    expect(shouldWithdrawCardSaving([], cart("line-1"))).toBe(false);
  });
});
