import { describe, expect, it } from "vitest";
import { STAT_CARDS } from "./stat-cards";
import {
  allStatDataNeeds,
  needsCartStatistics,
  needsCustomerCounts,
  needsOrderStatistics,
  orderStatisticsFlags,
  statDataNeeds,
} from "./stat-data-needs";
import type { SalesRepLayoutScopeType } from "../types/layout";

const everyCard = (scope: SalesRepLayoutScopeType) => STAT_CARDS[scope].map((card) => card.key);

describe("stat data needs", () => {
  it("asks for nothing when no card is visible, so the queries do not run", () => {
    const needs = statDataNeeds("dashboard", []);

    expect(needsOrderStatistics(needs)).toBe(false);
    expect(needsCartStatistics(needs)).toBe(false);
    expect(needsCustomerCounts(needs)).toBe(false);
  });

  it("drops a whole query when the only card it feeds is hidden", () => {
    const withoutCarts = everyCard("dashboard").filter((key) => key !== "active_carts");
    const withoutCounts = everyCard("dashboard").filter((key) => key !== "my_customers");

    expect(needsCartStatistics(statDataNeeds("dashboard", withoutCarts))).toBe(false);
    expect(needsCustomerCounts(statDataNeeds("dashboard", withoutCounts))).toBe(false);
    // The order statistics still have four cards to feed, so that query stays.
    expect(needsOrderStatistics(statDataNeeds("dashboard", withoutCarts))).toBe(true);
  });

  /**
   * The finding behind VCST-5647: one document served both surfaces, so the profile fetched the week
   * bucket, its previous-week baseline and the previous-month baseline for cards it does not have.
   */
  it("leaves the week and month-over-month slices out of the customer profile", () => {
    const flags = orderStatisticsFlags(allStatDataNeeds("customerProfile"));

    expect(flags.withWeek).toBe(false);
    expect(flags.withMonthOverMonth).toBe(false);
    // What the profile does render.
    expect(flags).toMatchObject({
      withNewOrders: true,
      withMtd: true,
      withYtd: true,
      withYearOverYear: true,
      withAverageOrderValue: true,
    });
  });

  it("leaves the average out of the dashboard, which has no avg-order-value card", () => {
    const flags = orderStatisticsFlags(allStatDataNeeds("dashboard"));

    expect(flags.withAverageOrderValue).toBe(false);
    expect(flags).toMatchObject({ withWeek: true, withMonthOverMonth: true, withYearOverYear: true });
  });

  it("keeps a period when only its comparison card is hidden, and vice versa", () => {
    // "Purchased · MTD" is gone but "Orders placed · YTD" remains: no mtd slice, ytd intact.
    const ytdOnly = orderStatisticsFlags(statDataNeeds("customerProfile", ["orders_ytd"]));
    expect(ytdOnly).toMatchObject({ withMtd: false, withYtd: true, withYearOverYear: true });

    // The dashboard's week card alone: its own bucket and baseline, nothing else.
    const weekOnly = orderStatisticsFlags(statDataNeeds("dashboard", ["orders_placed_week"]));
    expect(weekOnly).toMatchObject({ withWeek: true, withMtd: false, withYtd: false, withYearOverYear: false });
  });

  it("ignores an id no card matches, as a stale saved layout may name one", () => {
    expect(statDataNeeds("dashboard", ["a-widget-this-build-dropped"]).size).toBe(0);
  });

  // A card whose figures nothing fetches renders a permanent zero, which is the failure this table is
  // meant to prevent — so every registered card has to declare at least one source.
  it.each(["dashboard", "customerProfile"] as const)("%s: every card declares what it needs", (scope) => {
    for (const card of STAT_CARDS[scope]) {
      expect(card.needs.length, `${scope}/${card.key}`).toBeGreaterThan(0);
    }
  });

  // Guards the enabled/flag split: a surface asking for a query must also select something in it.
  it.each(["dashboard", "customerProfile"] as const)("%s: asks for at least one order slice", (scope) => {
    const needs = allStatDataNeeds(scope);
    const flags = orderStatisticsFlags(needs);

    expect(needsOrderStatistics(needs)).toBe(true);
    expect(Object.values(flags).some(Boolean)).toBe(true);
  });
});
