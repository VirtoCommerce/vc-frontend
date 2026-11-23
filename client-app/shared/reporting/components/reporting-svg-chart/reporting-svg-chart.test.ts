import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import ReportingSvgChart from "./reporting-svg-chart.vue";
import type { ChartCategoryType, ChartSeriesType } from "./types";
import type { VueWrapper } from "@vue/test-utils";

type ResizeCallbackType = (entries: Array<{ contentRect: { width: number } }>) => void;

const plotWidth = vi.hoisted(() => ({ value: 900, resize: undefined as ResizeCallbackType | undefined }));

// jsdom has no layout: report a real width so the chart and its overlay render. `resize` reports a later one.
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useResizeObserver: (_target: unknown, callback: ResizeCallbackType) => {
    plotWidth.resize = callback;
    callback([{ contentRect: { width: plotWidth.value } }]);
  },
}));

const CATEGORIES: ChartCategoryType[] = [
  { id: "jan", label: "Jan", shortLabel: "J" },
  { id: "feb", label: "Feb", shortLabel: "F" },
  { id: "mar", label: "Mar", shortLabel: "M", placeholder: true },
];

const SOLID: ChartSeriesType = { id: "actual", type: "bar", name: "Actual", data: [100, 200, 300] };

const YEAR: ChartCategoryType[] = Array.from({ length: 12 }, (_, i) => ({
  id: `m${i}`,
  label: `M${i}`,
  shortLabel: `${i}`,
}));
const YEAR_SALES: ChartSeriesType = { ...SOLID, data: YEAR.map((_, i) => (i + 1) * 10) };
const LAST_SIX_MONTHS = { categories: YEAR.slice(6), series: [{ ...YEAR_SALES, data: YEAR_SALES.data.slice(6) }] };
const OUTLINE: ChartSeriesType = { id: "plan", type: "bar", name: "Plan", variant: "dashed", data: [150, null, null] };
const LINE: ChartSeriesType = {
  id: "trend",
  type: "line",
  name: "Trend",
  curve: "monotone",
  dots: true,
  data: [50, 80, 90],
};

let wrapper: VueWrapper | undefined;

function mountChart(props: Partial<InstanceType<typeof ReportingSvgChart>["$props"]> = {}, slots = {}) {
  wrapper = mount(ReportingSvgChart, {
    props: { categories: CATEGORIES, series: [SOLID], ariaLabel: "Sales", ...props },
    slots,
    attachTo: document.body,
    global: {
      stubs: {
        VcLoaderOverlay: true,
        // Hands out the trigger props the real VcPopover does for a hover tooltip.
        VcTooltip: {
          props: { disabled: Boolean, lazy: Boolean },
          template: `<div class='tooltip-stub' :data-lazy='lazy'>
            <slot :trigger-props="{ role: 'button', 'aria-expanded': false, 'aria-controls': 'popover-1' }" />
            <div class='tooltip-content'><slot name='content' /></div>
          </div>`,
        },
      },
    },
  });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  plotWidth.value = 900;
  vi.restoreAllMocks();
});

