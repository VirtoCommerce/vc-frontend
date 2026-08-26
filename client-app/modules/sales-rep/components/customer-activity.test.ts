import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import CustomerActivity from "./customer-activity.vue";
import type { SalesRepCustomerActivitySummaryType } from "../types";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    summary: ref<SalesRepCustomerActivitySummaryType | undefined>(undefined),
    loading: ref(false),
    error: ref<Error | null>(null),
  };
});

vi.mock("../composables/useSalesRepCustomerActivitySummary", () => ({
  useSalesRepCustomerActivitySummary: () => ({
    summary: state.summary,
    loading: state.loading,
    error: state.error,
  }),
}));

function summaryFixture(
  overrides: Partial<SalesRepCustomerActivitySummaryType> = {},
): SalesRepCustomerActivitySummaryType {
  return {
    createdOn: "2024-01-05T00:00:00Z",
    lastWebLogin: "2026-08-20T10:00:00Z",
    visitsCount: 12,
    lastSearchTerm: "gloves",
    lastViewedProduct: { code: "SKU-1", productId: "p1", name: "Gloves", slug: "gloves", imageUrl: "" },
    isAnalyticsConfigured: true,
    ...overrides,
  };
}

// Slot-rendering stub: the product label lives in the link's slot, which a default stub would drop.
const VcLinkStub = { name: "VcLinkStub", props: ["to"], template: "<a><slot /></a>" };

const createWrapper = createWrapperFactory(mount, CustomerActivity, {
  props: { organizationId: "org1" },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="append" /><slot /></div>' },
      VcButton: true,
      VcEmptyView: true,
      VcIcon: true,
      VcLink: VcLinkStub,
    },
  },
});

beforeEach(() => {
  state.summary.value = undefined;
  state.loading.value = false;
  state.error.value = null;
});

describe("CustomerActivity states", () => {
  it("shows the failure view when the query failed", () => {
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = wrapper.findAll("vc-empty-view-stub");

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("renders every definition row when analytics is configured", () => {
    state.summary.value = summaryFixture();

    const wrapper = createWrapper();

    expect(wrapper.findAll(".customer-activity__row")).toHaveLength(5);
    expect(wrapper.find(".customer-activity__note").exists()).toBe(false);
    expect(wrapper.text()).toContain("SKU-1 · Gloves");
  });

  // Unconfigured analytics is a distinct state, not an error and not fake zeros: the GA-sourced rows
  // give way to the note while Created on (a DB fact) keeps rendering.
  it("shows created-on plus the not-configured note when analytics is off", () => {
    state.summary.value = summaryFixture({
      isAnalyticsConfigured: false,
      lastWebLogin: undefined,
      visitsCount: 0,
      lastSearchTerm: "",
      lastViewedProduct: undefined,
    });

    const wrapper = createWrapper();

    expect(wrapper.findAll(".customer-activity__row")).toHaveLength(1);
    expect(wrapper.find(".customer-activity__note").exists()).toBe(true);
  });

  // An unresolvable product code still identifies the product by its code alone.
  it("renders the bare code, unlinked, when the product could not be resolved", () => {
    state.summary.value = summaryFixture({
      lastViewedProduct: { code: "GONE-1", productId: "", name: "", slug: "", imageUrl: "" },
    });

    const wrapper = createWrapper();
    const productRow = wrapper.findAll(".customer-activity__row")[4];

    expect(productRow.text()).toContain("GONE-1");
    expect(productRow.findComponent({ name: "VcLinkStub" }).exists()).toBe(false);
  });
});
