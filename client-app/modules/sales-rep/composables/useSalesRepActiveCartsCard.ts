import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { formatStatCount } from "../utils";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import type { StatWidgetCardType } from "../types/widgets";
import type { MaybeRefOrGetter } from "vue";

// The "Active carts" KPI card — quantities of the cart lines picked for checkout, the parked remainder as the
// sub-figure, and the lines touched this week as the delta. Card and data source live together so the hub dashboard
// (all served organizations) and the customer profile (one organization) cannot drift; pass an organization to scope it.
export function useSalesRepActiveCartsCard(organizationId?: MaybeRefOrGetter<string | undefined>) {
  const { t } = useI18n();

  const { statistics, loading } = useSalesRepCartStatistics({ organizationId: () => toValue(organizationId) });

  const card = computed<StatWidgetCardType>(() => {
    const activeCarts = statistics.value?.activeCarts;
    const weekItems = statistics.value?.itemsThisWeek;

    return {
      key: "active_carts",
      labelKey: "sales_rep.hub.dashboard.widgets.active_carts",
      icon: "cart",
      accent: "success",
      value: formatStatCount(activeCarts?.selectedItemQuantity),
      // Plural forms ("item | items"): vue-i18n's count overload binds {count} and picks the form.
      valueSuffix: activeCarts ? t("sales_rep.hub.dashboard.stats.items_unit", activeCarts.selectedItemQuantity) : "",
      sub: activeCarts
        ? t("sales_rep.hub.dashboard.stats.not_for_checkout", { count: activeCarts.unselectedItemQuantity })
        : "",
      delta: weekItems ? t("sales_rep.hub.dashboard.stats.items_this_week", weekItems.selectedItemQuantity) : "",
      deltaTone: "positive",
    };
  });

  return { card, loading };
}
