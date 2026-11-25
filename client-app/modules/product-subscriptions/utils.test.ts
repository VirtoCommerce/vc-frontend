import { describe, expect, it, vi } from "vitest";
import { SubscriptionIntervalUnit } from "./api/graphql/types";
import {
  addInterval,
  configurationSummary,
  fetchAllPages,
  intervalKey,
  intervalLabel,
  needsCardPaymentMethodNotice,
  parseIntervalKey,
  subscriptionErrorMessage,
} from "./utils";

describe("addInterval", () => {
  const add = (iso: string, unit: SubscriptionIntervalUnit, count: number) =>
    addInterval(new Date(iso), unit, count).toISOString();

  it("clamps a month to the last day of a shorter month", () => {
    expect(add("2026-01-31T00:00:00.000Z", SubscriptionIntervalUnit.Month, 1)).toBe("2026-02-28T00:00:00.000Z");
    expect(add("2026-03-31T09:30:00.000Z", SubscriptionIntervalUnit.Month, 3)).toBe("2026-06-30T09:30:00.000Z");
  });

  it("moves a month across the year end", () => {
    expect(add("2026-11-15T00:00:00.000Z", SubscriptionIntervalUnit.Month, 2)).toBe("2027-01-15T00:00:00.000Z");
  });

  it("clamps Feb 29 to Feb 28 in a year that is not a leap year", () => {
    expect(add("2028-02-29T00:00:00.000Z", SubscriptionIntervalUnit.Year, 1)).toBe("2029-02-28T00:00:00.000Z");
  });

  it("adds days and weeks in UTC, keeping the time of day", () => {
    expect(add("2026-03-27T23:30:00.000Z", SubscriptionIntervalUnit.Day, 3)).toBe("2026-03-30T23:30:00.000Z");
    expect(add("2026-10-20T00:00:00.000Z", SubscriptionIntervalUnit.Week, 2)).toBe("2026-11-03T00:00:00.000Z");
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

  it("falls back to the generic text for a refusal without a known reason, never the server's words", () => {
    expect(subscriptionErrorMessage(refused({}), t)).toBe("t:product_subscriptions.errors.generic");
    expect(subscriptionErrorMessage(refused({ data: { reason: "SOMETHING_NEW" } }), t)).toBe(
      "t:product_subscriptions.errors.generic",
    );
  });

  it("says the store turned the action off", () => {
    const error = { graphQLErrors: [{ extensions: { code: "SUBSCRIPTION_ACTION_DISABLED" } }] };
    expect(subscriptionErrorMessage(error, t)).toBe("t:product_subscriptions.errors.action_disabled");
  });

  it("falls back to the generic text for anything else", () => {
    expect(subscriptionErrorMessage(new Error("network"), t)).toBe("t:product_subscriptions.errors.generic");
  });
});

describe("configurationSummary", () => {
  const messages: Record<string, string> = {
    "product_subscriptions.configuration.product_quantity": "{name} × {quantity}",
    "product_subscriptions.configuration.custom_text": "«{text}»",
    "product_subscriptions.configuration.separator": " · ",
    "product_subscriptions.configuration.files_separator": ", ",
  };
  const t = ((key: string, named: Record<string, unknown> = {}) =>
    messages[key].replace(/\{(\w+)\}/g, (_, name: string) => String(named[name]))) as never;

  it("lists products with their quantity, texts in the locale's quotes and file names", () => {
    expect(
      configurationSummary(t, [
        { name: "Drinks", productName: "Fanta Mango", quantity: 6 },
        { name: "Snacks", productName: "Pretzels", quantity: 1 },
        { name: "Card", customText: "Thank you!" },
        { name: "Logo", files: [{ name: "logo.png" }, null, { name: "back.png" }] },
      ]),
    ).toBe("Fanta Mango × 6 · Pretzels · «Thank you!» · logo.png, back.png");
  });

  it("skips empty choices and has nothing for no configuration", () => {
    expect(configurationSummary(t, [{ name: "Logo", files: [] }])).toBe("");
    expect(configurationSummary(t, undefined)).toBe("");
  });
});
