// The module's half of "which cards is the rep looking at" → "what must the statistics queries ask for".
// The engine (@/shared/dashboard) turns the visible cards into a set of need tokens; this file turns those
// tokens into the three queries' `@include` flags and `enabled` decisions, and reads them back out of the
// responses. Pure, so the mapping is testable on its own.
//
// The point of the indirection: before it, one document served both surfaces and its selection was a
// hand-kept union of their needs, so the customer profile paid for three buckets it never renders
// (VCST-5647). Here the selection is derived instead — declare a card's `needs` in stat-cards.ts and
// both the document and the enabled/disabled decision follow.
import type {
  SalesRepCustomerCartStatisticsQuery,
  SalesRepCustomerCountsQuery,
  SalesRepCustomerOrderStatisticsQuery,
} from "../api/graphql/types";
import type { StatDataNeedType } from "../types/widgets";
import type { StatNeedResultType } from "@/shared/dashboard";

/** The `@include` flags of the order-statistics document, one per gated slice. */
export type OrderStatisticsFlagsType = {
  withNewOrders: boolean;
  withWeek: boolean;
  withMtd: boolean;
  withMonthOverMonth: boolean;
  withYtd: boolean;
  withYearOverYear: boolean;
  withAverageOrderValue: boolean;
};

export function orderStatisticsFlags(needs: ReadonlySet<StatDataNeedType>): OrderStatisticsFlagsType {
  return {
    withNewOrders: needs.has("newOrders"),
    withWeek: needs.has("week"),
    withMtd: needs.has("mtd"),
    withMonthOverMonth: needs.has("monthOverMonth"),
    withYtd: needs.has("ytd"),
    withYearOverYear: needs.has("yearOverYear"),
    withAverageOrderValue: needs.has("averageOrderValue"),
  };
}

/**
 * Whether the order-statistics query has anything to fetch. Deliberately blind to
 * `averageOrderValue`: it is a field inside the `ytd` slice, so on its own it would select nothing and
 * the round trip would return only the currency code.
 */
export function needsOrderStatistics(needs: ReadonlySet<StatDataNeedType>): boolean {
  return (
    needs.has("newOrders") ||
    needs.has("week") ||
    needs.has("mtd") ||
    needs.has("monthOverMonth") ||
    needs.has("ytd") ||
    needs.has("yearOverYear")
  );
}

export function needsCartStatistics(needs: ReadonlySet<StatDataNeedType>): boolean {
  return needs.has("cartStatistics");
}

export function needsCustomerCounts(needs: ReadonlySet<StatDataNeedType>): boolean {
  return needs.has("customerCounts");
}

/** The three statistics queries a card can be fed by. */
export type StatQueryKeyType = "orders" | "carts" | "counts";

// The query fields are nullable, so `NonNullable` keeps the `?` as the only source of undefined —
// otherwise the two say the same thing twice (Sonar S4782).
export type StatDataSourcesType = {
  orders?: NonNullable<SalesRepCustomerOrderStatisticsQuery["salesRepCustomerOrderStatistics"]>;
  carts?: NonNullable<SalesRepCustomerCartStatisticsQuery["salesRepCustomerCartStatistics"]>;
  counts?: NonNullable<SalesRepCustomerCountsQuery["salesRepCustomerCounts"]>;
};

/**
 * Which query answers each need, and whether that need's slice actually arrived — the mirror of
 * `orderStatisticsFlags`: that turns needs into a request, this reads them back out of the response.
 * The engine's `statCardState` combines it with the queries' loading/failed states per card.
 */
export function statNeedResults({
  orders,
  carts,
  counts,
}: StatDataSourcesType): Record<StatDataNeedType, StatNeedResultType<StatQueryKeyType>> {
  return {
    newOrders: { query: "orders", arrived: Boolean(orders?.newOrders && orders?.recentOrders) },
    week: { query: "orders", arrived: Boolean(orders?.week) },
    mtd: { query: "orders", arrived: Boolean(orders?.mtd) },
    monthOverMonth: { query: "orders", arrived: Boolean(orders?.mtdVsPrevMonth) },
    ytd: { query: "orders", arrived: Boolean(orders?.ytd) },
    yearOverYear: { query: "orders", arrived: Boolean(orders?.ytdVsLastYear) },
    averageOrderValue: { query: "orders", arrived: Boolean(orders?.ytd?.average) },
    cartStatistics: { query: "carts", arrived: Boolean(carts?.activeCarts) },
    customerCounts: { query: "counts", arrived: Boolean(counts) },
  };
}
