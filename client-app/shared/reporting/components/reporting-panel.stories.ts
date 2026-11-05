import { ref } from "vue";
import { useI18n } from "vue-i18n";
import messages from "../../../../locales/en.json";
import { buildReportingPlan, toReportingMonths } from "../reporting";
import ReportingChart from "./reporting-chart.vue";
import ReportingPanel from "./reporting-panel.vue";
import type { ReportingDataType, ReportingPeriodType } from "../reporting";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

// Deterministic sample figures: a seasonal curve, last year about 15% lower.
function sampleData(period: ReportingPeriodType): ReportingDataType {
  const plan = buildReportingPlan(period);
  return {
    plan,
    months: plan.months.map((month) => {
      const base = 40_000 + 12_000 * Math.sin((month.month / 12) * Math.PI * 2);
      const share = month.daysPassed / month.daysInMonth;
      return {
        totals: { amount: Math.round(base * share), count: Math.round(28 * share) },
        lastYear: { amount: Math.round(base * 0.85), count: 25 },
      };
    }),
    previous: { amount: 38_000, count: 26 },
    currencyCode: "USD",
  };
}

// Storybook loads only the UI-kit messages; the report's live in the global locales.
function useReportingMessages(): void {
  useI18n({ useScope: "global" }).mergeLocaleMessage("en", { shared: { reporting: messages.shared.reporting } });
}

type PanelArgsType = {
  period: ReportingPeriodType;
  loading?: boolean;
  error?: boolean;
  compact?: boolean;
  withTable?: boolean;
  withTiles?: boolean;
  withData?: boolean;
};

const meta: Meta<PanelArgsType> = {
  title: "Shared/Reporting/ReportingPanel",
  args: { period: "year", withData: true },
  argTypes: {
    period: { control: "select", options: ["6m", "12m", "year", "q1", "q2", "q3", "q4"] },
  },
  render: (args: PanelArgsType) => ({
    components: { ReportingPanel },
    setup() {
      useReportingMessages();
      const period = ref(args.period);
      return { args, period, sampleData };
    },
    template: `<ReportingPanel
      v-model:period="period"
      :data="args.withData ? sampleData(period) : undefined"
      :loading="args.loading"
      :error="args.error"
      :compact="args.compact"
      :with-table="args.withTable ?? true"
      :with-tiles="args.withTiles ?? true"
    />`,
  }),
};

export default meta;

type PanelStoryType = StoryObj<PanelArgsType>;

export const Basic: PanelStoryType = {};

export const Quarter: PanelStoryType = { args: { period: "q1" } };

export const Compact: PanelStoryType = { args: { compact: true, withTable: false } };

export const WithoutTilesAndTable: PanelStoryType = { args: { withTiles: false, withTable: false } };

export const NoData: PanelStoryType = { args: { withData: false } };

export const Loading: PanelStoryType = { args: { loading: true } };

export const LoadError: PanelStoryType = { args: { error: true, withData: false } };

type ChartArgsType = { kind: "sales" | "aov"; period: ReportingPeriodType; withLastYear: boolean; loading: boolean };

/** The monthly chart on its own: closed, current (with the projection) and upcoming months. */
export const Chart: StoryObj<ChartArgsType> = {
  args: { kind: "sales", period: "year", withLastYear: true, loading: false },
  argTypes: { kind: { control: "inline-radio", options: ["sales", "aov"] } },
  render: (args: ChartArgsType) => ({
    components: { ReportingChart },
    setup() {
      useReportingMessages();
      const withLastYear = ref(args.withLastYear);
      return { args, withLastYear, months: toReportingMonths(sampleData(args.period)) };
    },
    template: `<ReportingChart
      v-model:with-last-year="withLastYear"
      :kind="args.kind"
      title="Monthly sales"
      :months="months"
      currency-code="USD"
      :loading="args.loading"
      test-id="story-chart"
    />`,
  }),
};
