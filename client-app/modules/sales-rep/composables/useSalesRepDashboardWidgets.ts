import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatSignedPercent, formatStatCount, formatStatMoney } from "../utils";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepCustomerCounts } from "./useSalesRepCustomerCounts";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import type { StatWidgetCardType } from "../types/widgets";

// Shapes three statistics sources into the six dashboard KPI cards.
// Deltas are either period-over-period % (chevron) or plain "new activity" counts (no chevron).
export function useSalesRepDashboardWidgets() {
  const { t } = useI18n();
  const { statistics: orderStatistics, loading: ordersLoading, error: ordersError } = useSalesRepOrderStatistics();
  const { statistics: cartStatistics, loading: cartsLoading, error: cartsError } = useSalesRepCartStatistics();
  const { counts, loading: countsLoading, error: countsError } = useSalesRepCustomerCounts();

  const loading = computed(() => ordersLoading.value || cartsLoading.value || countsLoading.value);
  // Card-wide, not per-source: the cards mix sources, and a partial failure still can't be trusted.
  const failed = computed(() => Boolean(ordersError.value ?? cartsError.value ?? countsError.value));

  const cards = computed<StatWidgetCardType[]>(() => {
    const orders = orderStatistics.value;
    const carts = cartStatistics.value;
    const customerCounts = counts.value;

    // Plain "new activity" counts (green, no icon) — a count, not a comparison. Always rendered, so
    // an empty period reads as "0 placed today" rather than dropping the row (VCST-5586).
    const placedToday = formatStatCount(orders?.newOrdersToday?.count);
    const newCarts = formatStatCount(carts?.newCartsThisWeek?.count);
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
        sub: t("sales_rep.hub.dashboard.stats.value_total", {
          amount: formatStatMoney(orders?.newOrders?.total),
        }),
        // "{n} placed today" — orders whose created date is today. Plain green count, no chevron.
        delta: t("sales_rep.hub.dashboard.stats.placed_today", { count: placedToday }),
        deltaTone: "positive",
      },
      {
        key: "active_carts",
        labelKey: "sales_rep.hub.dashboard.widgets.active_carts",
        icon: "cart",
        accent: "success",
        value: formatStatCount(carts?.activeCarts?.count),
        sub: formatStatMoney(carts?.activeCarts?.total),
        // "{n} new this week" — active carts created this week. Plain green count, no chevron.
        delta: t("sales_rep.hub.dashboard.stats.new_this_week", { count: newCarts }),
        deltaTone: "positive",
      },
      {
        key: "orders_placed_week",
        labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_week",
        icon: "cash",
        accent: "info",
        value: formatStatCount(orders?.week?.count),
        sub: formatStatMoney(orders?.week?.total),
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
        sub: formatStatMoney(orders?.mtd?.total),
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
        sub: formatStatMoney(orders?.ytd?.total),
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
        sub: t("sales_rep.hub.dashboard.stats.ordered_this_month", {
          count: formatStatCount(thisMonth?.orderingCustomers),
        }),
        // "{n} new customers" — customers newly assigned to the rep this month (backend assignment date).
        delta: t("sales_rep.hub.dashboard.stats.new_customers", { count: formatStatCount(thisMonth?.newCustomers) }),
        deltaTone: "positive",
      },
    ];
  });

  return { cards, loading, failed };
}
