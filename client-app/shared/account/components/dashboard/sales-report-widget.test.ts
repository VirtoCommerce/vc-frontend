import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import SalesReportWidget from "./sales-report-widget.vue";
import type { Ref } from "vue";

// The composable's state, set per test in beforeEach.
const report = vi.hoisted(() => ({}) as { state: Record<string, Ref<unknown>> });

vi.mock("../../composables/useAccountSalesReport", () => ({
  useAccountSalesReport: () => report.state,
}));
vi.mock("@/core/globals", async () => {
  const { createI18n } = await import("@/i18n");
  return { globals: { cultureName: "en-US", currencyCode: "USD", i18n: createI18n("en-US", "USD") } };
});
vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getModuleSettings: () => ({}) }),
}));

const STORAGE_KEY = "vc-account-sales-report-period";

// Mirrors the panel's contract: its props and the `update:period` of its v-model.
const ReportingPanelStub = defineComponent({
  name: "ReportingPanel",
  props: ["period", "data", "loading", "error", "withTiles", "withTable"],
  emits: { "update:period": (value: unknown) => typeof value === "string" },
  template: '<div class="panel" />',
});

function mountWidget() {
  return mount(SalesReportWidget, {
    props: { title: "Sales report" },
    global: {
      stubs: {
        LayoutWidget: { template: '<div><slot name="append" /><slot /></div>' },
        ReportingPanel: ReportingPanelStub,
        VcEmptyView: { props: ["text"], template: '<div>{{ text }}<slot name="button" /></div>' },
        VcLink: { name: "VcLink", props: ["to"], template: "<a><slot /></a>" },
        VcIcon: true,
        VcButton: { template: "<button><slot /></button>" },
      },
      mocks: {
        $t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
      },
    },
  });
}

beforeEach(() => {
  localStorage.clear();
  report.state = {
    data: ref(undefined),
    excludedCount: ref(0),
    hasOrders: ref(true),
    loading: ref(false),
    failed: ref(false),
  };
});

describe("SalesReportWidget", () => {
  // The panel shows its KPI tiles unless told otherwise, so the widget leaves `withTiles` unset.
  it("shows the report with its KPI tiles and without the table", () => {
    const panel = mountWidget().findComponent(ReportingPanelStub);

    expect(panel.props()).toMatchObject({ withTable: false, period: "year" });
    expect(panel.props("withTiles")).toBeUndefined();
  });

  it("links to the orders list", () => {
    expect(mountWidget().findComponent({ name: "VcLink" }).props("to")).toEqual({ name: "Orders" });
  });

  it("passes the read's state through to the panel", () => {
    report.state.loading.value = true;
    report.state.failed.value = true;

    expect(mountWidget().findComponent(ReportingPanelStub).props()).toMatchObject({ loading: true, error: true });
  });

  it("shows the empty state instead of charts of zeros to a user who never ordered", () => {
    report.state.hasOrders.value = false;
    const wrapper = mountWidget();

    expect(wrapper.find('[data-test-id="sales-report-empty-section"]').exists()).toBe(true);
    expect(wrapper.findComponent(ReportingPanelStub).exists()).toBe(false);
  });

  it("keeps the report while the history is still unknown", () => {
    report.state.hasOrders.value = undefined;

    expect(mountWidget().findComponent(ReportingPanelStub).exists()).toBe(true);
  });

  it("says how many orders in other currencies are left out", () => {
    report.state.excludedCount.value = 3;

    expect(mountWidget().find('[data-test-id="sales-report-excluded-label"]').text()).toContain('"count":"3"');
  });

  it("says nothing about left-out orders when there are none", () => {
    expect(mountWidget().find('[data-test-id="sales-report-excluded-label"]').exists()).toBe(false);
  });

  it("remembers the picked period in the browser and ignores a stored value it does not know", async () => {
    localStorage.setItem(STORAGE_KEY, "decade");
    const wrapper = mountWidget();
    expect(wrapper.findComponent(ReportingPanelStub).props("period")).toBe("year");

    wrapper.findComponent(ReportingPanelStub).vm.$emit("update:period", "q3");
    await nextTick();

    expect(localStorage.getItem(STORAGE_KEY)).toBe("q3");
    expect(wrapper.findComponent(ReportingPanelStub).props("period")).toBe("q3");
  });
});
