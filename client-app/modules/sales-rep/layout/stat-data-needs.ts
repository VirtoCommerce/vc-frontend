// Turns "which cards is the rep looking at" into "what must the statistics queries ask for". Pure, so
// the mapping is testable on its own; the reactive half lives in composables/useStatDataNeeds.ts.
//
// The point of the indirection: before this, one document served both surfaces and its selection was a
// hand-kept union of their needs, so the customer profile paid for three buckets it never renders
// (VCST-5647). Here the selection is derived instead — declare a card's `needs` in stat-cards.ts and
// both the document and the enabled/disabled decision follow.
import { STAT_CARDS } from "./stat-cards";
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
