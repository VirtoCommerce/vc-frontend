import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import CustomerBrowseHistory from "./customer-browse-history.vue";

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

vi.mock("../composables/useSalesRepBrowseHistory", () => ({
  useSalesRepBrowseHistory: () => ({ ...state }),
}));
vi.mock("../composables/useSalesRepPeriodFilter", async () => {
  const { ref } = await import("vue");
  return { useSalesRepPeriodFilter: () => ({ from: ref(undefined), to: ref(undefined) }) };
});

const createWrapper = createWrapperFactory(mount, CustomerBrowseHistory, {
  props: { organizationId: "org-1" },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      // LayoutWidget's drag controls: never rendered here, but the compiler resolves them anyway.
      VcButton: true,
      VcEmptyView: true,
      VcIcon: true,
      VcImage: true,
      VcLink: { template: "<a><slot /></a>" },
      SalesRepRuleChips: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");
const rows = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll(".customer-browse-history__row");

beforeEach(() => {
  state.items.value = [];
  state.notConfigured.value = false;
  state.dataAsOf.value = undefined;
  state.loading.value = false;
  state.error.value = null;
});

describe("CustomerBrowseHistory states", () => {
  it("shows the no-data view, not an error, when nothing was tracked", () => {
    const views = emptyViews(createWrapper());

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBeUndefined();
    expect(views[0].attributes("text")).toBe("sales_rep.customer_insights.browse_history.empty");
  });

  it("names the not-configured state distinctly from the empty one", () => {
    state.notConfigured.value = true;

    const views = emptyViews(createWrapper());

    expect(views).toHaveLength(1);
    expect(views[0].attributes("text")).toBe("sales_rep.customer_insights.not_configured");
  });

  it("replaces the list with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [{ productId: "p1", name: "Drill", sku: "", imageUrl: "", viewCount: 2 }];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(rows(wrapper)).toHaveLength(0);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("keeps the list while a retry is in flight rather than flashing the failure view", () => {
    state.items.value = [{ productId: "p1", name: "Drill", sku: "", imageUrl: "", viewCount: 2 }];
    state.error.value = new Error("boom");
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(emptyViews(wrapper)).toHaveLength(0);
    expect(rows(wrapper)).toHaveLength(1);
  });

  // GA stores the product code, not the id; only a backend-resolved row (it has a slug) may deep-link —
  // an unresolved one would 404, so it degrades to plain text (design doc §5.1).
  it("links a row only when the backend resolved the product", () => {
    state.items.value = [
      { productId: "p1", name: "Drill", sku: "SKU-1", imageUrl: "", slug: "drill", viewCount: 4 },
      { productId: "CODE-2", name: "Mystery", sku: "", imageUrl: "", viewCount: 1 },
    ];

    const wrapper = createWrapper();
    const [resolved, unresolved] = rows(wrapper);

    expect(resolved.find("a").exists()).toBe(true);
    expect(unresolved.find("a").exists()).toBe(false);
    expect(unresolved.text()).toContain("Mystery");
  });
});
