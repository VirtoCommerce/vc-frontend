import { computed, shallowRef, toValue, watch } from "vue";
import { useGetMonthlyOrderStatisticsQuery, useGetOrderStatisticsHistoryQuery } from "@/core/api/graphql/orders";
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

/**
 * Whose orders the report counts instead of the signed-in user's own: the current organization's, or one of its
 * members' (a contact id). The backend refuses it without the organization order permission.
 */
export type SalesReportScopeType = { organization: true; memberId?: string };
type SlotKeyType = Exclude<keyof MonthlyStatisticsType, "currencyCode">;

// The stat cards' store, currency and culture, so the report's figures agree with theirs.
function storeContext() {
  return { storeId: globals.storeId, currencyCode: globals.currencyCode, cultureName: globals.cultureName };
}

// Nothing for the user's own orders, so the dashboard keeps sending exactly what it sent before.
function scopeVariables(
  scope: SalesReportScopeType | undefined,
  withMember: boolean,
): { organizationScope?: boolean; memberId?: string } {
  return {
    organizationScope: scope ? true : undefined,
    memberId: scope && withMember ? scope.memberId || undefined : undefined,
  };
}

/** The query's month windows for one plan: a slot a shorter period leaves empty, or a month to come, is not asked for. */
export function monthlyOrderStatisticsVariables(
  plan: ReportingPlanType,
  scope?: SalesReportScopeType,
): GetMonthlyOrderStatisticsQueryVariables {
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
    ...storeContext(),
    ...scopeVariables(scope, true),
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
 * Sales Statistics month by month, with last year beside them, from `orderStatistics`. Cancelled orders are already
 * left out.
 * - Without a scope (the account dashboard): the signed-in user's own orders, as the stat cards count them, so the two
 *   agree.
 * - With one (Company → Reporting): the current organization's orders, or one member's.
 */
export function useAccountSalesReport(
  period: MaybeRefOrGetter<ReportingPeriodType>,
  scope?: MaybeRefOrGetter<SalesReportScopeType | undefined>,
) {
  const plan = useReportingPlan(period);
  const variables = computed(() => monthlyOrderStatisticsVariables(plan.value, toValue(scope)));

  const { result, loading, error, onError } = useGetMonthlyOrderStatisticsQuery(variables);

  onError((queryError) => {
    // No toast: the report names the failure itself.
    Logger.error("[account dashboard] monthly orderStatistics failed:", queryError);
  });

  // Apart from the months, so a period switch does not count the whole history again. A failure is silent on purpose
  // (see the query): it only leaves "ever ordered" unknown, and the report shows as for a buyer with orders. For an
  // organization it is the organization's, never one member's: a member who never ordered gets zeros, and the empty
  // state, which takes the report's place, would also take away the member picker that leads back.
  const history = useGetOrderStatisticsHistoryQuery(
    computed(() => ({ ...storeContext(), ...scopeVariables(toValue(scope), false) })),
  );

  history.onError((queryError) => {
    Logger.error("[account dashboard] orderStatistics history failed:", queryError);
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

  /** False only once the user's (or organization's) whole history is known to hold no order; undefined until then. */
  const hasOrders = computed(() => {
    const all = history.result.value?.orderStatistics?.all;
    return all ? all.count + all.excludedCount > 0 : undefined;
  });

  return {
    data: computed(() => settled.value && toSalesReportData(settled.value.plan, settled.value.statistics)),
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
