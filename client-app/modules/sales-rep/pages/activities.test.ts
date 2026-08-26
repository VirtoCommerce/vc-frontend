import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, toValue } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { ACTIVITY_PAGE_SIZE } from "../constants";
import Activities from "./activities.vue";
import type { SalesRepActivityCategoryCountType, SalesRepActivityItemType, SalesRepRuleType } from "../types";
import type { Ref } from "vue";

// The options shape the page hands the insights composables, as far as these tests assert it.
type InsightsOptionsType = {
  organizationId: () => string | undefined;
  enabled: Ref<boolean>;
};

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

// Shared state for the two ranked-insights composables (Top mode), with the options captured so the
// tests can assert what the page asks for (organizationId pass-through, enabled gating).
const insights = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    searchItems: ref<Record<string, unknown>[]>([]),
    searchNotConfigured: ref(false),
    searchLoading: ref(false),
    searchError: ref<Error | null>(null),
    searchOptions: undefined as InsightsOptionsType | undefined,
    browseItems: ref<Record<string, unknown>[]>([]),
    browseNotConfigured: ref(false),
    browseLoading: ref(false),
    browseError: ref<Error | null>(null),
    browseOptions: undefined as InsightsOptionsType | undefined,
  };
});

// One op per view: rows AND tab badges come from the same response (a separate counts-only run
// could return a different data vintage). The captured options let the tests hold the page to that.
const activityCalls = vi.hoisted(() => ({ options: [] as { take?: number }[] }));
vi.mock("../composables/useSalesRepActivities", () => ({
  useSalesRepActivities: (options: { take?: number } = {}) => {
    activityCalls.options.push(options);
    return {
      items: state.items,
      categoryCounts: state.categoryCounts,
      totalCount: state.totalCount,
      loading: state.loading,
      error: state.error,
    };
  },
}));
vi.mock("../composables/useSalesRepSearchHistory", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepSearchHistory: (options: InsightsOptionsType) => {
      insights.searchOptions = options;
      return {
        items: insights.searchItems,
        notConfigured: insights.searchNotConfigured,
        dataAsOf: ref(undefined),
        loading: insights.searchLoading,
        error: insights.searchError,
      };
    },
  };
});
vi.mock("../composables/useSalesRepBrowseHistory", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepBrowseHistory: (options: InsightsOptionsType) => {
      insights.browseOptions = options;
      return {
        items: insights.browseItems,
        notConfigured: insights.browseNotConfigured,
        dataAsOf: ref(undefined),
        loading: insights.browseLoading,
        error: insights.browseError,
      };
    },
  };
});
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
      VcLink: { template: "<a><slot /></a>" },
      ActivityRow: ActivityRowStub,
      SalesRepRuleChips: RuleChipsStub,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");
const findChips = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAllComponents({ name: "RuleChipsStub" });
const findRows = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAllComponents({ name: "ActivityRowStub" });
const topRows = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll(".activities__top-row");

// Chip order in the DOM: category tabs (0), period chips (1), then the mode toggle (2) when shown.
async function openTab(wrapper: ReturnType<typeof createWrapper>, name: string | undefined): Promise<void> {
  findChips(wrapper)[0].vm.$emit("update:modelValue", name);
  await nextTick();
  await nextTick();
}

async function switchToTop(wrapper: ReturnType<typeof createWrapper>): Promise<void> {
  findChips(wrapper)[2].vm.$emit("update:modelValue", "top");
  await nextTick();
  await nextTick();
}

beforeEach(() => {
  activityCalls.options.length = 0;
  state.items.value = [];
  state.categoryCounts.value = [];
  state.totalCount.value = 0;
  state.loading.value = false;
  state.error.value = null;
  insights.searchItems.value = [];
  insights.searchNotConfigured.value = false;
  insights.searchLoading.value = false;
  insights.searchError.value = null;
  insights.searchOptions = undefined;
  insights.browseItems.value = [];
  insights.browseNotConfigured.value = false;
  insights.browseLoading.value = false;
  insights.browseError.value = null;
  insights.browseOptions = undefined;
});

