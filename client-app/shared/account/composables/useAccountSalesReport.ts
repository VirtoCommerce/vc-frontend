import { computed } from "vue";
import { useGetMonthlyOrderStatisticsQuery, useGetOrderStatisticsHistoryQuery } from "@/core/api/graphql/orders";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { buildReportingVariables, useReportingData, useReportingPlan } from "@/shared/reporting";
import type { GetMonthlyOrderStatisticsQuery } from "@/core/api/graphql/types";
import type { ReportingPeriodType, ReportingPlanType } from "@/shared/reporting";
import type { MaybeRefOrGetter } from "vue";

type MonthlyStatisticsType = NonNullable<GetMonthlyOrderStatisticsQuery["orderStatistics"]>;

// The stat cards' store, currency and culture, so the report's figures agree with theirs.
function storeContext() {
  return { storeId: globals.storeId, currencyCode: globals.currencyCode, cultureName: globals.cultureName };
}

/** Orders of the period's months left out because their currency cannot be converted. */
export function excludedOrdersCount(plan: ReportingPlanType, statistics: MonthlyStatisticsType): number {
  // Every `m<N>` slot has the same selection; `m0` names its type.
  return plan.months.reduce((sum, _month, i) => sum + (statistics[`m${i}` as "m0"]?.excludedCount ?? 0), 0);
}

/**
 * The account dashboard's Sales Statistics: the signed-in user's own orders month by month, with last year beside them,
 * from the same `orderStatistics` the stat cards read, so the two agree. Cancelled orders are already left out.
 */
export function useAccountSalesReport(period: MaybeRefOrGetter<ReportingPeriodType>) {
  const plan = useReportingPlan(period);
  const variables = computed(() => ({ ...storeContext(), ...buildReportingVariables(plan.value) }));

  const { result, loading, error, onError } = useGetMonthlyOrderStatisticsQuery(variables);

  onError((queryError) => {
    // No toast: the report names the failure itself.
    Logger.error("[account dashboard] monthly orderStatistics failed:", queryError);
  });

  // Apart from the months, so a period switch does not count the whole history again. A failure is silent on purpose
  // (see the query): it only leaves "ever ordered" unknown, and the report shows as for a buyer with orders.
  const history = useGetOrderStatisticsHistoryQuery(computed(storeContext));

  history.onError((queryError) => {
    Logger.error("[account dashboard] orderStatistics history failed:", queryError);
  });

  const { data, settled } = useReportingData(plan, () => result.value?.orderStatistics);

  /** False only once the user's whole history is known to hold no order at all; undefined until then. */
  const hasOrders = computed(() => {
    const all = history.result.value?.orderStatistics?.all;
    return all ? all.count + all.excludedCount > 0 : undefined;
  });

  return {
    data,
    excludedCount: computed(() =>
      settled.value ? excludedOrdersCount(settled.value.plan, settled.value.statistics) : 0,
    ),
    hasOrders,
    /**
     * Also while the history is still on its way: the two are separate requests, and months that land first would
     * otherwise show a buyer who never ordered tiles and charts of zeros before the empty state takes their place.
     */
    loading: computed(() => loading.value || (hasOrders.value === undefined && history.loading.value)),
    failed: computed(() => Boolean(error.value)),
  };
}
