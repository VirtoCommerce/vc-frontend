import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import CustomerSearchHistory from "./customer-search-history.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<Record<string, unknown>[]>([]),
    notConfigured: ref(false),
    dataAsOf: ref<string | undefined>(undefined),
    loading: ref(false),
    error: ref<Error | null>(null),
  };
});

vi.mock("../composables/useSalesRepSearchHistory", () => ({
  useSalesRepSearchHistory: () => ({ ...state }),
}));
vi.mock("../composables/useSalesRepPeriodFilter", async () => {
  const { ref } = await import("vue");
  return { useSalesRepPeriodFilter: () => ({ from: ref(undefined), to: ref(undefined) }) };
});

const createWrapper = createWrapperFactory(mount, CustomerSearchHistory, {
  props: { organizationId: "org-1" },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      // LayoutWidget's drag controls: never rendered here, but the compiler resolves them anyway.
      VcButton: true,
      VcEmptyView: true,
      VcIcon: true,
      SalesRepRuleChips: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");
const rows = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll(".customer-search-history__row");

beforeEach(() => {
  state.items.value = [];
  state.notConfigured.value = false;
  state.dataAsOf.value = undefined;
  state.loading.value = false;
  state.error.value = null;
});

describe("CustomerSearchHistory states", () => {
  it("shows the no-data view, not an error, when nothing was tracked", () => {
    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBeUndefined();
    expect(views[0].attributes("text")).toBe("sales_rep.customer_insights.search_history.empty");
  });

  // The backend answers null when the store has no insights provider — the widget must name that
  // state instead of pretending the customer never searched.
  it("names the not-configured state distinctly from the empty one", () => {
    state.notConfigured.value = true;

    const views = emptyViews(createWrapper());

    expect(views).toHaveLength(1);
    expect(views[0].attributes("text")).toBe("sales_rep.customer_insights.not_configured");
  });

  it("replaces the list with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [{ term: "gloves", count: 3 }];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(rows(wrapper)).toHaveLength(0);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("keeps the list while a retry is in flight rather than flashing the failure view", () => {
    state.items.value = [{ term: "gloves", count: 3 }];
    state.error.value = new Error("boom");
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(emptyViews(wrapper)).toHaveLength(0);
    expect(rows(wrapper)).toHaveLength(1);
  });

  it("renders skeleton rows on first load, before any rows exist", () => {
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(wrapper.findAll(".customer-search-history__skeleton")).toHaveLength(5);
    expect(emptyViews(wrapper)).toHaveLength(0);
  });

  // GA sees only tracked activity (§4.7 of the design doc); a list without the caveat reads as a record.
  it("shows the tracked-activity caveat with the data-freshness date when the payload carries one", () => {
    state.items.value = [{ term: "gloves", count: 3 }];
    state.dataAsOf.value = "2026-08-20T00:00:00Z";

    const caveat = createWrapper().find(".customer-search-history__caveat");

    expect(caveat.exists()).toBe(true);
    expect(caveat.text()).toContain("sales_rep.customer_insights.tracked_caveat");
    expect(caveat.text()).toContain("sales_rep.customer_insights.data_as_of");
  });
});
