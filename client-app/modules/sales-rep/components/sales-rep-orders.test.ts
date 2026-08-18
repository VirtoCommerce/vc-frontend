import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { CUSTOMER_ORDERS_ROUTE_NAME } from "../constants";
import SalesRepOrders from "./sales-rep-orders.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    orders: ref<Record<string, unknown>[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
  };
});

vi.mock("../composables/useSalesRepOrders", () => ({
  useSalesRepOrders: () => ({ orders: state.orders, loading: state.loading, error: state.error }),
}));
vi.mock("../composables/useSalesRepRules", async () => {
  const { ref } = await import("vue");
  return { useSalesRepRules: () => ({ rules: ref([]) }) };
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
      // The content lives in named slots, which a plain stub would not render.
      VcWidget: { template: '<div><slot name="append" /><slot name="default-container" /></div>' },
      // LayoutWidget's drag controls: never rendered here, but the compiler resolves them anyway.
      VcButton: true,
      VcTable: true,
      VcTableColumn: true,
      VcEmptyView: true,
      VcIcon: true,
      VcLink: { props: ["to"], template: "<a><slot /></a>" },
      SalesRepRuleChips: true,
      OrderStatus: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");

beforeEach(() => {
  state.orders.value = [];
  state.loading.value = false;
  state.error.value = null;
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

// findComponent by selector is typed as WrapperLike, which exposes none of what a stub is read for.
type StubType = {
  exists: () => boolean;
  props: () => Record<string, unknown>;
  attributes: (key: string) => string | undefined;
  vm: { $emit: (event: string, ...args: unknown[]) => void };
};

describe("SalesRepOrders all-orders link", () => {
  const allOrdersLink = (wrapper: ReturnType<typeof createWrapper>) =>
    wrapper.findComponent("a.sales-rep-orders__all-link") as unknown as StubType;

  // The rep is reading one customer, so "All orders" must stay in that customer's context.
  it("points at the customer's own order list, in the same tab", () => {
    const wrapper = createWrapper({ props: { title: "Recent orders", organizationId: "org-1" } });

    const link = allOrdersLink(wrapper);

    expect(link.props().to).toEqual({ name: CUSTOMER_ORDERS_ROUTE_NAME, params: { organizationId: "org-1" } });
    expect(link.attributes("target")).toBeUndefined();
  });

  // The hub dashboard lists every customer, which no single customer's page can show.
  it("keeps the cross-customer widget on the buyer-facing orders page", () => {
    const wrapper = createWrapper();

    expect(allOrdersLink(wrapper).props().to).toEqual({ name: "Orders" });
  });
});
