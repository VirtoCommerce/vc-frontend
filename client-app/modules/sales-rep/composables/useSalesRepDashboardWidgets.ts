import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { DASHBOARD_LAYOUT_SCOPE } from "../constants";
import { buildActiveCartsCardData } from "../layout/active-carts-card";
import { newOrdersCardData } from "../layout/stat-card-data";
import { buildStatCards, DASHBOARD_STAT_CARDS } from "../layout/stat-cards";
import { formatSignedPercent, formatStatCount, formatStatMoney } from "../utils";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepCustomerCounts } from "./useSalesRepCustomerCounts";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import type { StatWidgetCardType } from "../types/widgets";

// Shapes three statistics sources into the six dashboard KPI cards.
// Deltas are either period-over-period % (chevron) or plain "new activity" counts (no chevron).
//
// The card set never shrinks — the layout decides what renders, and a card missing while loading would
// blank its column. What the scope narrows is the fetching: each query asks only for the visible cards'
// slices, and one whose cards are all hidden does not run.
export function useSalesRepDashboardWidgets() {
  const { t } = useI18n();
  const scope = DASHBOARD_LAYOUT_SCOPE;
  const {
    statistics: orderStatistics,
    loading: ordersLoading,
    error: ordersError,
  } = useSalesRepOrderStatistics({ scope });
  const { statistics: cartStatistics, loading: cartsLoading, error: cartsError } = useSalesRepCartStatistics({ scope });
  const { counts, loading: countsLoading, error: countsError } = useSalesRepCustomerCounts({ scope });

  const cards = computed<StatWidgetCardType[]>(() => {
    const orders = orderStatistics.value;
    const carts = cartStatistics.value;
    const customerCounts = counts.value;

    // Each card reads exactly one query, so it carries that query's state and no other's.
    const ordersState = { loading: ordersLoading.value, failed: Boolean(ordersError.value) };
    const cartsState = { loading: cartsLoading.value, failed: Boolean(cartsError.value) };
    const countsState = { loading: countsLoading.value, failed: Boolean(countsError.value) };

    // Plain counts (no icon) — a count, not a comparison. Always rendered, so an empty period reads
    // as "0 new this week" rather than dropping the row (VCST-5586).
    // Each is passed to t() as the formatted string plus the raw number: the string is what renders,
    // the number is vue-i18n's plural selector, so locales that need plural forms (ru, pl) can add
    // them without the grouped string breaking the choice.
    const thisMonth = customerCounts?.thisMonth;
    const orderingCustomers = thisMonth?.orderingCustomers ?? 0;
    const newCustomers = thisMonth?.newCustomers ?? 0;

    // Period-over-period comparisons on order count (tri-state; undefined when the previous period is zero).
    const weekDelta = formatSignedPercent(orders?.weekVsPrevWeek?.countChangePercent);
    const mtdDelta = formatSignedPercent(orders?.mtdVsPrevMonth?.countChangePercent);
    const ytdDelta = formatSignedPercent(orders?.ytdVsLastYear?.countChangePercent);

    // Caption, icon and accent come from the shared table; only what the queries decide is here.
    return buildStatCards(DASHBOARD_STAT_CARDS, {
      // Identical on both surfaces, so it comes from the one shared builder.
      new_orders: newOrdersCardData(orders, ordersState, t),
      active_carts: buildActiveCartsCardData(carts, cartsState, t),
      orders_placed_week: {
        ...ordersState,
        value: formatStatCount(orders?.week?.count),
        sub: formatStatMoney(orders?.week?.total),
        delta: weekDelta ? t("sales_rep.hub.dashboard.stats.vs_last_week", { delta: weekDelta.text }) : "",
        deltaTone: weekDelta?.tone,
        deltaIcon: weekDelta?.icon,
      },
      orders_placed_mtd: {
        ...ordersState,
        value: formatStatCount(orders?.mtd?.count),
        sub: formatStatMoney(orders?.mtd?.total),
        delta: mtdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_month", { delta: mtdDelta.text }) : "",
        deltaTone: mtdDelta?.tone,
        deltaIcon: mtdDelta?.icon,
      },
      orders_placed_ytd: {
        ...ordersState,
        value: formatStatCount(orders?.ytd?.count),
        sub: formatStatMoney(orders?.ytd?.total),
        delta: ytdDelta ? t("sales_rep.hub.dashboard.stats.vs_last_year", { delta: ytdDelta.text }) : "",
        deltaTone: ytdDelta?.tone,
        deltaIcon: ytdDelta?.icon,
      },
      my_customers: {
        ...countsState,
        value: formatStatCount(customerCounts?.assignedCustomers),
        sub: t(
          "sales_rep.hub.dashboard.stats.ordered_this_month",
          { count: formatStatCount(orderingCustomers) },
          orderingCustomers,
        ),
        // "{n} new customers" — customers newly assigned to the rep this month (backend assignment date).
        delta: t("sales_rep.hub.dashboard.stats.new_customers", { count: formatStatCount(newCustomers) }, newCustomers),
        deltaTone: "positive",
      },
    });
  });

  return { cards };
}