describe("ReportingSvgChart", () => {
  it("draws a bar per value and none for a placeholder category", () => {
    const bars = mountChart().findAll(".reporting-svg-chart__bar");

    expect(bars).toHaveLength(2);
  });

  it("draws an overlapping outline beneath the solid bar of its column", () => {
    const chart = mountChart({ series: [SOLID, OUTLINE], barLayout: "overlap" });
    const january = chart.findAll("svg > g").at(1);
    const bars = january?.findAll(".reporting-svg-chart__bar") ?? [];

    expect(bars.map((bar) => bar.classes("reporting-svg-chart__bar--dashed"))).toEqual([true, false]);
    expect(bars[0]?.attributes("x")).toBe(bars[1]?.attributes("x"));
  });

  it("stands grouped bars side by side", () => {
    const chart = mountChart({ series: [SOLID, { ...OUTLINE, variant: "solid" }], barLayout: "grouped" });
    const bars = chart.findAll("svg > g").at(1)?.findAll(".reporting-svg-chart__bar") ?? [];

    expect(Number(bars[1]?.attributes("x"))).toBeGreaterThan(Number(bars[0]?.attributes("x")));
  });

  it("shows a placeholder as a stub with its slot caption and no hover target", () => {
    const chart = mountChart({}, { placeholder: "Upcoming" });

    expect(chart.findAll(".reporting-svg-chart__placeholder")).toHaveLength(1);
    expect(chart.find(".reporting-svg-chart__placeholder-caption").text()).toBe("Upcoming");
    expect(chart.findAll(".reporting-svg-chart__hit-area")).toHaveLength(2);
  });

  it("leaves a hidden series out of the plot, the axis and the legend", () => {
    const chart = mountChart({ series: [SOLID, { ...LINE, data: [5000, 5000, 5000], hidden: true }] });

    expect(chart.find(".reporting-svg-chart__line").exists()).toBe(false);
    expect(chart.findAll(".reporting-svg-chart__tick").at(-1)?.text()).toBe("200");
    expect(chart.findAll(".reporting-svg-chart__legend-item").map((item) => item.text())).toEqual(["Actual"]);
  });

  it("lists only the series that have something drawn, then the appended items", () => {
    const empty: ChartSeriesType = { id: "none", type: "bar", name: "Nothing", data: [null, null, 400] };
    const chart = mountChart({ series: [SOLID, empty] }, { "legend-append": "<li class='extra'>Extra</li>" });

    expect(chart.findAll(".reporting-svg-chart__legend-item").map((item) => item.text())).toEqual(["Actual"]);
    expect(chart.find(".reporting-svg-chart__legend .extra").exists()).toBe(true);
  });

  it("leaves the legend out when asked to", () => {
    const chart = mountChart({ showLegend: false }, { "legend-append": "<li class='extra'>Extra</li>" });

    expect(chart.find(".reporting-svg-chart__legend").exists()).toBe(false);
  });

  // jsdom has no layout, so every tick label is given the same width: a short one ("$800") or a long one ("12,5 tys. USD").
  it.each([
    { labelWidth: 30, plotStart: "38" },
    { labelWidth: 71, plotStart: "79" },
  ])(
    "runs the plot from just past its widest tick label ($labelWidth px) to the edge",
    async ({ labelWidth, plotStart }) => {
      vi.spyOn(SVGElement.prototype, "getBoundingClientRect").mockReturnValue({ width: labelWidth } as DOMRect);
      const chart = mountChart();
      await nextTick();
      const gridLine = chart.find(".reporting-svg-chart__grid line");

      expect(gridLine.attributes("x1")).toBe(plotStart);
      expect(gridLine.attributes("x2")).toBe(String(plotWidth.value));
    },
  );

  it("measures the widest tick label, not the first", async () => {
    // The default format prints the tick itself, so "300" is wider than "0".
    vi.spyOn(SVGElement.prototype, "getBoundingClientRect").mockImplementation(function (this: SVGElement) {
      return { width: (this.textContent?.trim().length ?? 0) * 10 } as DOMRect;
    });
    const chart = mountChart();
    await nextTick();

    expect(chart.find(".reporting-svg-chart__grid line").attributes("x1")).toBe("38");
  });

  it("measures the tick labels once a plot that mounted with no width gets one", async () => {
    vi.spyOn(SVGElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 30 } as DOMRect);
    plotWidth.value = 0;
    const chart = mountChart();
    await nextTick();
    expect(chart.find(".reporting-svg-chart__grid").exists()).toBe(false);

    plotWidth.resize?.([{ contentRect: { width: 900 } }]);
    await nextTick();
    await nextTick();

    expect(chart.find(".reporting-svg-chart__grid line").attributes("x1")).toBe("38");
  });

  it("draws a line with a smooth path and a dot per point, skipping placeholders", () => {
    const chart = mountChart({ series: [LINE] });

    expect(chart.find(".reporting-svg-chart__line").attributes("d")).toContain("C");
    expect(chart.findAll(".reporting-svg-chart__dot")).toHaveLength(2);
  });

  it("breaks a line at a gap instead of bridging it", () => {
    const categories = CATEGORIES.map((category) => ({ ...category, placeholder: false }));
    const chart = mountChart({ categories, series: [{ ...LINE, data: [50, null, 90] }] });

    expect(chart.find(".reporting-svg-chart__line").attributes("d")?.match(/M/g)).toHaveLength(2);
    expect(chart.findAll(".reporting-svg-chart__dot")).toHaveLength(2);
  });

  it("puts annotations above the columns with data, and leaves them out on narrow columns", () => {
    const wide = mountChart({}, { annotation: "<span class='note'>↑</span>" });
    expect(wide.findAll(".note")).toHaveLength(2);
    wide.unmount();

    plotWidth.value = 150;
    const narrow = mountChart({}, { annotation: "<span class='note'>↑</span>" });

    expect(narrow.findAll(".note")).toHaveLength(0);
    expect(narrow.findAll(".reporting-svg-chart__label").map((label) => label.text())).toEqual(["J", "F", "M"]);
  });

  it("shades the hovered column", async () => {
    const chart = mountChart();
    const [january] = chart.findAll(".reporting-svg-chart__hit-area");

    await january.trigger("mouseenter");
    expect(chart.findAll(".reporting-svg-chart__bar--active")).toHaveLength(1);

    await january.trigger("mouseleave");
    expect(chart.findAll(".reporting-svg-chart__bar--active")).toHaveLength(0);
  });

  it("keeps one tab stop and moves between columns with the arrow keys", async () => {
    const chart = mountChart({ categories: [...CATEGORIES, { id: "apr", label: "Apr" }], series: [SOLID] });
    const targets = chart.findAll(".reporting-svg-chart__hit-area");

    expect(targets.map((target) => target.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);

    (targets[0].element as HTMLElement).focus();
    await targets[0].trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(targets[1].element);

    // The placeholder (Mar) is skipped.
    await targets[1].trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(targets[2].element);
    expect(targets.map((target) => target.attributes("tabindex"))).toEqual(["-1", "-1", "0"]);

    await targets[2].trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(targets[0].element);
  });

  it("moves back with ArrowLeft, jumps to the last column with End, and keeps the keys from scrolling the page", async () => {
    const chart = mountChart({ categories: [...CATEGORIES, { id: "apr", label: "Apr" }], series: [SOLID] });
    const targets = chart.findAll(".reporting-svg-chart__hit-area");
    (targets[0].element as HTMLElement).focus();

    const end = new KeyboardEvent("keydown", { key: "End", cancelable: true });
    targets[0].element.dispatchEvent(end);
    expect(document.activeElement).toBe(targets[2].element);
    expect(end.defaultPrevented).toBe(true);

    await targets[2].trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(targets[1].element);

    const tab = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    targets[1].element.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
  });

  it("keeps the arrow keys working after the leading months drop out", async () => {
    const chart = mountChart({ categories: YEAR, series: [YEAR_SALES] });

    await chart.setProps(LAST_SIX_MONTHS);
    const targets = chart.findAll("[role='img']");
    (targets[0].element as SVGSVGElement).focus();
    await targets[0].trigger("keydown", { key: "ArrowRight" });

    expect(document.activeElement).toBe(targets[1].element);
  });

  it("keeps the tab stop on the same month when the months shift", async () => {
    const chart = mountChart({ categories: YEAR, series: [YEAR_SALES] });
    await chart.findAll("[role='img']")[8].trigger("focusin");

    await chart.setProps(LAST_SIX_MONTHS);
    const tabStops = chart.findAll("[role='img']").filter((target) => target.attributes("tabindex") === "0");

    expect(tabStops.map((target) => target.attributes("aria-label"))).toEqual(["M8"]);
  });

  it("exposes a column as an image with its tooltip, not as a button", () => {
    const [january] = mountChart().findAll(".reporting-svg-chart__hit-area");

    expect(january.attributes("role")).toBe("img");
    expect(january.attributes("aria-label")).toBe("Jan");
    expect(january.attributes("aria-expanded")).toBeUndefined();
    expect(january.attributes("aria-controls")).toBeUndefined();
  });

  it("mounts each tooltip's content only once it opens", () => {
    const tooltips = mountChart().findAll(".tooltip-stub");

    expect(tooltips.map((tooltip) => tooltip.attributes("data-lazy"))).toEqual(["true", "true"]);
  });

  it("hands the tooltip the column and every visible series' value", () => {
    const chart = mountChart(
      { series: [SOLID, OUTLINE] },
      {
        tooltip:
          "<template #tooltip='{ category, values }'>{{ category.label }}: {{ values.map((v) => v.value).join('/') }}</template>",
      },
    );

    expect(chart.find(".tooltip-content").text()).toBe("Jan: 100/150");
  });
});
