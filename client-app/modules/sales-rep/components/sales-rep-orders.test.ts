import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import SalesRepOrders from "./sales-rep-orders.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    orders: ref<Record<string, unknown>[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
    filterRulesFailed: ref(false),
    sortRulesFailed: ref(false),
  };
});

vi.mock("../composables/useSalesRepOrders", () => ({
  useSalesRepOrders: () => ({ orders: state.orders, loading: state.loading, error: state.error }),
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

const createWrapper = createWrapperFactory(mount, SalesRepOrders, {
  props: { title: "Recent orders" },
  global: {
    // The shared default renders stubs' default slots, which would evaluate VcTable's column
    // scoped-slots with no row. This test only cares which of the three branches renders.
    renderStubDefaultSlot: false,
    stubs: {
      // The content lives in a named slot, which a plain stub would not render.
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      // LayoutWidget's drag controls: never rendered here, but the compiler resolves them anyway.
      VcButton: true,
      VcTable: true,
      VcTableColumn: true,
      VcEmptyView: true,
      VcIcon: true,
      VcLink: true,
      // Rendered rather than stubbed away: the assertions are about which message the alert carries.
      VcAlert: { template: '<div class="vc-alert"><slot /></div>' },
      SalesRepRuleChips: true,
      OrderStatus: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");

const ruleAlert = (wrapper: ReturnType<typeof createWrapper>) => wrapper.find(".vc-alert");

beforeEach(() => {
  state.orders.value = [];
  state.loading.value = false;
  state.error.value = null;
  state.filterRulesFailed.value = false;
  state.sortRulesFailed.value = false;
});

// Without the rules the tab row and the sortable headers are simply absent, which read as "this widget
// has no filters" rather than as a failure (VCST-5682).
describe("SalesRepOrders degraded controls", () => {
  it("says the filters could not be loaded when the widget offers them", () => {
    state.filterRulesFailed.value = true;

    const wrapper = createWrapper({ props: { title: "Recent orders", filterable: true } });

    expect(ruleAlert(wrapper).text()).toContain("sales_rep.rules.load_failed.filter");
  });

  it("stays silent about filters the widget never offers", () => {
    state.filterRulesFailed.value = true;

    const wrapper = createWrapper();

    expect(ruleAlert(wrapper).exists()).toBe(false);
  });

  it("says the sorting options could not be loaded", () => {
    state.sortRulesFailed.value = true;

    const wrapper = createWrapper();

    expect(ruleAlert(wrapper).text()).toContain("sales_rep.rules.load_failed.sort");
  });

  it("names both when neither rule list loaded", () => {
    state.filterRulesFailed.value = true;
    state.sortRulesFailed.value = true;

    const wrapper = createWrapper({ props: { title: "Recent orders", filterable: true } });

    expect(ruleAlert(wrapper).text()).toContain("sales_rep.rules.load_failed.both");
  });

  it("keeps quiet while the rules load", () => {
    const wrapper = createWrapper({ props: { title: "Recent orders", filterable: true } });

    expect(ruleAlert(wrapper).exists()).toBe(false);
  });
});

describe("SalesRepOrders states", () => {
  it("shows the table when orders loaded", () => {
    state.orders.value = [{ id: "o1", number: "1001", total: "$10.00", itemsCount: "1" }];

    const wrapper = createWrapper();

    expect(wrapper.find("vc-table-stub").exists()).toBe(true);
    expect(emptyViews(wrapper)).toHaveLength(0);
  });

  it("shows the no-data view when the response was empty", () => {
    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBeUndefined();
    expect(wrapper.find("vc-table-stub").exists()).toBe(false);
  });

  // VCST-5586: apollo keeps the previous rows on a failed refetch, so the failure view has to win over
  // BOTH the table and the no-data view — otherwise the old filter's rows read as the new result.
  it("replaces the table with the failure view when the query failed but stale rows remain", () => {
    state.orders.value = [{ id: "o1", number: "1001", total: "$10.00", itemsCount: "1" }];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(wrapper.find("vc-table-stub").exists()).toBe(false);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("prefers the table's own loading state over the failure view while refetching", () => {
    state.orders.value = [{ id: "o1", number: "1001", total: "$10.00", itemsCount: "1" }];
    state.error.value = new Error("boom");
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(emptyViews(wrapper)).toHaveLength(0);
    expect(wrapper.find("vc-table-stub").exists()).toBe(true);
  });
});
