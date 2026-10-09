import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { CUSTOMER_PROFILE_LAYOUT_SCOPE } from "../constants";
import { buildActiveCartsCardData } from "../layout/active-carts-card";
import { newOrdersCardData } from "../layout/stat-card-data";
import { buildStatCards, CUSTOMER_PROFILE_STAT_CARDS } from "../layout/stat-cards";
import { formatSignedPercent, formatStatCount, formatStatMoney } from "../utils";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import type { StatWidgetCardType } from "../types/widgets";
import type { MaybeRefOrGetter } from "vue";

// Per-customer KPI cards; shared cards reuse the dashboard's i18n keys (hub.dashboard.*) so both
// surfaces stay in sync across locales.
//
// This surface has no week card and no month-over-month delta, so the scope keeps it from fetching the
// three buckets behind them — what VCST-5647 found it discarding.
export function useSalesRepCustomerWidgets(organizationId: MaybeRefOrGetter<string>) {
  const { t } = useI18n();
  const scope = CUSTOMER_PROFILE_LAYOUT_SCOPE;
  const orgId = (): string => toValue(organizationId);

  const {
    statistics: orderStatistics,
    loading: ordersLoading,
    error: ordersError,
  } = useSalesRepOrderStatistics({ scope, organizationId: orgId });
  const {
    statistics: cartStatistics,
    loading: cartsLoading,
    error: cartsError,
  } = useSalesRepCartStatistics({ scope, organizationId: orgId });

  const cards = computed<StatWidgetCardType[]>(() => {
    const orders = orderStatistics.value;
    const carts = cartStatistics.value;

    // buildStatCards derives each card's pending/failed state from the card's own `needs`, so a card
    // whose slice already arrived keeps rendering while a sibling's query is still in flight.
    const queries = {
      sources: { orders, carts },
      states: {
        orders: { loading: ordersLoading.value, failed: Boolean(ordersError.value) },
        carts: { loading: cartsLoading.value, failed: Boolean(cartsError.value) },
        counts: { loading: false, failed: false },
      },
    };
    const ytd = orders?.ytd;
    const mtd = orders?.mtd;

    // Orders YTD compares vs last year on order COUNT (same metric as the dashboard "Orders placed · YTD").
    const ytdDelta = formatSignedPercent(orders?.ytdVsLastYear?.countChangePercent);
    // This month's revenue as a share of the year's — a client-side ratio, not a backend field.
    // 0 with no YTD revenue to divide by, so the row reads like every other empty metric.
    const ytdAmount = ytd?.total.amount ?? 0;
    const mtdShare = mtd && ytdAmount > 0 ? Math.round((mtd.total.amount / ytdAmount) * 100) : 0;

    // Caption, icon and accent come from the shared table; only what the queries decide is here.
    return buildStatCards(
      CUSTOMER_PROFILE_STAT_CARDS,
      {
        // Identical on both surfaces, so it comes from the one shared builder.
        new_orders: newOrdersCardData(orders, t),
        // The dashboard's card, one organization: same builder, so the two surfaces cannot drift.
        active_cart: buildActiveCartsCardData(carts, t),
        mtd: {
          value: formatStatMoney(mtd?.total),
          // Informational ratio (gray, no chevron): how much of the year's revenue landed this month.
          delta: t("sales_rep.hub.dashboard.stats.mtd_of_ytd", { percent: mtdShare }),
          deltaTone: "neutral",
        },
        orders_ytd: {
          value: formatStatCount(ytd?.count),
          sub: formatStatMoney(ytd?.total),
          delta: ytdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_year", { delta: ytdDelta.text }) : "",
          deltaTone: ytdDelta?.tone,
          deltaIcon: ytdDelta?.icon,
        },
        aov: {
          value: formatStatMoney(ytd?.average),
          sub: t("sales_rep.customer_profile.stats.per_order"),
        },
      },
      queries,
    );
  });

  return { cards };
}
