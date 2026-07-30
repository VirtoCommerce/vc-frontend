import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { buildStatCards, DASHBOARD_STAT_CARDS } from "../layout/stat-cards";
import { formatSignedPercent, formatStatCount } from "../utils";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepCustomerCounts } from "./useSalesRepCustomerCounts";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import type { StatWidgetCardType } from "../types/widgets";

// Shapes three statistics sources into the six dashboard KPI cards.
// Deltas are either period-over-period % (chevron) or plain "new activity" counts (no chevron).
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

    // Caption, icon and accent come from the shared table; only what the queries decide is here.
    return buildStatCards(DASHBOARD_STAT_CARDS, {
      new_orders: {
        value: formatStatCount(orders?.newOrders?.count),
        sub: orders?.newOrders
          ? t("sales_rep.hub.dashboard.stats.value_total", { amount: orders.newOrders.total.formattedAmount })
          : "",
        // "{n} placed today" — orders whose created date is today. Plain green count, no chevron.
        delta: placedToday ? t("sales_rep.hub.dashboard.stats.placed_today", { count: placedToday.count }) : "",
        deltaTone: "positive",
      },
      active_carts: {
        value: formatStatCount(carts?.activeCarts?.count),
        sub: carts?.activeCarts?.total.formattedAmount ?? "",
        // "{n} new this week" — active carts created this week. Plain green count, no chevron.
        delta: newCarts ? t("sales_rep.hub.dashboard.stats.new_this_week", { count: newCarts.count }) : "",
        deltaTone: "positive",
      },
      orders_placed_week: {
        value: formatStatCount(orders?.week?.count),
        sub: orders?.week?.total.formattedAmount ?? "",
        delta: weekDelta ? t("sales_rep.hub.dashboard.stats.vs_last_week", { delta: weekDelta.text }) : "",
        deltaTone: weekDelta?.tone,
        deltaIcon: weekDelta?.icon,
      },
      orders_placed_mtd: {
        value: formatStatCount(orders?.mtd?.count),
        sub: orders?.mtd?.total.formattedAmount ?? "",
        delta: mtdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_month", { delta: mtdDelta.text }) : "",
        deltaTone: mtdDelta?.tone,
        deltaIcon: mtdDelta?.icon,
      },
      orders_placed_ytd: {
        value: formatStatCount(orders?.ytd?.count),
        sub: orders?.ytd?.total.formattedAmount ?? "",
        delta: ytdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_year", { delta: ytdDelta.text }) : "",
        deltaTone: ytdDelta?.tone,
        deltaIcon: ytdDelta?.icon,
      },
      my_customers: {
        value: formatStatCount(customerCounts?.assignedCustomers),
        sub: thisMonth
          ? t("sales_rep.hub.dashboard.stats.ordered_this_month", { count: thisMonth.orderingCustomers })
          : "",
        // "{n} new customers" — customers newly assigned to the rep this month (backend assignment date).
        delta: thisMonth ? t("sales_rep.hub.dashboard.stats.new_customers", { count: thisMonth.newCustomers }) : "",
        deltaTone: "positive",
      },
    });
  });

  return { cards, loading };
}
