import { describe, expect, it } from "vitest";
import { SubscriptionDiscountType } from "./api/graphql/types";
import { configurationChoiceText, configurationSummary, subscriptionUnitPrice } from "./utils";

describe("subscriptionUnitPrice", () => {
  it("takes a percent off the configured price", () => {
    expect(subscriptionUnitPrice(24.6, SubscriptionDiscountType.Percent, 10)).toBeCloseTo(22.14, 2);
  });

  it("takes a fixed amount off, never below zero", () => {
    expect(subscriptionUnitPrice(24.6, SubscriptionDiscountType.FixedAmount, 5)).toBeCloseTo(19.6, 2);
    expect(subscriptionUnitPrice(3, SubscriptionDiscountType.FixedAmount, 5)).toBe(0);
  });

  it("keeps the price without a discount", () => {
    expect(subscriptionUnitPrice(24.6, SubscriptionDiscountType.None, 10)).toBeCloseTo(24.6, 2);
    expect(subscriptionUnitPrice(24.6, undefined, undefined)).toBeCloseTo(24.6, 2);
  });

  it("follows the configured price when the options change", () => {
    const prices = [24.6, 30, 12.5].map((price) => subscriptionUnitPrice(price, SubscriptionDiscountType.Percent, 10));
    [22.14, 27, 11.25].forEach((expected, i) => expect(prices[i]).toBeCloseTo(expected, 2));
  });
});

describe("configurationSummary", () => {
  it("lists products with their quantity, texts in quotes and file names", () => {
    expect(
      configurationSummary([
        { name: "Drinks", productName: "Fanta Mango", quantity: 6 },
        { name: "Snacks", productName: "Pretzels", quantity: 1 },
        { name: "Card", customText: "Thank you!" },
        { name: "Logo", files: [{ name: "logo.png" }, null] },
      ]),
    ).toBe("Fanta Mango × 6 · Pretzels · “Thank you!” · logo.png");
  });

  it("skips empty choices and has nothing for no configuration", () => {
    expect(configurationSummary([{ name: "Logo", files: [] }])).toBe("");
    expect(configurationSummary(undefined)).toBe("");
  });

  it("shows one choice on its own", () => {
    expect(configurationChoiceText({ customText: "Hi" })).toBe("“Hi”");
  });
});
