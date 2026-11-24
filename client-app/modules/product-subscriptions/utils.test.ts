import { describe, expect, it, vi } from "vitest";
import { SubscriptionDiscountType, SubscriptionIntervalUnit } from "./api/graphql/types";
import {
  discountLabel,
  fetchAllPages,
  intervalKey,
  intervalLabel,
  needsCardPaymentMethodNotice,
  parseIntervalKey,
  subscriptionErrorMessage,
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

describe("discountLabel", () => {
  const t = ((key: string, params?: { value: unknown }) => `${key}:${String(params?.value)}`) as never;

  it("shows a percent as is", () => {
    expect(discountLabel(t, SubscriptionDiscountType.Percent, 10)).toBe("product_subscriptions.discount.percent:10");
  });

  it("shows a fixed amount with the amount the server formatted", () => {
    expect(discountLabel(t, SubscriptionDiscountType.FixedAmount, 5, "5,00 €")).toBe(
      "product_subscriptions.discount.amount:5,00 €",
    );
  });

  it("shows nothing for a fixed amount the server didn't format", () => {
    expect(discountLabel(t, SubscriptionDiscountType.FixedAmount, 5)).toBeUndefined();
  });

  it("shows nothing without a discount", () => {
    expect(discountLabel(t, SubscriptionDiscountType.None, 10)).toBeUndefined();
    expect(discountLabel(t, SubscriptionDiscountType.Percent, 0)).toBeUndefined();
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

describe("fetchAllPages", () => {
  const list = (count: number) => Array.from({ length: count }, (_, i) => `item-${i}`);

  it("asks for the next page with `after` until it has `totalCount` items", async () => {
    const all = list(25);
    const fetchPage = vi.fn(({ first, after }: { first: number; after: string }) =>
      Promise.resolve({ totalCount: all.length, items: all.slice(Number(after), Number(after) + first) }),
    );

    await expect(fetchAllPages(fetchPage, 20)).resolves.toEqual(all);
    expect(fetchPage.mock.calls.map(([page]) => page)).toEqual([
      { first: 20, after: "0" },
      { first: 20, after: "20" },
    ]);
  });

  it("asks once when the first page holds everything", async () => {
    const fetchPage = vi.fn(() => Promise.resolve({ totalCount: 3, items: list(3) }));

    await expect(fetchAllPages(fetchPage, 20)).resolves.toEqual(list(3));
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("stops at an empty page, even when the total promised more", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ totalCount: 30, items: list(20) })
      .mockResolvedValueOnce({ totalCount: 30, items: [] });

    await expect(fetchAllPages(fetchPage, 20)).resolves.toHaveLength(20);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});

describe("subscriptionErrorMessage", () => {
  const t = ((key: string) => `t:${key}`) as Parameters<typeof subscriptionErrorMessage>[1];
  const refused = (extensions: Record<string, unknown>, message = "Server words") => ({
    graphQLErrors: [{ message, extensions: { code: "SUBSCRIPTION_ERROR", ...extensions } }],
  });

  it("says a known reason in the customer's language", () => {
    expect(subscriptionErrorMessage(refused({ data: { reason: "PRODUCT_IN_CART_MORE_THAN_ONCE" } }), t)).toBe(
      "t:product_subscriptions.errors.reasons.PRODUCT_IN_CART_MORE_THAN_ONCE",
    );
  });

  it("shows the server's message for a refusal without a known reason", () => {
    expect(subscriptionErrorMessage(refused({}), t)).toBe("Server words");
  });

  it("says the store turned the action off", () => {
    const error = { graphQLErrors: [{ extensions: { code: "SUBSCRIPTION_ACTION_DISABLED" } }] };
    expect(subscriptionErrorMessage(error, t)).toBe("t:product_subscriptions.errors.action_disabled");
  });

  it("falls back to the generic text for anything else", () => {
    expect(subscriptionErrorMessage(new Error("network"), t)).toBe("t:product_subscriptions.errors.generic");
  });
});
