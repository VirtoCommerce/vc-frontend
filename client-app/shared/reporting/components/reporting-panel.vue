<template>
  <div :class="['reporting-panel', { 'reporting-panel--compact': compact }]">
    <div class="reporting-panel__toolbar">
      <div class="reporting-panel__periods" role="group" :aria-label="t('shared.reporting.period_label')">
        <VcTabSwitch
          v-for="option in REPORTING_PERIODS"
          :key="option"
          :model-value="period"
          name="reporting-period"
          :value="option"
          :label="t(PERIOD_LABELS[option])"
          size="sm"
          @change="period = $event"
        />
      </div>

      <div v-if="$slots.actions" class="reporting-panel__actions" data-test-id="reporting-actions-section">
        <slot name="actions" />
      </div>
    </div>

    <VcEmptyView v-if="error && !loading" :text="t('shared.reporting.load_failed')" variant="error" />

    <template v-else>
      <div v-if="withTiles" class="reporting-panel__tiles" data-test-id="reporting-tiles-section">
        <VcLoaderOverlay :visible="loading" />

        <ReportingKpiTile
          :label="t('shared.reporting.kpi.sales', { period: periodLabel })"
          :value="formatters.compactMoney(summary.revenue, currencyCode)"
          :change="summary.revenueChange"
          test-id="reporting-sales-tile"
        />

        <ReportingKpiTile
          :label="t('shared.reporting.kpi.orders', { period: periodLabel })"
          :value="n(summary.orders)"
          :change="summary.ordersChange"
          test-id="reporting-orders-tile"
        />

        <ReportingKpiTile
          :label="t('shared.reporting.kpi.aov', { period: periodLabel })"
          :value="formatters.money(summary.periodAov, currencyCode)"
          :change="summary.aovChange"
          test-id="reporting-aov-tile"
        />

        <ReportingKpiTile
          v-if="currentMonthTile"
          :label="currentMonthTile.label"
          :value="currentMonthTile.value"
          :caption="currentMonthTile.caption"
          :progress="currentMonthTile.progress"
          test-id="reporting-month-tile"
        />
      </div>

      <ReportingChart
        v-model:with-last-year="salesWithLastYear"
        kind="sales"
        :title="t('shared.reporting.sales_chart.title', { period: chartPeriodTitle })"
        :subtitle="salesSubtitle"
        :months="months"
        :currency-code="currencyCode"
        :loading="loading"
        test-id="reporting-sales"
      />

      <ReportingChart
        v-model:with-last-year="aovWithLastYear"
        kind="aov"
        :title="t('shared.reporting.aov_chart.title')"
        :subtitle="aovSubtitle"
        :months="months"
        :currency-code="currencyCode"
        :loading="loading"
        test-id="reporting-aov"
      />

      <ReportingTable v-if="withTable" :months="months" :currency-code="currencyCode" :loading="loading" />

      <p class="reporting-panel__footnote" data-test-id="reporting-footnote-label">
        <VcIcon name="info" size="xs" />

        {{ footnote }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { useReportingFormatters } from "../composables/useReportingFormatters";
import { useReportingPlan } from "../composables/useReportingPlan";
import { useToday } from "../composables/useToday";
import { isSameWindows, REPORTING_PERIODS, summarizeReporting, toReportingMonths } from "../reporting";
import ReportingChart from "./reporting-chart.vue";
import ReportingKpiTile from "./reporting-kpi-tile.vue";
import ReportingTable from "./reporting-table.vue";
import type { ReportingDataType, ReportingPeriodType } from "../reporting";

interface IProps {
  /**
   * The figures to show, with the plan they were fetched for (build the query from `useReportingPlan`). Until the
   * first figures arrive the panel shows the current period's months with no orders.
   */
  data?: ReportingDataType;
  loading?: boolean;
  /** A failed read: the panel replaces the report with an error once loading has settled. */
  error?: boolean;
  /** For a narrow column: the tiles stay two by two at every width. */
  compact?: boolean;
  /** "Show as table"; off where a link to a full report carries it instead. */
  withTable?: boolean;
  /** The KPI tiles; off where the page already shows the same figures. */
  withTiles?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  data: undefined,
  withTable: true,
  withTiles: true,
});

// The owner decides where the period lives: a page can keep it in the URL, a widget in the browser.
const period = defineModel<ReportingPeriodType>("period", { required: true });

const PERIOD_LABELS: Record<ReportingPeriodType, string> = {
  "6m": "shared.reporting.periods.six_months",
  "12m": "shared.reporting.periods.twelve_months",
  year: "shared.reporting.periods.year",
  q1: "shared.reporting.periods.q1",
  q2: "shared.reporting.periods.q2",
  q3: "shared.reporting.periods.q3",
  q4: "shared.reporting.periods.q4",
};

