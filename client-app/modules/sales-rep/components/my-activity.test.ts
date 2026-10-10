import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toValue } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { buildStatisticsWindows } from "../utils";
import MyActivity from "./my-activity.vue";
import type { SalesRepActivityItemType } from "../types";
import type { MaybeRefOrGetter } from "vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<Partial<SalesRepActivityItemType>[]>([]),
    analyticsUnavailable: ref(false),
    loading: ref(false),
    error: ref<Error | null>(null),
    useSalesRepActivities: vi.fn(),
  };
});

vi.mock("../composables/useSalesRepActivities", () => ({ useSalesRepActivities: state.useSalesRepActivities }));

const createWrapper = createWrapperFactory(mount, MyActivity, {
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="append" /><slot name="default-container" /></div>' },
      ActivityRow: true,
      VcButton: true,
      VcEmptyView: true,
      VcIcon: true,
      VcLink: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");

beforeEach(() => {
  state.items.value = [];
  state.analyticsUnavailable.value = false;
  state.loading.value = false;
  state.error.value = null;
  state.useSalesRepActivities.mockClear();
  state.useSalesRepActivities.mockImplementation(() => ({
    items: state.items,
    analyticsUnavailable: state.analyticsUnavailable,
    loading: state.loading,
    error: state.error,
  }));
});

describe("MyActivity states", () => {
  // Analytics absence arrives as zero rows by contract, so the quiet view is the no-data one, not an error.
  it("shows the no-data view, not an error, when there is no activity this year", () => {
    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBeUndefined();
    expect(views[0].attributes("text")).toBe("sales_rep.activity.my_activity.empty");
    // The all-activity link stays alongside the empty state.
    expect(wrapper.find("vc-link-stub").exists()).toBe(true);
  });

  // Defect 8: the widget's feed is mixed, so an empty one on a store whose analytics did not answer is
  // not a quiet year — it is a year with the tracked half missing.
  it("names the unavailable state rather than a quiet period", () => {
    state.analyticsUnavailable.value = true;

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBeUndefined(); // still not an error
    expect(views[0].attributes("text")).toBe("sales_rep.customer_insights.analytics_unavailable");
  });

  // The GA-backed query can run for seconds on a cold read — a blank card reads as broken.
  it("renders skeleton rows on first load, before any rows exist", () => {
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(wrapper.findAll(".my-activity__skeleton")).toHaveLength(5);
    expect(emptyViews(wrapper)).toHaveLength(0);
    expect(wrapper.find("activity-row-stub").exists()).toBe(false);
  });

  it("replaces the list with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [{ category: "orders", type: "orderPlaced" }];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(wrapper.find("activity-row-stub").exists()).toBe(false);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("renders a compact row per event plus the all-activity link", () => {
    state.items.value = [
      { category: "orders", type: "orderPlaced" },
      { category: "searches", type: "search" },
    ];

    const wrapper = createWrapper();

    expect(wrapper.findAll("activity-row-stub")).toHaveLength(2);
    expect(wrapper.find("vc-link-stub").exists()).toBe(true);
  });
});

describe("MyActivity wiring", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // Unbounded, every dashboard visit read the whole analytics history. Mid-October, so this month and this
  // year are different windows.
  it("reads this year only", () => {
    const now = new Date(2026, 9, 15, 12, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(now);

    createWrapper();

    const options = state.useSalesRepActivities.mock.calls.at(-1)?.[0] as {
      periodFrom: MaybeRefOrGetter<string | undefined>;
      periodTo: MaybeRefOrGetter<string | undefined>;
    };
    const { ytdFrom, ytdTo } = buildStatisticsWindows(now);
    expect(toValue(options.periodFrom)).toBe(ytdFrom);
    expect(toValue(options.periodTo)).toBe(ytdTo);
  });
});
