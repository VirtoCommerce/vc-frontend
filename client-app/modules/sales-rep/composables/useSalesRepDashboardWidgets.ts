import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatSignedPercent, formatStatCount } from "../utils";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepCustomerCounts } from "./useSalesRepCustomerCounts";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import type { StatWidgetCardType } from "../types/widgets";

// MAPPING: shapes three statistics SOURCES into the six dashboard KPI cards the StatWidget row renders
// (VCST-5485). The order-statistics source feeds FOUR cards (New orders + Orders placed WEEK/MTD/YTD) from
// its aliased slices; the cart source feeds Active carts; customer-counts feeds My customers. Labels stay
// as `labelKey` (the component localizes them); sub/delta are pre-localized here.
//
// Two delta kinds:
//  • Period-over-period % (WEEK/MTD/YTD "orders placed") → formatSignedPercent on the order-COUNT change:
//    green ↑ when higher than the previous period, red/orange ↓ when lower, neutral — at 0%, omitted when the
//    baseline is zero (null percent).
//  • Plain informational counts (New orders "placed today", Active carts "new this week", My customers
//    "new customers") → a green count with NO chevron (not a comparison); rendered whenever the slice loaded.
export function useSalesRepDashboardWidgets() {
  const { t } = useI18n();
  const { statistics: orderStatistics, loading: ordersLoading } = useSalesRepOrderStatistics();
  const { statistics: cartStatistics, loading: cartsLoading } = useSalesRepCartStatistics();
  const { counts, loading: countsLoading } = useSalesRepCustomerCounts();

  const loading = computed(() => ordersLoading.value || cartsLoading.value || countsLoading.value);

  const cards = computed<StatWidgetCardType[]>(() => {
    const orders = orderStatistics.value;
    const carts = cartStatistics.value;
    const customerCounts = counts.value;

    // Plain "new activity" counts (green, no icon) — a count, not a comparison.
    const placedToday = orders?.newOrdersToday;
    const newCarts = carts?.newCartsThisWeek;
    const thisMonth = customerCounts?.thisMonth;

    // Period-over-period comparisons on order count (tri-state; undefined when the previous period is zero).
    const weekDelta = formatSignedPercent(orders?.weekVsPrevWeek?.countChangePercent);
    const mtdDelta = formatSignedPercent(orders?.mtdVsPrevMonth?.countChangePercent);
    const ytdDelta = formatSignedPercent(orders?.ytdVsLastYear?.countChangePercent);

    return [
      {
        key: "new_orders",
        labelKey: "sales_rep.hub.dashboard.widgets.new_orders",
        icon: "exclamation-circle",
        accent: "warning",
        value: formatStatCount(orders?.newOrders?.count),
        sub: orders?.newOrders
          ? t("sales_rep.hub.dashboard.stats.value_total", { amount: orders.newOrders.total.formattedAmount })
          : "",
        // "{n} placed today" — orders whose created date is today. Plain green count, no chevron.
        delta: placedToday ? t("sales_rep.hub.dashboard.stats.placed_today", { count: placedToday.count }) : "",
        deltaTone: "positive",
      },
      {
        key: "active_carts",
        labelKey: "sales_rep.hub.dashboard.widgets.active_carts",
        icon: "cart",
        accent: "success",
        value: formatStatCount(carts?.activeCarts?.count),
        sub: carts?.activeCarts?.total.formattedAmount ?? "",
        // "{n} new this week" — active carts created this week. Plain green count, no chevron.
        delta: newCarts ? t("sales_rep.hub.dashboard.stats.new_this_week", { count: newCarts.count }) : "",
        deltaTone: "positive",
      },
      {
        key: "orders_placed_week",
        labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_week",
        icon: "cash",
        accent: "info",
        value: formatStatCount(orders?.week?.count),
        sub: orders?.week?.total.formattedAmount ?? "",
        delta: weekDelta ? t("sales_rep.hub.dashboard.stats.vs_last_week", { delta: weekDelta.text }) : "",
        deltaTone: weekDelta?.tone,
        deltaIcon: weekDelta?.icon,
      },
      {
        key: "orders_placed_mtd",
        labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
        icon: "cash",
        accent: "info",
        value: formatStatCount(orders?.mtd?.count),
        sub: orders?.mtd?.total.formattedAmount ?? "",
        delta: mtdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_month", { delta: mtdDelta.text }) : "",
        deltaTone: mtdDelta?.tone,
        deltaIcon: mtdDelta?.icon,
      },
      {
        key: "orders_placed_ytd",
        labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
        icon: "cash",
        accent: "info",
        value: formatStatCount(orders?.ytd?.count),
        sub: orders?.ytd?.total.formattedAmount ?? "",
        delta: ytdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_year", { delta: ytdDelta.text }) : "",
        deltaTone: ytdDelta?.tone,
        deltaIcon: ytdDelta?.icon,
      },
      {
        key: "my_customers",
        labelKey: "sales_rep.hub.dashboard.widgets.my_customers",
        icon: "users",
        accent: "neutral",
        value: formatStatCount(customerCounts?.assignedCustomers),
        sub: thisMonth
          ? t("sales_rep.hub.dashboard.stats.ordered_this_month", { count: thisMonth.orderingCustomers })
          : "",
        // "{n} new customers" — customers newly ASSIGNED to the rep this month (backend assignment date).
        // Plain green count, no chevron.
        delta: thisMonth ? t("sales_rep.hub.dashboard.stats.new_customers", { count: thisMonth.newCustomers }) : "",
        deltaTone: "positive",
      },
    ];
  });

  return { cards, loading };
}
