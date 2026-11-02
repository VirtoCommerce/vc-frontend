import { computed, shallowRef, watch } from "vue";
import { useGetMonthlyOrderStatisticsQuery } from "@/core/api/graphql/orders";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { REPORTING_MONTH_SLOTS, useReportingPlan } from "@/shared/reporting";
import type { GetMonthlyOrderStatisticsQuery, GetMonthlyOrderStatisticsQueryVariables } from "@/core/api/graphql/types";
import type {
  ReportingDataType,
  ReportingPeriodTotalsType,
  ReportingPeriodType,
  ReportingPlanType,
} from "@/shared/reporting";
import type { MaybeRefOrGetter } from "vue";

type MonthlyStatisticsType = NonNullable<GetMonthlyOrderStatisticsQuery["orderStatistics"]>;
type SlotKeyType = Exclude<keyof MonthlyStatisticsType, "currencyCode" | "all">;

/** The query's month windows for one plan: a slot a shorter period leaves empty, or a month to come, is not asked for. */
export function monthlyOrderStatisticsVariables(plan: ReportingPlanType): GetMonthlyOrderStatisticsQueryVariables {
  const slots: Record<string, string | boolean | undefined> = {};
  for (let i = 0; i < REPORTING_MONTH_SLOTS; i++) {
    const month = plan.months.at(i);
    slots[`use${i}`] = month !== undefined && month.state !== "upcoming";
    slots[`from${i}`] = month?.from;
    slots[`to${i}`] = month?.to;
    slots[`lyFrom${i}`] = month?.lyFrom;
    slots[`lyTo${i}`] = month?.lyTo;
  }
  return {
    storeId: globals.storeId,
    // The stat cards' currency and culture, so the report's figures agree with theirs.
    currencyCode: globals.currencyCode,
    cultureName: globals.cultureName,
    prevFrom: plan.previous.from,
    prevTo: plan.previous.to,
    ...slots,
  } as GetMonthlyOrderStatisticsQueryVariables;
}

function totals(statistics: MonthlyStatisticsType, key: string): ReportingPeriodTotalsType | undefined {
  const value = statistics[key as SlotKeyType];
  return value ? { amount: value.total.amount, count: value.count } : undefined;
}

/** One response as the report reads it, paired with the plan it was fetched for. */
export function toSalesReportData(plan: ReportingPlanType, statistics: MonthlyStatisticsType): ReportingDataType {
  return {
    plan,
    months: plan.months.map((_month, i) => ({
      totals: totals(statistics, `m${i}`),
      lastYear: totals(statistics, `ly${i}`),
    })),
    previous: totals(statistics, "prev"),
    currencyCode: statistics.currencyCode,
  };
}

/** Orders of the period's months left out because their currency cannot be converted. */
export function excludedOrdersCount(plan: ReportingPlanType, statistics: MonthlyStatisticsType): number {
  // Every `m<N>` slot has the same selection; `m0` names its type.
  return plan.months.reduce((sum, _month, i) => sum + (statistics[`m${i}` as "m0"]?.excludedCount ?? 0), 0);
}

/**
 * The account dashboard's Sales report: the signed-in user's own orders month by month, with last year beside them,
 * from the same `orderStatistics` the stat cards read, so the two agree. Cancelled orders are already left out.
 */
export function useAccountSalesReport(period: MaybeRefOrGetter<ReportingPeriodType>) {
  const plan = useReportingPlan(period);
  const variables = computed(() => monthlyOrderStatisticsVariables(plan.value));

  const { result, loading, error, onError } = useGetMonthlyOrderStatisticsQuery(variables);

  onError((queryError) => {
    // No toast: the report names the failure itself.
    Logger.error("[account dashboard] monthly orderStatistics failed:", queryError);
  });

  // `result` keeps the previous response until the next one lands, and its month aliases are positional (m0…m11),
  // so each response is kept with the plan it was fetched for, never read against the one just picked.
  const settled = shallowRef<{ plan: ReportingPlanType; statistics: MonthlyStatisticsType } | undefined>();

  watch(
    result,
    (value) => {
      const statistics = value?.orderStatistics;
      settled.value = statistics ? { plan: plan.value, statistics } : undefined;
    },
    { immediate: true },
  );

  return {
    data: computed(() => settled.value && toSalesReportData(settled.value.plan, settled.value.statistics)),
    excludedCount: computed(() =>
      settled.value ? excludedOrdersCount(settled.value.plan, settled.value.statistics) : 0,
    ),
    /** False only once the user's whole history is known to hold no order at all; undefined until then. */
    hasOrders: computed(() => {
      const all = settled.value?.statistics.all;
      return all ? all.count + all.excludedCount > 0 : undefined;
    }),
    loading,
    failed: computed(() => Boolean(error.value)),
  };
}
