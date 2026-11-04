import { computed, shallowRef, toValue, watch } from "vue";
import { toReportingData } from "../reporting";
import type { ReportingPlanType, ReportingStatisticsType } from "../reporting";
import type { MaybeRefOrGetter, Ref } from "vue";

export type ReportingSettledType<TStatistics> = { plan: ReportingPlanType; statistics: TStatistics };

/**
 * The report's figures, each response kept with the plan it was fetched for. A query result keeps the previous
 * response until the next one lands, and its month slots are positional, so it is never read against a plan picked
 * after it. Pass the plan the query variables were built from (`useReportingPlan`).
 *
 * Built for Apollo `useQuery` with `keepPreviousResult: true`; without it the report empties while a new period loads.
 * Leave out `debounce` and `throttle`: they keep the previous query running after the plan changes, and its late
 * response would be read against the new plan.
 */
export function useReportingData<TStatistics extends ReportingStatisticsType>(
  plan: Readonly<Ref<ReportingPlanType>>,
  statistics: MaybeRefOrGetter<TStatistics | null | undefined>,
) {
  const settled = shallowRef<ReportingSettledType<TStatistics>>();

  watch(
    () => toValue(statistics),
    (value) => {
      settled.value = value ? { plan: plan.value, statistics: value } : undefined;
    },
    { immediate: true },
  );

  return {
    data: computed(() => settled.value && toReportingData(settled.value.plan, settled.value.statistics)),
    /** The response with its plan, for figures of the caller's own that the report does not show. */
    settled: computed(() => settled.value),
  };
}
