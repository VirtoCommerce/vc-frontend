import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { toReportingMonth } from "../reporting";
import ReportingChart from "./reporting-chart.vue";
import type { ReportingMonthSlotType } from "../reporting";

const PLOT_WIDTH = 900;

// jsdom has no layout: report a real width so the chart and its overlay render.
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useResizeObserver: (_target: unknown, callback: (entries: Array<{ contentRect: { width: number } }>) => void) =>
    callback([{ contentRect: { width: PLOT_WIDTH } }]),
}));

// `t` prints its params after the key, so a spec sees what a message was given.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
    n: (value: number) => String(value),
    d: () => "Jan",
  }),
}));

function slot(month: number, state: ReportingMonthSlotType["state"] = "closed"): ReportingMonthSlotType {
  return { year: 2026, month, state, from: "", to: "", lyFrom: "", lyTo: "", daysPassed: 15, daysInMonth: 30 };
}

const MONTHS = [
  toReportingMonth(slot(0), { totals: { amount: 1200, count: 3 }, lastYear: { amount: 1000, count: 2 } }),
  toReportingMonth(slot(1), { totals: { amount: 800, count: 2 }, lastYear: { amount: 1000, count: 2 } }),
  // Last year had no sales this month.
  toReportingMonth(slot(2, "current"), { totals: { amount: 500, count: 1 }, lastYear: { amount: 0, count: 0 } }),
  toReportingMonth(slot(3, "upcoming"), {}),
];

function mountChart(props: { kind?: "sales" | "aov"; withLastYear?: boolean } = {}) {
  return mount(ReportingChart, {
    props: { kind: "sales", title: "Sales", months: MONTHS, currencyCode: "USD", testId: "chart", ...props },
    global: {
      stubs: {
        VcBadge: { props: ["color"], template: "<span class='badge-stub' :data-color='color'><slot /></span>" },
        VcTooltip: { template: "<div class='tooltip-stub'><slot :trigger-props='{}' /><slot name='content' /></div>" },
        VcSwitch: { props: ["ariaLabel"], template: "<button class='switch-stub' :aria-label='ariaLabel' />" },
        VcPriceDisplay: { props: ["value"], template: "<span>{{ value.formattedAmount }}</span>" },
        VcTypography: true,
        VcLoaderOverlay: true,
        VcIcon: true,
      },
    },
  });
}

describe("ReportingChart", () => {
  it("shows the YoY change as badges, green up and red down, only where last year has a baseline", () => {
    const badges = mountChart().findAll(".reporting-svg-chart__annotation .badge-stub");

    expect(badges.map((badge) => badge.attributes("data-color"))).toEqual(["success", "danger"]);
  });

  it("draws the current month inside its projected month-end outline, and upcoming months as placeholders", () => {
    const chart = mountChart();

    const outline = chart.get(".reporting-svg-chart__bar--dashed");
    const bars = chart.findAll(".reporting-svg-chart__bar:not(.reporting-svg-chart__bar--dashed)");
    const currentBar = bars.find((bar) => bar.attributes("x") === outline.attributes("x"));

    expect(chart.findAll(".reporting-svg-chart__bar--dashed")).toHaveLength(1);
    expect(currentBar?.attributes("width")).toBe(outline.attributes("width"));
    expect(chart.findAll(".reporting-svg-chart__placeholder")).toHaveLength(1);
    expect(chart.find(".reporting-svg-chart__placeholder-caption").text()).toBe("shared.reporting.upcoming");
  });

  it("puts a tooltip on every month with data and none on upcoming months", () => {
    expect(mountChart().findAll(".reporting-svg-chart__hit-area")).toHaveLength(3);
  });

  it("draws last year as a line only while the switch is on", () => {
    expect(mountChart().find(".reporting-svg-chart__line").exists()).toBe(false);
    expect(mountChart({ withLastYear: true }).find(".reporting-svg-chart__line").exists()).toBe(true);
  });

  it("leaves a month with no sales last year off the Last year line", () => {
    expect(mountChart({ withLastYear: true }).findAll(".reporting-svg-chart__dot")).toHaveLength(2);
  });

  it("has no projection on the AOV chart", () => {
    expect(mountChart({ kind: "aov" }).findAll(".reporting-svg-chart__bar--dashed")).toHaveLength(0);
  });

  it("shows last year's figure as a dash when last year had no sales that month", () => {
    const rows = mountChart().findAll(".reporting-chart__tooltip-rows").at(2);

    expect(rows?.findAll("dd").at(-1)?.text()).toBe("—");
  });

  it("names each Last year switch after its chart", () => {
    expect(mountChart().find(".switch-stub").attributes("aria-label")).toBe(
      'shared.reporting.last_year_toggle {"chart":"Sales"}',
    );
  });
});
