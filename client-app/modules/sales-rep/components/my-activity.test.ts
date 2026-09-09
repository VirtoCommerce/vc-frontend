import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import MyActivity from "./my-activity.vue";
import type { SalesRepActivityItemType } from "../types";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<Partial<SalesRepActivityItemType>[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
  };
});

vi.mock("../composables/useSalesRepActivities", () => ({
  useSalesRepActivities: () => ({ items: state.items, loading: state.loading, error: state.error }),
}));

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
  state.loading.value = false;
  state.error.value = null;
});

describe("MyActivity states", () => {
  // Analytics absence arrives as zero rows by contract, so the quiet view is the no-data one, not an error.
  it("shows the no-data view, not an error, when there is no recent activity", () => {
    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBeUndefined();
    expect(views[0].attributes("text")).toBe("sales_rep.activity.empty_period");
    // The all-activity link stays alongside the empty state.
    expect(wrapper.find("vc-link-stub").exists()).toBe(true);
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
