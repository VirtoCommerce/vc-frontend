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

// The sub-view panels own their queries; here only their mount/visibility contract matters.
vi.mock("./customer-search-history.vue", () => ({
  default: {
    name: "CustomerSearchHistoryStub",
    props: ["organizationId"],
    template: '<div class="search-history-panel" />',
  },
}));
vi.mock("./customer-browse-history.vue", () => ({
  default: {
    name: "CustomerBrowseHistoryStub",
    props: ["organizationId"],
    template: '<div class="browse-history-panel" />',
  },
}));

function summaryFixture(
  overrides: Partial<SalesRepCustomerActivitySummaryType> = {},
): SalesRepCustomerActivitySummaryType {
  return {
    createdOn: "2024-01-05T00:00:00Z",
    lastWebLogin: "2026-08-20T10:00:00Z",
    visitsCount: 12,
    lastSearchTerm: "gloves",
    lastViewedProduct: { code: "SKU-1", productId: "p1", name: "Gloves", imageUrl: "" },
    isAnalyticsConfigured: true,
    ...overrides,
  };
}

// Slot-rendering stub: the product label lives in the link's slot, which a default stub would drop.
const VcLinkStub = { name: "VcLinkStub", props: ["to"], template: "<a><slot /></a>" };

// SalesRepRuleChips stays real — the sub-view tests below click its tabs.
const createWrapper = createWrapperFactory(mount, CustomerActivity, {
  props: { organizationId: "org1" },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="append" /><slot name="default-container" /></div>' },
      VcButton: true,
      VcEmptyView: true,
      VcIcon: true,
      VcLink: VcLinkStub,
      // Rendered, not stubbed away: the tracked-metric hint lives in its trigger slot.
      VcTooltip: { template: '<span><slot name="trigger" /></span>' },
    },
  },
});

// The chip row renders the baseline (Summary) first, then the declared rules in order.
const chips = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll(".sales-rep-rule-chips__tab");

beforeEach(() => {
  state.summary.value = undefined;
  state.loading.value = false;
  state.error.value = null;
});

describe("CustomerActivity summary states", () => {
  it("shows the failure view when the query failed", () => {
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = wrapper.findAll("vc-empty-view-stub");

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  // The GA-backed summary can run for seconds on a cold read — a blank card reads as broken.
  it("renders skeleton rows while the summary loads", () => {
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(wrapper.findAll(".customer-activity__skeleton")).toHaveLength(5);
    expect(wrapper.findAll("vc-empty-view-stub")).toHaveLength(0);
    expect(wrapper.findAll(".customer-activity__row")).toHaveLength(0);
  });

  it("renders every definition row when analytics is configured", () => {
    state.summary.value = summaryFixture();

    const wrapper = createWrapper();

    expect(wrapper.findAll(".customer-activity__row")).toHaveLength(5);
    expect(wrapper.find(".customer-activity__note").exists()).toBe(false);
    expect(wrapper.text()).toContain("SKU-1 · Gloves");
  });

  // Tracked figures appear late and load slowly, properties of the source rather than faults, so the
  // rows carrying them say so. Created on is a platform fact and carries no such mark.
  it("marks only the tracked rows", () => {
    state.summary.value = summaryFixture();

    const wrapper = createWrapper();

    expect(wrapper.findAll(".tracked-metric-hint")).toHaveLength(4);
    expect(wrapper.findAll(".customer-activity__row")[0].find(".tracked-metric-hint").exists()).toBe(false);

    // The summary is already on screen, so its hint speaks only of the delay: a load the reader has no
    // decision left to make about is noise, not a warning.
    expect(wrapper.findAll(".tracked-metric-hint vc-icon-stub").map((icon) => icon.attributes("label"))).toEqual(
      Array.from({ length: 4 }, () => "sales_rep.activity.tracked_hint"),
    );
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

  // By product id, never a slug: /product/{id} always resolves, whereas the tracked SEO segment alone
  // is not a valid catalog URL (VCST-5337).
  it("links the last viewed product by its id", () => {
    state.summary.value = summaryFixture();

    const productRow = createWrapper().findAll(".customer-activity__row")[4];

    expect(productRow.findComponent({ name: "VcLinkStub" }).props("to")).toEqual({
      name: "Product",
      params: { productId: "p1" },
    });
  });

  // An unresolvable product code still identifies the product by its code alone.
  it("renders the bare code, unlinked, when the product could not be resolved", () => {
    state.summary.value = summaryFixture({
      lastViewedProduct: { code: "GONE-1", productId: "", name: "", imageUrl: "" },
    });

    const wrapper = createWrapper();
    const productRow = wrapper.findAll(".customer-activity__row")[4];

    expect(productRow.text()).toContain("GONE-1");
    expect(productRow.findComponent({ name: "VcLinkStub" }).exists()).toBe(false);
  });
});

describe("CustomerActivity sub-views", () => {
  // Opening the profile must fire only the summary query — the panels' GA-backed queries wait for
  // their chip, which means the panels must not even mount (a mounted panel fetches).
  it("defaults to Summary with neither panel mounted", () => {
    state.summary.value = summaryFixture();

    const wrapper = createWrapper();

    expect(wrapper.find(".customer-activity__summary").isVisible()).toBe(true);
    expect(wrapper.find(".search-history-panel").exists()).toBe(false);
    expect(wrapper.find(".browse-history-panel").exists()).toBe(false);
  });

  it("mounts the Searches panel when its chip is selected, and hides the summary", async () => {
    state.summary.value = summaryFixture();

    const wrapper = createWrapper();
    await chips(wrapper)[1].trigger("click");

    expect(wrapper.find(".search-history-panel").isVisible()).toBe(true);
    expect(wrapper.find(".browse-history-panel").exists()).toBe(false);
    expect(wrapper.find(".customer-activity__summary").isVisible()).toBe(false);
    expect(wrapper.findComponent({ name: "CustomerSearchHistoryStub" }).props("organizationId")).toBe("org1");
  });

  it("mounts the Product views panel when its chip is selected", async () => {
    state.summary.value = summaryFixture();

    const wrapper = createWrapper();
    await chips(wrapper)[2].trigger("click");

    expect(wrapper.find(".browse-history-panel").isVisible()).toBe(true);
    expect(wrapper.find(".search-history-panel").exists()).toBe(false);
    expect(wrapper.findComponent({ name: "CustomerBrowseHistoryStub" }).props("organizationId")).toBe("org1");
  });

  // Returning to a visited view must not remount its panel — a remount refires the GA-backed query.
  it("keeps a visited panel mounted, hidden, when switching back to Summary", async () => {
    state.summary.value = summaryFixture();

    const wrapper = createWrapper();
    await chips(wrapper)[1].trigger("click");
    await chips(wrapper)[0].trigger("click");

    expect(wrapper.find(".customer-activity__summary").isVisible()).toBe(true);
    expect(wrapper.find(".search-history-panel").exists()).toBe(true);
    expect(wrapper.find(".search-history-panel").isVisible()).toBe(false);
  });
});
