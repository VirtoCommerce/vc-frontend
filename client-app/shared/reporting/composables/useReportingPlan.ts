import { computed, toValue } from "vue";
import { buildReportingPlan } from "../reporting";
import { useToday } from "./useToday";
import type { ReportingPeriodType } from "../reporting";
import type { MaybeRefOrGetter } from "vue";

/**
 * The months a period covers today, with last year's and the previous month's windows: what a caller's statistics
 * query asks for. It moves on at midnight, so a page left open overnight asks for the new day.
 */
export function useReportingPlan(period: MaybeRefOrGetter<ReportingPeriodType>) {
  const today = useToday();
  return computed(() => buildReportingPlan(toValue(period), new Date(today.value)));
}