describe("Activities page", () => {
  // The badges must share the rows' vintage: a second, counts-only run (take: 0) hits a different
  // backend cache entry and can disagree with the rows while new analytics data lands.
  it("runs ONE salesRepActivities query per view — never a separate counts-only run", async () => {
    const wrapper = createWrapper();

    expect(activityCalls.options).toHaveLength(1);
    expect(activityCalls.options[0].take).toBe(ACTIVITY_PAGE_SIZE);

    // A tab switch re-drives the same reactive query; it must not spawn another op.
    await openTab(wrapper, "searches");
    expect(activityCalls.options).toHaveLength(1);
  });

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

  // "All" sums the response's categoryCounts — the rows' totalCount is category-scoped once a tab
  // filters, so it can't back the All badge.
  it("derives the All badge from the same response's categoryCounts", () => {
    state.categoryCounts.value = [
      { category: "orders", count: 2 },
      { category: "logins", count: 1 },
    ];
    state.totalCount.value = 99;

    const wrapper = createWrapper();

    expect(findChips(wrapper)[0].props("allLabel")).toBe("sales_rep.activity.tabs.all (3)");
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

  // The GA-backed feed can run for seconds on a cold read — a blank widget reads as broken.
  it("shows the skeleton, not a blank widget, while the first load runs", () => {
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(wrapper.findAll(".activities__skeleton")).toHaveLength(5);
    expect(findRows(wrapper)).toHaveLength(0);
    expect(emptyViews(wrapper)).toHaveLength(0);
  });

  // keepPreviousResult keeps the outgoing tab's rows in `items` during a switch; showing them as the
  // new tab's result would mislead, so a same-height skeleton takes their place.
  it("swaps stale rows for a same-height skeleton during a tab or period refetch", () => {
    state.items.value = [
      { category: "orders", type: "orderPlaced" },
      { category: "logins", type: "login" },
      { category: "searches", type: "search" },
    ];
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(wrapper.findAll(".activities__skeleton")).toHaveLength(3);
    expect(findRows(wrapper)).toHaveLength(0);
  });

  it("keeps the tabs up without figures while the counts load", () => {
    state.loading.value = true;

    const wrapper = createWrapper();
    const rules = findChips(wrapper)[0].props("rules") as SalesRepRuleType[];

    expect(rules[0].label).toBe("sales_rep.activity.tabs.orders");
    expect(findChips(wrapper)[0].props("allLabel")).toBe("sales_rep.activity.tabs.all");
  });

  // Only the very first load hides the figures; a refetch (tab/period switch, page turn) holds the
  // last-known counts instead of blanking every badge.
  it("holds the last-known counts on the tabs while a refetch runs", async () => {
    state.categoryCounts.value = [{ category: "orders", count: 7 }];

    const wrapper = createWrapper();

    state.loading.value = true;
    await nextTick();

    const rules = findChips(wrapper)[0].props("rules") as SalesRepRuleType[];
    expect(rules[0].label).toContain("(7)");
    expect(findChips(wrapper)[0].props("allLabel")).toContain("(7)");
  });

  // "No activity yet" fits the lifetime view; a period-scoped feed names the tracked window instead.
  it("switches the empty-state wording when a period narrows the feed", async () => {
    const wrapper = createWrapper();

    expect(emptyViews(wrapper)[0].attributes("text")).toBe("sales_rep.activity.empty");

    findChips(wrapper)[1].vm.$emit("update:modelValue", "month");
    await nextTick();

    expect(emptyViews(wrapper)[0].attributes("text")).toBe("sales_rep.activity.empty_period");
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

describe("Activities page — Top|Recent mode", () => {
  it("offers the Top|Recent toggle only on the Searches and Product views tabs", async () => {
    const wrapper = createWrapper();

    expect(findChips(wrapper)).toHaveLength(2);

    await openTab(wrapper, "orders");
    expect(findChips(wrapper)).toHaveLength(2);

    await openTab(wrapper, "searches");
    const chips = findChips(wrapper);
    expect(chips).toHaveLength(3);
    expect((chips[2].props("rules") as SalesRepRuleType[]).map((rule) => rule.name)).toEqual(["top"]);
    expect(chips[2].props("allLabel")).toBe("sales_rep.customer_insights.recent");

    await openTab(wrapper, "productViews");
    expect(findChips(wrapper)).toHaveLength(3);

    await openTab(wrapper, "logins");
    expect(findChips(wrapper)).toHaveLength(2);
  });

  it("runs the ranked query only in Top mode, without organizationId on the rep-wide page", async () => {
    const wrapper = createWrapper();

    await openTab(wrapper, "searches");
    expect(toValue(insights.searchOptions!.enabled)).toBe(false);

    await switchToTop(wrapper);
    expect(toValue(insights.searchOptions!.enabled)).toBe(true);
    expect(toValue(insights.searchOptions!.organizationId)).toBeUndefined();
    expect(toValue(insights.browseOptions!.enabled)).toBe(false);
  });

  it("passes organizationId through in the per-customer page mode", async () => {
    const wrapper = createWrapper({ props: { organizationId: "org-1" } });

    await openTab(wrapper, "productViews");
    await switchToTop(wrapper);

    expect(toValue(insights.browseOptions!.enabled)).toBe(true);
    expect(toValue(insights.browseOptions!.organizationId)).toBe("org-1");
  });

  // Counts, not events: ranked rows carry no timestamps, and the capped list never pages.
  it("renders ranked search rows — rank, term link, count — with no pager", async () => {
    state.totalCount.value = 100;
    insights.searchItems.value = [
      { term: "gloves", count: 5 },
      { term: "hats", count: 2 },
    ];

    const wrapper = createWrapper();
    await openTab(wrapper, "searches");
    await switchToTop(wrapper);

    const rows = topRows(wrapper);
    expect(rows).toHaveLength(2);
    expect(rows[0].find(".activities__top-rank").text()).toBe("1");
    expect(rows[0].find("a").text()).toContain("gloves");
    expect(rows[0].text()).toContain("sales_rep.customer_insights.search_history.count");
    expect(findRows(wrapper)).toHaveLength(0);
    expect(wrapper.find("vc-pagination-stub").exists()).toBe(false);
    expect(wrapper.find(".activities__caveat").exists()).toBe(true);
  });

  it("deep-links a resolved product and degrades an unresolved code to plain text", async () => {
    insights.browseItems.value = [
      { productId: "p1", name: "Drill", sku: "D-1", slug: "drill", viewCount: 9 },
      { productId: "p2", name: "", sku: "X-2", viewCount: 3 },
    ];

    const wrapper = createWrapper();
    await openTab(wrapper, "productViews");
    await switchToTop(wrapper);

    const rows = topRows(wrapper);
    expect(rows).toHaveLength(2);
    expect(rows[0].find("a").exists()).toBe(true);
    expect(rows[0].text()).toContain("Drill");
    expect(rows[1].find("a").exists()).toBe(false);
    expect(rows[1].text()).toContain("X-2");
    expect(rows[1].text()).toContain("sales_rep.customer_insights.browse_history.views");
  });

  it("shows the skeleton, not a blank widget, while the ranked query runs", async () => {
    insights.searchLoading.value = true;

    const wrapper = createWrapper();
    await openTab(wrapper, "searches");
    await switchToTop(wrapper);

    expect(wrapper.findAll(".activities__skeleton")).toHaveLength(5);
    expect(topRows(wrapper)).toHaveLength(0);
    expect(emptyViews(wrapper)).toHaveLength(0);
  });

  it("names the tracked-empty and not-configured states in Top mode", async () => {
    const wrapper = createWrapper();
    await openTab(wrapper, "searches");
    await switchToTop(wrapper);

    expect(emptyViews(wrapper)[0].attributes("text")).toBe("sales_rep.customer_insights.search_history.empty");

    insights.searchNotConfigured.value = true;
    await nextTick();

    expect(emptyViews(wrapper)[0].attributes("text")).toBe("sales_rep.customer_insights.not_configured");
  });

  it("replaces the ranked list with the failure view when the insights query failed", async () => {
    insights.browseItems.value = [{ productId: "p1", name: "Drill", sku: "", viewCount: 1 }];
    insights.browseError.value = new Error("boom");

    const wrapper = createWrapper();
    await openTab(wrapper, "productViews");
    await switchToTop(wrapper);

    const views = emptyViews(wrapper);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
    expect(views[0].attributes("text")).toBe("sales_rep.customer_insights.browse_history.load_failed");
    expect(topRows(wrapper)).toHaveLength(0);
  });

  // The insights ops carry no categoryCounts, so the badges keep the last feed-response figures.
  it("keeps the feed's badge figures while a Top view is shown", async () => {
    state.categoryCounts.value = [
      { category: "searches", count: 4 },
      { category: "orders", count: 2 },
    ];

    const wrapper = createWrapper();
    await openTab(wrapper, "searches");
    await switchToTop(wrapper);

    const rules = findChips(wrapper)[0].props("rules") as SalesRepRuleType[];
    expect(rules[2].label).toContain("(4)");
    expect(findChips(wrapper)[0].props("allLabel")).toContain("(6)");
  });

  it("resets to Recent when the tab switches", async () => {
    state.items.value = [{ category: "productViews", type: "productView" }];

    const wrapper = createWrapper();
    await openTab(wrapper, "searches");
    await switchToTop(wrapper);
    expect(toValue(insights.searchOptions!.enabled)).toBe(true);

    await openTab(wrapper, "productViews");

    expect(toValue(insights.searchOptions!.enabled)).toBe(false);
    expect(toValue(insights.browseOptions!.enabled)).toBe(false);
    expect(topRows(wrapper)).toHaveLength(0);
    expect(findRows(wrapper)).toHaveLength(1);
  });
});
