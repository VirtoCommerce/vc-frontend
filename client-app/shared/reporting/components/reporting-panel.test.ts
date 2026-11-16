import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildReportingPlan } from "../reporting";
import ReportingPanel from "./reporting-panel.vue";
import type { ReportingDataType, ReportingPeriodType } from "../reporting";

const state = vi.hoisted(() => ({ today: new Date(2026, 9, 21).getTime() }));

// `t` prints its params after the key, so a spec sees which message was picked and what it was given.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
    n: (value: number) => String(value),
    d: () => "Oct 21",
    locale: { value: "en-US" },
  }),
}));

vi.mock("../composables/useToday", async () => {
  const { computed } = await import("vue");
  return { useToday: () => computed(() => state.today) };
});

vi.mock("@/core/globals", () => ({ globals: { currencyCode: "USD" } }));

/** Figures for every month of a period on `state.today`: 100 USD over one order each. */
function dataFor(period: ReportingPeriodType): ReportingDataType {
  const plan = buildReportingPlan(period, new Date(state.today));
  return { plan, months: plan.months.map(() => ({ totals: { amount: 100, count: 1 } })), currencyCode: "EUR" };
}

type PanelPropsType = {
  period?: ReportingPeriodType;
  data?: ReportingDataType;
  loading?: boolean;
  error?: boolean;
  compact?: boolean;
  withTable?: boolean;
  withTiles?: boolean;
  testId?: string;
};

function mountPanel(props: PanelPropsType = {}, slots = {}) {
  return mount(ReportingPanel, {
    props: { period: "q1", ...props },
    slots,
    global: {
      stubs: {
        ReportingChart: {
          name: "ReportingChart",
          props: ["loading", "kind", "title", "months", "currencyCode"],
          template: "<div />",
        },
        ReportingKpiTile: { name: "ReportingKpiTile", props: ["label", "value", "testId"], template: "<div />" },
        ReportingTable: { name: "ReportingTable", template: "<div />" },
        VcTabSwitch: {
          props: ["value"],
          emits: ["change"],
          template: "<button data-test-id='period-tab-button' @click=\"$emit('change', value)\">{{ value }}</button>",
        },
        VcIcon: true,
        VcLoaderOverlay: true,
        VcEmptyView: { name: "VcEmptyView", props: ["text"], template: "<div />" },
      },
    },
  });
}

const footnoteOf = (wrapper: ReturnType<typeof mountPanel>) =>
  wrapper.find("[data-test-id='reporting-footnote-label']");

beforeEach(() => {
  state.today = new Date(2026, 9, 21).getTime();
});

