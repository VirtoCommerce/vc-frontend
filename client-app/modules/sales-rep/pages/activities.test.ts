import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import Activities from "./activities.vue";
import type { SalesRepActivityCategoryCountType, SalesRepActivityItemType, SalesRepRuleType } from "../types";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<Partial<SalesRepActivityItemType>[]>([]),
    categoryCounts: ref<SalesRepActivityCategoryCountType[]>([]),
    totalCount: ref(0),
    loading: ref(false),
    error: ref<Error | null>(null),
  };
});

// The page runs the op twice (counts-only for the tabs + the paged list); the shared state serves both.
vi.mock("../composables/useSalesRepActivities", () => ({
  useSalesRepActivities: () => ({
    items: state.items,
    categoryCounts: state.categoryCounts,
    totalCount: state.totalCount,
    loading: state.loading,
    error: state.error,
  }),
}));
vi.mock("../composables/useSalesRepCustomer", async () => {
  const { ref } = await import("vue");
  return { useSalesRepCustomer: () => ({ customer: ref(undefined), loading: ref(false), notFound: ref(false) }) };
});
vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useBreadcrumbs: () => [],
  usePageHead: vi.fn(),
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

// Props-exposing stubs so the tab vocabulary and row scoping can be asserted.
const RuleChipsStub = { name: "RuleChipsStub", props: ["rules", "allLabel", "loading"], template: "<div />" };
const ActivityRowStub = {
  name: "ActivityRowStub",
  props: ["item", "showOrganization", "compact"],
  template: "<div />",
};

const createWrapper = createWrapperFactory(mount, Activities, {
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      VcBreadcrumbs: true,
      VcTypography: true,
      VcPagination: true,
      VcEmptyView: true,
      VcIcon: true,
      ActivityRow: ActivityRowStub,
      SalesRepRuleChips: RuleChipsStub,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");
const findChips = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAllComponents({ name: "RuleChipsStub" });
const findRows = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAllComponents({ name: "ActivityRowStub" });

beforeEach(() => {
  state.items.value = [];
  state.categoryCounts.value = [];
  state.totalCount.value = 0;
  state.loading.value = false;
  state.error.value = null;
});

describe("Activities page", () => {
  // Zero-count categories keep their tab: a rep must see a category exists and is quiet, not wonder
  // where it went (analytics-off environments report searches/productViews/logins as 0).
  it("offers every category tab, counts included, even at zero", () => {
    state.categoryCounts.value = [
      { category: "orders", count: 7 },
      { category: "searches", count: 0 },
    ];

    const wrapper = createWrapper();
    const categoryChips = findChips(wrapper)[0];
    const rules = categoryChips.props("rules") as SalesRepRuleType[];

    expect(rules.map((rule) => rule.name)).toEqual(["orders", "customers", "searches", "productViews", "logins"]);
    expect(rules[0].label).toContain("(7)");
    expect(rules[2].label).toContain("(0)");
  });

  it("offers the period chips beside the category tabs", () => {
    const wrapper = createWrapper();
    const chips = findChips(wrapper);

    expect(chips).toHaveLength(2);
    expect((chips[1].props("rules") as SalesRepRuleType[]).map((rule) => rule.name)).toEqual(["month", "year"]);
  });

  it("shows the tracked-activity caveat on the mixed view", () => {
    state.items.value = [{ category: "orders", type: "orderPlaced" }];

    const wrapper = createWrapper();

    expect(wrapper.find(".activities__caveat").exists()).toBe(true);
  });

  // A failure gets its own view — it must not read as "no activity" (VCST-5586).
  it("replaces the list with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [{ category: "orders", type: "orderPlaced" }];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(findRows(wrapper)).toHaveLength(0);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("renders a row per event with the customer named on the cross-customer feed", () => {
    state.items.value = [
      { category: "orders", type: "orderPlaced" },
      { category: "logins", type: "login" },
    ];
    state.totalCount.value = 2;

    const wrapper = createWrapper();
    const rows = findRows(wrapper);

    expect(rows).toHaveLength(2);
    expect(rows[0].props("showOrganization")).toBe(true);
  });
});
