import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { buildStatisticsWindows } from "../utils";

export type SalesRepPeriodType = "lifetime" | "month" | "year";

// Shared period control for the orders + top-sellers widgets: Lifetime (no date bounds) / This month (MTD) /
// This year (YTD). Owns the localized option list and resolves the selection to the from/to bounds a query takes,
// so both widgets share one period model instead of each repeating it.
export function useSalesRepPeriodFilter(initial: SalesRepPeriodType = "lifetime") {
  const { t } = useI18n();
  const period = ref<SalesRepPeriodType>(initial);
  const windows = buildStatisticsWindows();

  const options = computed(() => [
    { value: "lifetime", label: t("sales_rep.period.lifetime") },
    { value: "month", label: t("sales_rep.period.month") },
    { value: "year", label: t("sales_rep.period.year") },
  ]);

  // "lifetime" = no bounds (all orders ever); the others are the current month / year to date.
  const bounds: Record<SalesRepPeriodType, { from?: string; to?: string }> = {
    lifetime: {},
    month: { from: windows.mtdFrom, to: windows.mtdTo },
    year: { from: windows.ytdFrom, to: windows.ytdTo },
  };

  const from = computed(() => bounds[period.value].from);
  const to = computed(() => bounds[period.value].to);

  return { period, options, from, to };
}
