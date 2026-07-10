import { describe, it, expect } from "vitest";
import { getDisplayTotals } from "./index";
import type { CustomerOrderType, MoneyType, OrderTotalType } from "@/core/api/graphql/types";

function money(code: string, amount = 100): MoneyType {
  return {
    amount,
    formattedAmount: `${amount} ${code}`,
    formattedAmountWithoutCurrency: `${amount}`,
    currency: { code, symbol: code },
  } as MoneyType;
}

function orderTotal(code: string, isDefault: boolean): OrderTotalType {
  return {
    isDefaultTotalCurrency: isDefault,
    total: money(code),
    subTotal: money(code),
    discountTotal: money(code),
    taxTotal: money(code),
  };
}

describe("getDisplayTotals", () => {
  it("returns per-currency totals with the default currency first", () => {
    const order = {
      total: money("USD"),
      orderTotals: [orderTotal("EUR", false), orderTotal("USD", true)],
    } as CustomerOrderType;

    const result = getDisplayTotals(order);

    expect(result.map((t) => t.currency.code)).toEqual(["USD", "EUR"]);
  });

  it("keeps the default currency first even when it is already first", () => {
    const order = {
      total: money("USD"),
      orderTotals: [orderTotal("USD", true), orderTotal("EUR", false)],
    } as CustomerOrderType;

    expect(getDisplayTotals(order).map((t) => t.currency.code)).toEqual(["USD", "EUR"]);
  });

  it("falls back to the order total when orderTotals is empty", () => {
    const order = { total: money("USD"), orderTotals: [] } as unknown as CustomerOrderType;

    expect(getDisplayTotals(order)).toEqual([order.total]);
  });

  it("falls back to the order total when orderTotals is undefined", () => {
    const order = { total: money("USD") } as CustomerOrderType;

    expect(getDisplayTotals(order)).toEqual([order.total]);
  });

  it("ignores null entries in orderTotals", () => {
    const order = {
      total: money("USD"),
      orderTotals: [null, orderTotal("USD", true)],
    } as unknown as CustomerOrderType;

    expect(getDisplayTotals(order).map((t) => t.currency.code)).toEqual(["USD"]);
  });

  it("returns an empty array when there is neither total nor orderTotals", () => {
    const order = {} as CustomerOrderType;

    expect(getDisplayTotals(order)).toEqual([]);
  });

  it("does not mutate the original orderTotals order", () => {
    const totals = [orderTotal("EUR", false), orderTotal("USD", true)];
    const order = { total: money("USD"), orderTotals: totals } as CustomerOrderType;

    getDisplayTotals(order);

    // The source array must keep its original ordering (sort runs on a filtered copy).
    expect(totals.map((t) => t.total.currency.code)).toEqual(["EUR", "USD"]);
  });
});
