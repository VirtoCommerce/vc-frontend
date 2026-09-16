// Turns "which cards is the rep looking at" into "what must the statistics queries ask for". Pure, so
// the mapping is testable on its own; the reactive half lives in composables/useStatDataNeeds.ts.
//
// The point of the indirection: before this, one document served both surfaces and its selection was a
// hand-kept union of their needs, so the customer profile paid for three buckets it never renders
// (VCST-5647). Here the selection is derived instead — declare a card's `needs` in stat-cards.ts and
// both the document and the enabled/disabled decision follow.
import { STAT_CARDS } from "./stat-cards";
import type {
  SalesRepCustomerCartStatisticsQuery,
  SalesRepCustomerCountsQuery,
  SalesRepCustomerOrderStatisticsQuery,
} from "../api/graphql/types";
import type { SalesRepLayoutScopeType } from "../types/layout";
import type { StatDataNeedType } from "../types/widgets";

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

/** The union over the named cards. An id no card matches is ignored — the saved layout may name a
 * widget this build no longer ships, exactly as `reconcileLayout` treats it. */
export function statDataNeeds(
  scope: SalesRepLayoutScopeType,
  cardIds: Iterable<string>,
): ReadonlySet<StatDataNeedType> {
  const wanted = new Set(cardIds);
  const needs = new Set<StatDataNeedType>();

  for (const card of STAT_CARDS[scope]) {
    if (wanted.has(card.key)) {
      for (const need of card.needs) {
        needs.add(need);
      }
    }
  }

  return needs;
}

/** Every card on the surface — what layout-edit mode needs, since the parked zone renders the hidden
 * cards too and they would otherwise sit at zero. */
export function allStatDataNeeds(scope: SalesRepLayoutScopeType): ReadonlySet<StatDataNeedType> {
  return statDataNeeds(
    scope,
    STAT_CARDS[scope].map((card) => card.key),
  );
}

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

export type StatQueryStateType = { loading: boolean; failed: boolean };

// The query fields are nullable, so `NonNullable` keeps the `?` as the only source of undefined —
// otherwise the two say the same thing twice (Sonar S4782).
export type StatDataSourcesType = {
  orders?: NonNullable<SalesRepCustomerOrderStatisticsQuery["salesRepCustomerOrderStatistics"]>;
  carts?: NonNullable<SalesRepCustomerCartStatisticsQuery["salesRepCustomerCartStatistics"]>;
  counts?: NonNullable<SalesRepCustomerCountsQuery["salesRepCustomerCounts"]>;
};

/**
 * Which query answers a need, and how to tell that need's slice actually arrived — the mirror of
 * `orderStatisticsFlags`: that turns needs into a request, this reads them back out of the response.
 */
const NEED_RESULTS: Record<
  StatDataNeedType,
  { query: StatQueryKeyType; arrived: (sources: StatDataSourcesType) => boolean }
> = {
  newOrders: { query: "orders", arrived: ({ orders }) => Boolean(orders?.newOrders && orders?.recentOrders) },
  week: { query: "orders", arrived: ({ orders }) => Boolean(orders?.week) },
  mtd: { query: "orders", arrived: ({ orders }) => Boolean(orders?.mtd) },
  monthOverMonth: { query: "orders", arrived: ({ orders }) => Boolean(orders?.mtdVsPrevMonth) },
  ytd: { query: "orders", arrived: ({ orders }) => Boolean(orders?.ytd) },
  yearOverYear: { query: "orders", arrived: ({ orders }) => Boolean(orders?.ytdVsLastYear) },
  averageOrderValue: { query: "orders", arrived: ({ orders }) => Boolean(orders?.ytd?.average) },
  cartStatistics: { query: "carts", arrived: ({ carts }) => Boolean(carts?.activeCarts) },
  customerCounts: { query: "counts", arrived: ({ counts }) => Boolean(counts) },
};

/**
 * A card is pending only while a query it reads is in flight AND that query has not delivered the slice
 * this card renders. Entering layout-edit mode widens the `@include` flags, which is a variable change,
 * which restarts the order query — so a per-query flag would blank every order-fed card for a full round
 * trip even though its figures are in hand (VCST-5647).
 */
export function statCardState(
  needs: readonly StatDataNeedType[],
  sources: StatDataSourcesType,
  states: Record<StatQueryKeyType, StatQueryStateType>,
): StatQueryStateType {
  let loading = false;
  let failed = false;

  for (const need of needs) {
    const { query, arrived } = NEED_RESULTS[need];
    const state = states[query];

    if (state.failed) {
      failed = true;
    }

    if (state.loading && !arrived(sources)) {
      loading = true;
    }
  }

  return { loading, failed };
}
