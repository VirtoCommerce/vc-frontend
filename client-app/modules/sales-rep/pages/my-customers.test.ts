import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import MyCustomers from "./my-customers.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<Record<string, unknown>[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
    keyword: ref(""),
    filter: ref<string | undefined>(undefined),
  };
});

vi.mock("../composables/useSalesRepCustomers", async () => {
  const { ref } = await import("vue");
  return {
    PAGE_SIZE: 10,
    useSalesRepCustomers: () => ({
      items: state.items,
      loading: state.loading,
      error: state.error,
      keyword: state.keyword,
      filter: state.filter,
      sortRule: ref(undefined),
      page: ref(1),
      pages: ref(1),
    }),
  };
});
vi.mock("../composables/useSalesRepRules", async () => {
  const { ref } = await import("vue");
  return { useSalesRepRules: () => ({ rules: ref([]) }) };
});
vi.mock("../composables/useSalesRepColumnSort", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepColumnSort: () => ({ sortInfo: ref(undefined), isColumnSortable: () => false, applySort: vi.fn() }),
  };
});
vi.mock("../composables/useSalesRepCommunication", () => ({
  useSalesRepCommunication: () => ({ send: vi.fn(), sending: false }),
}));

const createWrapper = createWrapperFactory(mount, MyCustomers, {
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      VcTable: true,
      VcTableColumn: true,
      VcEmptyView: true,
      VcTypography: true,
      VcInput: true,
      VcButton: true,
      VcIcon: true,
      VcLink: true,
      SalesRepRuleChips: true,
      CustomerCommunicationModal: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");

beforeEach(() => {
  state.items.value = [];
  state.loading.value = false;
  state.error.value = null;
  state.keyword.value = "";
  state.filter.value = undefined;
});

describe("MyCustomers states", () => {
  it("shows the no-data view, not an error, when the response was simply empty", () => {
    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("empty");
  });

  // The query runs with keepPreviousResult, so rows survive a failed refetch and would otherwise be
  // presented as the current result (VCST-5586).
  it("replaces the table with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [{ organizationId: "o1", organizationName: "Acme", ytdTotal: "$1.00", ytdCount: 1 }];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(wrapper.find("vc-table-stub").exists()).toBe(false);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  // With a keyword active the no-data view renders its search variant plus a "Reset search" button —
  // offering the rep a fix for a problem the search did not cause.
  it("shows the failure view rather than the search empty state when a keyword is active", () => {
    state.keyword.value = "acme";
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("shows the search empty state when a keyword matched nothing and no request failed", () => {
    state.keyword.value = "acme";

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("search");
  });
});
