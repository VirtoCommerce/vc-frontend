// The half of a KPI card no query decides. layout/blocks.ts turns these tables into `statistics` blocks and
// useSalesRep*Widgets turns them into cards, so an id and a caption each exist in exactly one place.
import type { StatDataNeedType } from "../types/widgets";
import type { IStatCardDefType } from "@/shared/dashboard";

export const DASHBOARD_STAT_CARDS = [
  {
    key: "new_orders",
    labelKey: "sales_rep.hub.dashboard.widgets.new_orders",
    icon: "exclamation-circle",
    color: "warning",
    needs: ["newOrders"],
  },
  {
    key: "active_carts",
    labelKey: "sales_rep.hub.dashboard.widgets.active_carts",
    icon: "cart",
    color: "success",
    needs: ["cartStatistics"],
  },
  {
    key: "orders_placed_week",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_week",
    icon: "cash",
    color: "info",
    needs: ["week"],
  },
  {
    key: "orders_placed_mtd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
    icon: "cash",
    color: "info",
    needs: ["mtd", "monthOverMonth"],
  },
  {
    key: "orders_placed_ytd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
    icon: "cash",
    color: "info",
    needs: ["ytd", "yearOverYear"],
  },
  {
    key: "my_customers",
    labelKey: "sales_rep.hub.dashboard.widgets.my_customers",
    icon: "users",
    color: "neutral",
    needs: ["customerCounts"],
  },
] as const satisfies readonly IStatCardDefType<StatDataNeedType>[];

// Shared cards reuse the dashboard's i18n keys so both surfaces stay in sync across locales.
export const CUSTOMER_PROFILE_STAT_CARDS = [
  {
    key: "new_orders",
    labelKey: "sales_rep.hub.dashboard.widgets.new_orders",
    icon: "exclamation-circle",
    color: "warning",
    needs: ["newOrders"],
  },
  // Same metric as the dashboard's "Active carts" (item quantities), so it reuses its label; the block id
  // stays singular so saved customer-profile layouts keep matching.
  {
    key: "active_cart",
    labelKey: "sales_rep.hub.dashboard.widgets.active_carts",
    icon: "cart",
    color: "success",
    needs: ["cartStatistics"],
  },
  // This month's order value, not the count — hence "Purchased · MTD". Its delta is a share of the
  // year's revenue, so it needs `ytd` as well as its own period, and no month-over-month baseline.
  {
    key: "mtd",
    labelKey: "sales_rep.hub.dashboard.widgets.purchased_mtd",
    icon: "cash",
    color: "info",
    needs: ["mtd", "ytd"],
  },
  // Same metric as the dashboard's "Orders placed · YTD", so it reuses its label, icon and color.
  {
    key: "orders_ytd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
    icon: "cash",
    color: "info",
    needs: ["ytd", "yearOverYear"],
  },
  {
    key: "aov",
    labelKey: "sales_rep.customer_profile.widgets.avg_order_value",
    icon: "presentation-chart-bar",
    color: "secondary",
    needs: ["ytd", "averageOrderValue"],
  },
] as const satisfies readonly IStatCardDefType<StatDataNeedType>[];
