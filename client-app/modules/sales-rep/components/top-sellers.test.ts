import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import TopSellers from "./top-sellers.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<Record<string, unknown>[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
    filterRulesFailed: ref(false),
    sortRulesFailed: ref(false),
  };
});

vi.mock("../composables/useSalesRepTopSellers", () => ({
  useSalesRepTopSellers: () => ({ items: state.items, loading: state.loading, error: state.error }),
}));
vi.mock("../composables/useSalesRepRules", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepRules: (_domain: string, kind: string) => ({
      rules: ref([]),
      loading: ref(false),
      failed: kind === "filter" ? state.filterRulesFailed : state.sortRulesFailed,
    }),
  };
});
vi.mock("../composables/useSalesRepPeriodFilter", async () => {
  const { ref } = await import("vue");
  return { useSalesRepPeriodFilter: () => ({ from: ref(undefined), to: ref(undefined) }) };
});
vi.mock("../composables/useSalesRepColumnSort", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepColumnSort: () => ({ sortInfo: ref(undefined), isColumnSortable: () => false, applySort: vi.fn() }),
  };
});

const createWrapper = createWrapperFactory(mount, TopSellers, {
  props: { title: "Top sellers" },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      // LayoutWidget's drag controls: never rendered here, but the compiler resolves them anyway.
      VcButton: true,
      VcTable: true,
      VcTableColumn: true,
      VcEmptyView: true,
      VcIcon: true,
      VcLink: true,
      VcImage: true,
      // Rendered rather than stubbed away: the assertion is about which message the alert carries.
      VcAlert: { template: '<div class="vc-alert"><slot /></div>' },
      SalesRepRuleChips: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");

beforeEach(() => {
  state.items.value = [];
  state.loading.value = false;
  state.error.value = null;
  state.filterRulesFailed.value = false;
  state.sortRulesFailed.value = false;
});

// The category chips and the sortable headers vanish without their rules, with nothing saying why (VCST-5682).
describe("TopSellers degraded controls", () => {
  it("names the controls that could not be loaded", () => {
    state.filterRulesFailed.value = true;
    state.sortRulesFailed.value = true;

    const wrapper = createWrapper();

    expect(wrapper.find(".vc-alert").text()).toContain("sales_rep.rules.load_failed.both");
  });

  it("keeps quiet while the rules load", () => {
    const wrapper = createWrapper();

    expect(wrapper.find(".vc-alert").exists()).toBe(false);
  });
});

describe("TopSellers states", () => {
  it("shows the no-data view, not an error, when the period had no sales", () => {
    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBeUndefined();
  });

  it("replaces the table with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [{ rank: 1, productId: "p1", name: "Widget", units: "12,345", revenue: "$1.00" }];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(wrapper.find("vc-table-stub").exists()).toBe(false);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("keeps the table while a retry is in flight rather than flashing the failure view", () => {
    state.items.value = [{ rank: 1, productId: "p1", name: "Widget", units: "12,345", revenue: "$1.00" }];
    state.error.value = new Error("boom");
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(emptyViews(wrapper)).toHaveLength(0);
    expect(wrapper.find("vc-table-stub").exists()).toBe(true);
  });
});
