import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { formatSignedPercent, formatStatCount, formatStatMoney } from "../utils";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import type { StatWidgetCardType } from "../types/widgets";
import type { MaybeRefOrGetter } from "vue";

// Per-customer KPI cards; shared cards reuse the dashboard's i18n keys (hub.dashboard.*) so both
// surfaces stay in sync across locales.
export function useSalesRepCustomerWidgets(organizationId: MaybeRefOrGetter<string>) {
  const { t } = useI18n();
  const orgId = (): string => toValue(organizationId);

  const {
    statistics: orderStatistics,
    loading: ordersLoading,
    error: ordersError,
  } = useSalesRepOrderStatistics({ organizationId: orgId });
  const {
    statistics: cartStatistics,
    loading: cartsLoading,
    error: cartsError,
  } = useSalesRepCartStatistics({ organizationId: orgId });

  const cards = computed<StatWidgetCardType[]>(() => {
    const orders = orderStatistics.value;
    const carts = cartStatistics.value;

    // Each card reads exactly one query, so it carries that query's state and no other's.
    const ordersState = { loading: ordersLoading.value, failed: Boolean(ordersError.value) };
    const cartsState = { loading: cartsLoading.value, failed: Boolean(cartsError.value) };
    const ytd = orders?.ytd;
    const mtd = orders?.mtd;

    // Orders YTD compares vs last year on order COUNT (same metric as the dashboard "Orders placed · YTD").
    const ytdDelta = formatSignedPercent(orders?.ytdVsLastYear?.countChangePercent);
    // Plain green count (no chevron) — New-status orders placed today, for this customer. Formatted
    // string renders; the raw number is vue-i18n's plural selector (see the dashboard mapper).
    const placedToday = orders?.newOrdersToday?.count ?? 0;
    // Active cart: the summed total of this customer's non-empty carts.
    const activeCarts = carts?.activeCarts;
    // This month's revenue as a share of the year's — a client-side ratio, not a backend field.
    // 0 with no YTD revenue to divide by, so the row reads like every other empty metric.
    const ytdAmount = ytd?.total.amount ?? 0;
    const mtdShare = mtd && ytdAmount > 0 ? Math.round((mtd.total.amount / ytdAmount) * 100) : 0;

    return [
      {
        key: "new_orders",
        ...ordersState,
        labelKey: "sales_rep.hub.dashboard.widgets.new_orders",
        icon: "exclamation-circle",
        accent: "warning",
        value: formatStatCount(orders?.newOrders?.count),
        sub: t("sales_rep.hub.dashboard.stats.value_total", {
          amount: formatStatMoney(orders?.newOrders?.total),
        }),
        delta: t("sales_rep.hub.dashboard.stats.placed_today", { count: formatStatCount(placedToday) }, placedToday),
        deltaTone: "positive",
      },
      {
        key: "active_cart",
        ...cartsState,
        // Profile shows the single cart's value (money), not a count — its own label vs the dashboard's "Active carts".
        labelKey: "sales_rep.hub.dashboard.widgets.active_cart",
        icon: "cart",
        accent: "success",
        // One bold number — the active cart's total. No sub, no badge; no cart means a zero total.
        value: formatStatMoney(activeCarts?.total),
      },
      {
        key: "mtd",
        ...ordersState,
        // Profile shows this month's order value (money), not the order count — hence "Purchased · MTD".
        labelKey: "sales_rep.hub.dashboard.widgets.purchased_mtd",
        icon: "cash",
        accent: "info",
        value: formatStatMoney(mtd?.total),
        // Informational ratio (gray, no chevron): how much of the year's revenue landed this month.
        delta: t("sales_rep.hub.dashboard.stats.mtd_of_ytd", { percent: mtdShare }),
        deltaTone: "neutral",
      },
      {
        // Same metric as the dashboard "Orders placed · YTD" — reuse its label, icon and accent so the two match.
        key: "orders_ytd",
        ...ordersState,
        labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
        icon: "cash",
        accent: "info",
        value: formatStatCount(ytd?.count),
        sub: formatStatMoney(ytd?.total),
        delta: ytdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_year", { delta: ytdDelta.text }) : "",
        deltaTone: ytdDelta?.tone,
        deltaIcon: ytdDelta?.icon,
      },
      {
        key: "aov",
        ...ordersState,
        labelKey: "sales_rep.customer_profile.widgets.avg_order_value",
        icon: "presentation-chart-bar",
        accent: "secondary",
        value: formatStatMoney(ytd?.average),
        sub: t("sales_rep.customer_profile.stats.per_order"),
      },
    ];
  });

  return { cards };
}
