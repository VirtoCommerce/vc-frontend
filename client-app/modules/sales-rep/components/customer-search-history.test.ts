import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toValue } from "vue";
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

// The options are captured: the default sort and the visibility gate are part of this panel's contract.
const searchOptions = vi.hoisted(() => ({ last: undefined as Record<string, unknown> | undefined }));
vi.mock("../composables/useSalesRepSearchHistory", () => ({
  useSalesRepSearchHistory: (options: Record<string, unknown>) => {
    searchOptions.last = options;
    return { ...state };
  },
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
      VcEmptyView: true,
      VcIcon: true,
      VcLink: { name: "VcLinkStub", props: ["to"], template: "<a><slot /></a>" },
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

  // VCST-5731: "clicking a search term opens catalog search results for that term".
  it("links every term to the catalog search for it", () => {
    state.items.value = [{ term: "coffee", count: 3 }];

    const link = createWrapper().findComponent({ name: "VcLinkStub" });

    expect(link.exists()).toBe(true);
    expect(link.text()).toBe("coffee");
    expect(link.props("to")).toMatchObject({ query: { q: "coffee" } });
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toBe("noopener noreferrer");
  });

  // Recent is the baseline here as it is for product views: the newest searches are what the customer
  // is asking about now, and "top" is the deliberate second look.
  it("asks for the newest searches by default", () => {
    createWrapper();

    expect(toValue(searchOptions.last?.sort)).toBe("date");
  });

  // The panel stays mounted behind the other sub-view; a list nobody is looking at must not spend a
  // round trip on the analytics backend.
  it("does not query while another sub-view is showing", () => {
    createWrapper({ props: { organizationId: "org-1", active: false } });
    expect(toValue(searchOptions.last?.enabled)).toBe(false);

    createWrapper({ props: { organizationId: "org-1", active: true } });
    expect(toValue(searchOptions.last?.enabled)).toBe(true);
  });
});
