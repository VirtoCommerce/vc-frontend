// The half of a KPI card no query decides. The registry turns this table into `statistics` blocks and
// useSalesRep*Widgets turns it into cards, so an id and a caption each exist in exactly one place.
import type { SalesRepLayoutScopeType } from "../types/layout";
import type { StatWidgetAccentType, StatWidgetCardType } from "../types/widgets";

export interface IStatCardDefType {
  /** Layout block id and `StatWidgetCardType.key` — one string, both sides. */
  key: string;
  labelKey: string;
  icon: string;
  accent: StatWidgetAccentType;
}

/** What is left for the statistics queries to fill in. */
export type StatCardDataType = Omit<StatWidgetCardType, keyof IStatCardDefType>;

export const DASHBOARD_STAT_CARDS = [
  {
    key: "new_orders",
    labelKey: "sales_rep.hub.dashboard.widgets.new_orders",
    icon: "exclamation-circle",
    accent: "warning",
  },
  { key: "active_carts", labelKey: "sales_rep.hub.dashboard.widgets.active_carts", icon: "cart", accent: "success" },
  {
    key: "orders_placed_week",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_week",
    icon: "cash",
    accent: "info",
  },
  {
    key: "orders_placed_mtd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
    icon: "cash",
    accent: "info",
  },
  {
    key: "orders_placed_ytd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
    icon: "cash",
    accent: "info",
  },
  { key: "my_customers", labelKey: "sales_rep.hub.dashboard.widgets.my_customers", icon: "users", accent: "neutral" },
] as const satisfies readonly IStatCardDefType[];

// Shared cards reuse the dashboard's i18n keys so both surfaces stay in sync across locales.
export const CUSTOMER_PROFILE_STAT_CARDS = [
  {
    key: "new_orders",
    labelKey: "sales_rep.hub.dashboard.widgets.new_orders",
    icon: "exclamation-circle",
    accent: "warning",
  },
  // The profile shows the cart's value, not a count — hence its own label.
  { key: "active_cart", labelKey: "sales_rep.hub.dashboard.widgets.active_cart", icon: "cart", accent: "success" },
  // This month's order value, not the count — hence "Purchased · MTD".
  { key: "mtd", labelKey: "sales_rep.hub.dashboard.widgets.purchased_mtd", icon: "cash", accent: "info" },
  // Same metric as the dashboard's "Orders placed · YTD", so it reuses its label, icon and accent.
  { key: "orders_ytd", labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd", icon: "cash", accent: "info" },
  {
    key: "aov",
    labelKey: "sales_rep.customer_profile.widgets.avg_order_value",
    icon: "presentation-chart-bar",
    accent: "secondary",
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
): StatWidgetCardType[] {
  return defs.map((def) => ({ ...def, ...data[def.key as T[number]["key"]] }));
}
