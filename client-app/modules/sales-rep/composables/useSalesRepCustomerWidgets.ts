import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { buildStatCards, CUSTOMER_PROFILE_STAT_CARDS } from "../layout/stat-cards";
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
    // All-status volume over the same window as the New count beside it — context, not a delta.
    // Formatted string renders; the raw number is vue-i18n's plural selector (see the dashboard mapper).
    const recentOrders = orders?.recentOrders?.count ?? 0;
    // Active cart: the summed total of this customer's non-empty carts.
    const activeCarts = carts?.activeCarts;
    // This month's revenue as a share of the year's — a client-side ratio, not a backend field.
    // 0 with no YTD revenue to divide by, so the row reads like every other empty metric.
    const ytdAmount = ytd?.total.amount ?? 0;
    const mtdShare = mtd && ytdAmount > 0 ? Math.round((mtd.total.amount / ytdAmount) * 100) : 0;

    // Caption, icon and accent come from the shared table; only what the queries decide is here.
    return buildStatCards(CUSTOMER_PROFILE_STAT_CARDS, {
      new_orders: {
        ...ordersState,
        value: formatStatCount(orders?.newOrders?.count),
        sub: t("sales_rep.hub.dashboard.stats.value_total", {
          amount: formatStatMoney(orders?.newOrders?.total),
        }),
        delta: t(
          "sales_rep.hub.dashboard.stats.of_recent_orders",
          { count: formatStatCount(recentOrders) },
          recentOrders,
        ),
        deltaTone: "neutral",
      },
      // One bold number — the active cart's total. No sub, no badge; no cart means a zero total.
      active_cart: {
        ...cartsState,
        value: formatStatMoney(activeCarts?.total),
      },
      mtd: {
        ...ordersState,
        value: formatStatMoney(mtd?.total),
        // Informational ratio (gray, no chevron): how much of the year's revenue landed this month.
        delta: t("sales_rep.hub.dashboard.stats.mtd_of_ytd", { percent: mtdShare }),
        deltaTone: "neutral",
      },
      orders_ytd: {
        ...ordersState,
        value: formatStatCount(ytd?.count),
        sub: formatStatMoney(ytd?.total),
        delta: ytdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_year", { delta: ytdDelta.text }) : "",
        deltaTone: ytdDelta?.tone,
        deltaIcon: ytdDelta?.icon,
      },
      aov: {
        ...ordersState,
        value: formatStatMoney(ytd?.average),
        sub: t("sales_rep.customer_profile.stats.per_order"),
      },
    });
  });

  return { cards };
}
