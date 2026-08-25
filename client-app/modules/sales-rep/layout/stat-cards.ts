// The half of a KPI card no query decides. The registry turns this table into `statistics` blocks and
// useSalesRep*Widgets turns it into cards, so an id and a caption each exist in exactly one place.
import { statCardState } from "./stat-data-needs";
import type { StatDataSourcesType, StatQueryKeyType, StatQueryStateType } from "./stat-data-needs";
import type { SalesRepLayoutScopeType } from "../types/layout";
import type { StatDataNeedType, StatWidgetAccentType, StatWidgetCardType } from "../types/widgets";

export interface IStatCardDefType {
  /** Layout block id and `StatWidgetCardType.key` — one string, both sides. */
  key: string;
  labelKey: string;
  icon: string;
  accent: StatWidgetAccentType;
  /**
   * Everything the card's own figures come from, so the statistics queries can be shaped from the
   * visible cards instead of a hand-kept union (`layout/stat-data-needs.ts`). Declare what the card
   * *renders*: a token is not implied by another, so a card showing a period and its comparison names
   * both.
   */
  needs: readonly StatDataNeedType[];
}

/**
 * What is left for the statistics queries to fill in. `loading`/`failed` are excluded on purpose:
 * `buildStatCards` derives them from the card's own `needs`, so a mapper cannot hand a card the wrong
 * pending state and a new card cannot forget one.
 */
export type StatCardDataType = Omit<StatWidgetCardType, keyof IStatCardDefType | "loading" | "failed">;

export const DASHBOARD_STAT_CARDS = [
  {
    key: "new_orders",
    labelKey: "sales_rep.hub.dashboard.widgets.new_orders",
    icon: "exclamation-circle",
    accent: "warning",
    needs: ["newOrders"],
  },
  {
    key: "active_carts",
    labelKey: "sales_rep.hub.dashboard.widgets.active_carts",
    icon: "cart",
    accent: "success",
    needs: ["cartStatistics"],
  },
  {
    key: "orders_placed_week",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_week",
    icon: "cash",
    accent: "info",
    needs: ["week"],
  },
  {
    key: "orders_placed_mtd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
    icon: "cash",
    accent: "info",
    needs: ["mtd", "monthOverMonth"],
  },
  {
    key: "orders_placed_ytd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
    icon: "cash",
    accent: "info",
    needs: ["ytd", "yearOverYear"],
  },
  {
    key: "my_customers",
    labelKey: "sales_rep.hub.dashboard.widgets.my_customers",
    icon: "users",
    accent: "neutral",
    needs: ["customerCounts"],
  },
] as const satisfies readonly IStatCardDefType[];

// Shared cards reuse the dashboard's i18n keys so both surfaces stay in sync across locales.
export const CUSTOMER_PROFILE_STAT_CARDS = [
  {
    key: "new_orders",
    labelKey: "sales_rep.hub.dashboard.widgets.new_orders",
    icon: "exclamation-circle",
    accent: "warning",
    needs: ["newOrders"],
  },
  // Same metric as the dashboard's "Active carts" (item quantities), so it reuses its label; the block id
  // stays singular so saved customer-profile layouts keep matching.
  {
    key: "active_cart",
    labelKey: "sales_rep.hub.dashboard.widgets.active_carts",
    icon: "cart",
    accent: "success",
    needs: ["cartStatistics"],
  },
  // This month's order value, not the count — hence "Purchased · MTD". Its delta is a share of the
  // year's revenue, so it needs `ytd` as well as its own period, and no month-over-month baseline.
  {
    key: "mtd",
    labelKey: "sales_rep.hub.dashboard.widgets.purchased_mtd",
    icon: "cash",
    accent: "info",
    needs: ["mtd", "ytd"],
  },
  // Same metric as the dashboard's "Orders placed · YTD", so it reuses its label, icon and accent.
  {
    key: "orders_ytd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
    icon: "cash",
    accent: "info",
    needs: ["ytd", "yearOverYear"],
  },
  {
    key: "aov",
    labelKey: "sales_rep.customer_profile.widgets.avg_order_value",
    icon: "presentation-chart-bar",
    accent: "secondary",
    needs: ["ytd", "averageOrderValue"],
  },
] as const satisfies readonly IStatCardDefType[];

export const STAT_CARDS: Record<SalesRepLayoutScopeType, readonly IStatCardDefType[]> = {
  dashboard: DASHBOARD_STAT_CARDS,
  customerProfile: CUSTOMER_PROFILE_STAT_CARDS,
};

/**
 * `data` is a total record over the table's keys, so shipping a card without wiring its value is a
 * compile error rather than a blank tile.
 */
export function buildStatCards<T extends readonly IStatCardDefType[]>(
  defs: T,
  data: Record<T[number]["key"], StatCardDataType>,
  queries: { sources: StatDataSourcesType; states: Record<StatQueryKeyType, StatQueryStateType> },
): StatWidgetCardType[] {
  return defs.map((def) => ({
    ...def,
    ...data[def.key as T[number]["key"]],
    ...statCardState(def.needs, queries.sources, queries.states),
  }));
}
