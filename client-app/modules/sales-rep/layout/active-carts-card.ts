import { formatStatCount } from "../utils";
import type { StatCardDataType } from "./stat-cards";
import type { SalesRepCustomerCartStatisticsQuery } from "../api/graphql/types";
import type { StatWidgetCardType } from "../types/widgets";
import type { ComposerTranslation } from "vue-i18n";

type CartStatisticsType = SalesRepCustomerCartStatisticsQuery["salesRepCustomerCartStatistics"];

/**
 * The "Active carts" figures, shared by the hub dashboard (all served organizations) and the customer
 * profile (one organization) so the two surfaces cannot drift apart. The card counts ITEMS, not carts:
 * quantities of the cart lines picked for checkout, the parked remainder underneath, and the lines
 * touched this week as the delta (VCST-5588).
 */
export function buildActiveCartsCardData(
  carts: CartStatisticsType,
  state: Pick<StatWidgetCardType, "loading" | "failed">,
  t: ComposerTranslation,
): StatCardDataType {
  const selectedItems = carts?.activeCarts?.selectedItemQuantity ?? 0;
  const unselectedItems = carts?.activeCarts?.unselectedItemQuantity ?? 0;
  const weekItems = carts?.itemsThisWeek?.selectedItemQuantity ?? 0;

  return {
    ...state,
    value: formatStatCount(selectedItems),
    // The formatted string renders; the raw number is vue-i18n's plural selector (see the dashboard
    // mapper). `items_unit` has nothing to interpolate, so the count is only the selector.
    valueSuffix: t("sales_rep.hub.dashboard.stats.items_unit", selectedItems),
    sub: t(
      "sales_rep.hub.dashboard.stats.not_for_checkout",
      { count: formatStatCount(unselectedItems) },
      unselectedItems,
    ),
    delta: t("sales_rep.hub.dashboard.stats.items_this_week", { count: formatStatCount(weekItems) }, weekItems),
    deltaTone: "positive",
  };
}
