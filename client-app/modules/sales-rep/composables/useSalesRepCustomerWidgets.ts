import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { formatSignedPercent, formatStatCount } from "../utils";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import type { StatWidgetCardType } from "../types/widgets";
import type { MaybeRefOrGetter } from "vue";

// MAPPING: the per-customer profile KPI cards, scoped to one organization. Deliberately UNIFIED with the hub
// dashboard: the shared cards (New orders, Active cart, Orders YTD) reuse the dashboard's already-translated
// widget labels + stat phrasings (`hub.dashboard.*`) so both surfaces render identically in all locales, instead
// of duplicating half-translated keys under `customer_profile.*`. Order + Avg-order-value stay customer-specific.
//
// SHOWCASE — the "MTD" card's "% of YTD" badge is derived purely on the client from two slices we already fetch
// (mtd.total.amount / ytd.total.amount); no backend field is needed for a cross-slice ratio like this.
export function useSalesRepCustomerWidgets(organizationId: MaybeRefOrGetter<string>) {
  const { t } = useI18n();
  const orgId = (): string => toValue(organizationId);

  const { statistics: orderStatistics, loading: ordersLoading } = useSalesRepOrderStatistics({ organizationId: orgId });
  const { statistics: cartStatistics, loading: cartsLoading } = useSalesRepCartStatistics({ organizationId: orgId });

  const loading = computed(() => ordersLoading.value || cartsLoading.value);

  const cards = computed<StatWidgetCardType[]>(() => {
    const orders = orderStatistics.value;
    const carts = cartStatistics.value;
    const ytd = orders?.ytd;
    const mtd = orders?.mtd;

    // Orders YTD compares vs last year on order COUNT (same metric as the dashboard "Orders placed · YTD").
    const ytdDelta = formatSignedPercent(orders?.ytdVsLastYear?.countChangePercent);
    // Plain green count (no chevron) — New-status orders placed today, for this customer.
    const placedToday = orders?.newOrdersToday;
    // Active cart: the summed total of this customer's non-empty carts; "—" when there is none.
    const activeCarts = carts?.activeCarts;
    // SHOWCASE: this month's revenue as a share of the year's — a client-side ratio of two slices, not a backend field.
    const ytdAmount = ytd?.total.amount ?? 0;
    const mtdShare = mtd && ytdAmount > 0 ? Math.round((mtd.total.amount / ytdAmount) * 100) : undefined;

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
        delta: placedToday ? t("sales_rep.hub.dashboard.stats.placed_today", { count: placedToday.count }) : "",
        deltaTone: "positive",
      },
      {
        key: "active_cart",
        labelKey: "sales_rep.hub.dashboard.widgets.active_carts",
        icon: "shopping-cart",
        accent: "success",
        // One bold number — the active cart's total. No sub, no badge; "—" when the customer has no active cart.
        value: activeCarts?.count ? activeCarts.total.formattedAmount : "—",
      },
      {
        key: "mtd",
        labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
        icon: "cash",
        accent: "info",
        value: mtd?.total.formattedAmount ?? "—",
        // Informational ratio (gray, no chevron): how much of the year's revenue landed this month.
        delta: mtdShare != null ? t("sales_rep.hub.dashboard.stats.mtd_of_ytd", { percent: mtdShare }) : "",
        deltaTone: "neutral",
      },
      {
        // Same metric as the dashboard "Orders placed · YTD" — reuse its label, icon and accent so the two match.
        key: "orders_ytd",
        labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
        icon: "cash",
        accent: "info",
        value: formatStatCount(ytd?.count),
        sub: ytd?.total.formattedAmount ?? "",
        delta: ytdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_year", { delta: ytdDelta.text }) : "",
        deltaTone: ytdDelta?.tone,
        deltaIcon: ytdDelta?.icon,
      },
      {
        key: "aov",
        labelKey: "sales_rep.customer_profile.widgets.avg_order_value",
        icon: "presentation-chart-bar",
        accent: "secondary",
        value: ytd?.average.formattedAmount ?? "—",
        sub: t("sales_rep.customer_profile.stats.per_order"),
      },
    ];
  });

  return { cards, loading };
}
