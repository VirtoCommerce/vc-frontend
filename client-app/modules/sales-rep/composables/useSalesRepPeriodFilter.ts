import { computed, ref } from "vue";
import { buildStatisticsWindows } from "../utils";

export type SalesRepPeriodType = "lifetime" | "month" | "year";

// Shared period model (Lifetime/Month/Year) for the orders + top-sellers widgets, resolved to from/to bounds.
export function useSalesRepPeriodFilter(initial: SalesRepPeriodType = "lifetime") {
  const period = ref<SalesRepPeriodType>(initial);
  const windows = buildStatisticsWindows();

  // "lifetime" = no bounds (all orders ever); the others are the current month / year to date.
  const bounds: Record<SalesRepPeriodType, { from?: string; to?: string }> = {
    lifetime: {},
    month: { from: windows.mtdFrom, to: windows.mtdTo },
    year: { from: windows.ytdFrom, to: windows.ytdTo },
  };

  const from = computed(() => bounds[period.value].from);
  const to = computed(() => bounds[period.value].to);

  return { period, from, to };
}
