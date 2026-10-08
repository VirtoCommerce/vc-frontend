import { computed, ref } from "vue";
import { buildStatisticsWindows } from "@/shared/dashboard";

export type SalesRepPeriodType = "lifetime" | "month" | "year";

// The hub's period model (Lifetime/Month/Year), resolved to from/to bounds, for the order, top-seller and
// activity surfaces. Each call holds its own selection; none is shared between them.
export function useSalesRepPeriodFilter(initial: SalesRepPeriodType = "lifetime") {
  const period = ref<SalesRepPeriodType>(initial);
  const windows = buildStatisticsWindows();

  // "lifetime" = no bounds (everything on record); the others are the current month / year to date.
  const bounds: Record<SalesRepPeriodType, { from?: string; to?: string }> = {
    lifetime: {},
    month: { from: windows.mtdFrom, to: windows.mtdTo },
    year: { from: windows.ytdFrom, to: windows.ytdTo },
  };

  const from = computed(() => bounds[period.value].from);
  const to = computed(() => bounds[period.value].to);

  return { period, from, to };
}