describe("ReportingPanel", () => {
  describe("the footnote", () => {
    it("names today when the period runs into the current month", () => {
      expect(footnoteOf(mountPanel({ period: "year", data: dataFor("year") })).text()).toMatch(
        /^shared\.reporting\.footnote \{/,
      );
    });

    it("leaves today out when every month of the period has closed", () => {
      expect(footnoteOf(mountPanel({ period: "q1", data: dataFor("q1") })).text()).toMatch(
        /^shared\.reporting\.footnote_closed/,
      );
    });

    it("says the period has not started when no month has", () => {
      state.today = new Date(2026, 0, 15).getTime();

      expect(footnoteOf(mountPanel({ period: "q4", data: dataFor("q4") })).text()).toBe(
        "shared.reporting.footnote_upcoming",
      );
    });
  });

  it("renders the figures it is given, in their currency", () => {
    const wrapper = mountPanel({ period: "q1", data: dataFor("q1") });
    const sales = wrapper.findAllComponents({ name: "ReportingKpiTile" })[0];

    // Three closed months of 100 each.
    expect(sales.props("testId")).toBe("reporting-sales-tile");
    expect(sales.props("value")).toBe("300");
    expect(wrapper.findComponent({ name: "ReportingChart" }).props("currencyCode")).toBe("EUR");
  });

  it("shows the current period with no orders until figures arrive", () => {
    const chart = mountPanel({ period: "q1" }).findComponent({ name: "ReportingChart" });

    expect(chart.props("months")).toHaveLength(3);
    expect(chart.props("months").every((month: { revenue: number | null }) => month.revenue === null)).toBe(true);
    expect(chart.props("currencyCode")).toBe("USD");
  });

  it("labels the figures with the period they were fetched for while a new one loads", () => {
    const chart = mountPanel({ period: "year", data: dataFor("q1"), loading: true }).findComponent({
      name: "ReportingChart",
    });

    expect(chart.props("title")).toContain("shared.reporting.periods.q1");
    expect(chart.props("months")).toHaveLength(3);
  });

  it("reads figures fetched before midnight with today's month states when the windows stay the same", () => {
    state.today = new Date(2026, 2, 31).getTime();
    const data = dataFor("q1");
    state.today = new Date(2026, 3, 1).getTime();

    const wrapper = mountPanel({ period: "q1", data });
    const months = wrapper.findComponent({ name: "ReportingChart" }).props("months");
    const tiles = wrapper.findAllComponents({ name: "ReportingKpiTile" }).map((tile) => tile.props("testId"));

    expect(months.map((month: { state: string }) => month.state)).toEqual(["closed", "closed", "closed"]);
    expect(tiles).not.toContain("reporting-month-tile");
  });

  it("treats a loading left undefined as not loading", () => {
    const charts = mountPanel({ loading: undefined }).findAllComponents({ name: "ReportingChart" });

    expect(charts.map((chart) => chart.props("loading"))).toEqual([false, false]);
  });

  it("shows both charts loading while a new period loads", () => {
    const charts = mountPanel({ loading: true }).findAllComponents({ name: "ReportingChart" });

    expect(charts.map((chart) => chart.props("loading"))).toEqual([true, true]);
  });

  it("replaces the report with an error once a failed request settles", () => {
    const wrapper = mountPanel({ error: true });

    expect(wrapper.findComponent({ name: "VcEmptyView" }).props("text")).toBe("shared.reporting.load_failed");
    expect(wrapper.findComponent({ name: "ReportingChart" }).exists()).toBe(false);
  });

  it("keeps the report while a failed period reloads", () => {
    expect(mountPanel({ error: true, loading: true }).findComponent({ name: "ReportingChart" }).exists()).toBe(true);
  });

  it("hands a picked period back to its owner", async () => {
    const wrapper = mountPanel();

    await wrapper.findAll("[data-test-id='period-tab-button']")[0].trigger("click");

    expect(wrapper.emitted("update:period")).toEqual([["6m"]]);
  });

  it("renders the owner's controls beside the periods", () => {
    const wrapper = mountPanel({}, { actions: "<select data-test-id='owner-control' />" });

    expect(wrapper.find("[data-test-id='reporting-actions-section'] [data-test-id='owner-control']").exists()).toBe(
      true,
    );
  });

  it("leaves no empty actions box without them", () => {
    expect(mountPanel().find("[data-test-id='reporting-actions-section']").exists()).toBe(false);
  });

  it("offers the tiles and the table by default", () => {
    const wrapper = mountPanel();

    expect(wrapper.find("[data-test-id='reporting-tiles-section']").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "ReportingTable" }).exists()).toBe(true);
  });

  it("leaves the tiles out on request", () => {
    const wrapper = mountPanel({ withTiles: false });

    expect(wrapper.find("[data-test-id='reporting-tiles-section']").exists()).toBe(false);
    expect(wrapper.findComponent({ name: "ReportingChart" }).exists()).toBe(true);
  });

  it("leaves the table out on request", () => {
    expect(mountPanel({ withTable: false }).findComponent({ name: "ReportingTable" }).exists()).toBe(false);
  });

  it("gives each panel its own period radio group", () => {
    const first = mountPanel().find("[data-test-id='period-tab-button']").attributes("name");
    const second = mountPanel().find("[data-test-id='period-tab-button']").attributes("name");

    expect(first).toMatch(/^reporting-period-/);
    expect(first).not.toBe(second);
  });

  it("prefixes its test ids with the given one", () => {
    const wrapper = mountPanel({ testId: "dashboard-report" });
    const [sales] = wrapper.findAllComponents({ name: "ReportingKpiTile" });

    expect(wrapper.find("[data-test-id='dashboard-report-tiles-section']").exists()).toBe(true);
    expect(sales.props("testId")).toBe("dashboard-report-sales-tile");
  });

  it("marks itself compact for a narrow column", () => {
    expect(mountPanel({ compact: true }).classes()).toContain("reporting-panel--compact");
    expect(mountPanel().classes()).not.toContain("reporting-panel--compact");
  });
});
