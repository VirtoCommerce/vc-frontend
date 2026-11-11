import { describe, expect, it, vi } from "vitest";
import { SubscriptionDiscountType, SubscriptionIntervalUnit } from "./api/graphql/types";
import {
  applyDiscount,
  fetchAllPages,
  intervalKey,
  intervalLabel,
  needsCardPaymentMethodNotice,
  parseIntervalKey,
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
