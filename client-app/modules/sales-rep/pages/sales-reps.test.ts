import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import SalesReps from "./sales-reps.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<Record<string, unknown>[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
    keyword: ref(""),
  };
});

vi.mock("../composables/useSalesReps", async () => {
  const { ref } = await import("vue");
  return {
    PAGE_SIZE: 10,
    useSalesReps: () => ({
      items: state.items,
      loading: state.loading,
      error: state.error,
      keyword: state.keyword,
      sort: ref({ column: "name", direction: "asc" }),
      page: ref(1),
      pages: ref(1),
    }),
  };
});

const createWrapper = createWrapperFactory(mount, SalesReps, {
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      VcTable: true,
      VcEmptyView: true,
      VcTypography: true,
      VcInput: true,
      VcButton: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");

beforeEach(() => {
  state.items.value = [];
  state.loading.value = false;
  state.error.value = null;
  state.keyword.value = "";
});

describe("SalesReps states", () => {
  it("shows the no-data view, not an error, when the response was simply empty", () => {
    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("empty");
  });

  // The query runs with keepPreviousResult, so rows survive a failed refetch and would otherwise be
  // presented as the current result.
  it("replaces the table with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [{ id: "r1", name: "Jane Doe", email: "jane@example.com", phone: "+1" }];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(wrapper.find("vc-table-stub").exists()).toBe(false);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  // With a keyword active the no-data view renders its search variant plus a "Reset search" button —
  // offering the customer a fix for a problem the search did not cause.
  it("shows the failure view rather than the search empty state when a keyword is active", () => {
    state.keyword.value = "jane";
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("shows the search empty state when a keyword matched nothing and no request failed", () => {
    state.keyword.value = "jane";

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("search");
  });
});
