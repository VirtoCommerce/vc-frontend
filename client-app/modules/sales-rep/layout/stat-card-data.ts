// The query-driven half of the KPI cards that are identical on both surfaces — the counterpart to
// stat-cards.ts, which owns the half no query decides. A card belongs here only once the hub dashboard
// and the customer profile agree on it completely; the per-surface mappers keep the cards that diverge.
import { formatStatCount, formatStatMoney } from "../utils";
import type { StatCardDataType } from "./stat-cards";
import type { SalesRepCustomerOrderStatisticsQuery } from "../api/graphql/types";
import type { Composer } from "vue-i18n";

type OrderStatisticsType = SalesRepCustomerOrderStatisticsQuery["salesRepCustomerOrderStatistics"];

/** Every card carries its own query's state and no other's (VCST-5586). */
type QueryStateType = { loading: boolean; failed: boolean };

/**
 * "New orders" (VCST-5587): `New`-status orders created in the rolling window, over the all-status
 * volume of that same window. The secondary line is context, not a period-over-period comparison —
 * hence the neutral tone and no chevron.
 */
export function newOrdersCardData(
  orders: OrderStatisticsType,
  state: QueryStateType,
  t: Composer["t"],
): StatCardDataType {
  const recent = orders?.recentOrders?.count ?? 0;

  return {
    ...state,
    value: formatStatCount(orders?.newOrders?.count),
    sub: t("sales_rep.hub.dashboard.stats.value_total", { amount: formatStatMoney(orders?.newOrders?.total) }),
    // Formatted string renders; the raw number is vue-i18n's plural selector, so locales that need
    // plural forms (ru, pl) can add them without the grouped string breaking the choice.
    delta: t("sales_rep.hub.dashboard.stats.of_recent_orders", { count: formatStatCount(recent) }, recent),
    deltaTone: "neutral",
  };
}