// The chart heading reads "Monthly sales · last 12 months", so rolling periods get their own wording.
const CHART_PERIOD_TITLES: Record<ReportingPeriodType, string> = {
  "6m": "shared.reporting.chart_periods.six_months",
  "12m": "shared.reporting.chart_periods.twelve_months",
  year: "shared.reporting.chart_periods.year",
  q1: "shared.reporting.chart_periods.quarter",
  q2: "shared.reporting.chart_periods.quarter",
  q3: "shared.reporting.chart_periods.quarter",
  q4: "shared.reporting.chart_periods.quarter",
};

const { t, n, d } = useI18n();
const formatters = useReportingFormatters();
const today = useToday();

// Per browser, not per surface: every report the user opens follows the same choice.
const salesWithLastYear = useLocalStorage("vc-reporting-sales-last-year", false);
const aovWithLastYear = useLocalStorage("vc-reporting-aov-last-year", false);

const plan = useReportingPlan(period);

// The figures stay paired with the plan they were fetched for: their month slots are positional.
const fetchedPlan = computed(() => props.data?.plan ?? plan.value);
const months = computed(() => toReportingMonths(props.data ?? { plan: plan.value, months: [] }));
const summary = computed(() => summarizeReporting(months.value));
const currencyCode = computed(() => props.data?.currencyCode ?? globals.currencyCode);

/**
 * The period of the figures on screen: until a newly picked period loads, still the previous one. A period over the
 * same months (12 months and the current year in December) asks for the same windows, so no new figures come.
 */
const reportPeriod = computed(() =>
  isSameWindows(fetchedPlan.value, plan.value) ? period.value : fetchedPlan.value.period,
);

// The tiles and charts are labelled with the period of their figures, which trail the tabs while a new one loads.
const periodLabel = computed(() => t(PERIOD_LABELS[reportPeriod.value]));

const chartPeriodTitle = computed(() =>
  t(CHART_PERIOD_TITLES[reportPeriod.value], {
    period: periodLabel.value,
    year: months.value[0]?.year ?? new Date(today.value).getFullYear(),
  }),
);

const currentMonthTile = computed(() => {
  const current = summary.value.currentMonth;
  if (!current) {
    return undefined;
  }
  const share = current.daysPassed / current.daysInMonth;
  return {
    label: formatters.sentenceCase(
      t("shared.reporting.kpi.month_to_date", {
        month: formatters.month(current.year, current.month, "long"),
        day: current.daysPassed,
        days: current.daysInMonth,
      }),
    ),
    value: formatters.compactMoney(current.revenue, currencyCode.value),
    caption:
      current.projectedRevenue === null
        ? undefined
        : t("shared.reporting.kpi.projected", {
            share: formatters.share(share),
            value: formatters.compactMoney(current.projectedRevenue, currencyCode.value),
          }),
    progress: share,
  };
});

const salesSubtitle = computed(() =>
  summary.value.averageRevenuePerClosedMonth === null
    ? undefined
    : t("shared.reporting.sales_chart.subtitle", {
        value: formatters.money(summary.value.averageRevenuePerClosedMonth, currencyCode.value),
      }),
);

const aovSubtitle = computed(() =>
  t("shared.reporting.aov_chart.subtitle_period", {
    aov: formatters.money(summary.value.periodAov, currencyCode.value),
  }),
);

const footnote = computed(() => {
  const started = months.value.filter((month) => month.state !== "upcoming");
  const first = started.at(0);
  const last = started.at(-1);
  if (!first || !last) {
    return t("shared.reporting.footnote_upcoming");
  }
  const range = {
    from: formatters.monthYear(first.year, first.month),
    to: formatters.monthYear(last.year, last.month),
  };
  return last.state === "current"
    ? t("shared.reporting.footnote", { ...range, today: d(today.value, { month: "short", day: "numeric" }) })
    : t("shared.reporting.footnote_closed", range);
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.reporting-panel {
  @apply flex flex-col gap-4;

  &__toolbar {
    @apply flex flex-wrap items-center justify-between gap-3;
  }

  &__periods {
    // Hover contrast, as on the chips elsewhere in the account.
    --vc-tab-switch-hover-color: var(--color-neutral-900);

    // Wraps rather than scrolls: a scrolling row would clip the tabs' focus ring and the checked tab's shadow.
    @apply flex max-w-full flex-wrap gap-1;
  }

  &__actions {
    @apply flex w-full items-center gap-3;

    @media (width >= theme("screens.md")) {
      @apply w-auto;
    }
  }

  &__tiles {
    // Keeps the loader overlay's z-index inside the tiles, under the customer dropdown that opens over them.
    @apply relative isolate grid grid-cols-2 gap-3;

    @media (width >= theme("screens.lg")) {
      @apply grid-cols-4;
    }
  }

  &--compact &__tiles {
    @media (width >= theme("screens.lg")) {
      @apply grid-cols-2;
    }
  }

  &__footnote {
    @apply flex items-center gap-2 text-xs text-neutral-600;
  }
}
</style>
