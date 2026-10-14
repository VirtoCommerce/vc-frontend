import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, ref } from "vue";
import { provideBlockChrome } from "@/shared/dashboard";
import { VcTabSwitch } from "@/ui-kit/components/molecules";
import { facets as ordersPageFacets } from "../../composables/useUserOrders";
import OrdersTable from "../orders/orders-table.vue";
import RecentOrdersWidget from "./recent-orders-widget.vue";
import type { ILayoutBlockChromeType } from "@/shared/dashboard";

const getOrders = vi.hoisted(() => vi.fn());

vi.mock("@/core/api/graphql/orders/queries/getOrders", () => ({ getOrders }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US", currencyCode: "USD" } }));
vi.mock("@/core/utilities", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/utilities")>()),
  Logger: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getModuleSettings: () => ({}) }),
}));
vi.mock("../../composables/useOrderNavigation", () => ({
  useOrderNavigation: () => ({ goToOrderDetails: vi.fn() }),
}));
vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

const order = (id: string, status = "New") => ({ id, number: `CO-${id}`, status, createdDate: "2026-10-01" });

const STATUS_FACET = {
  name: "status",
  terms: [
    { term: "New", label: "New", count: 3 },
    { term: "Processing", label: "Processing", count: 1200 },
  ],
};

function response(items: unknown[], facets = [STATUS_FACET]) {
  return { totalCount: items.length, items, term_facets: facets };
}

/** The saved row cap a layout hands its blocks; `undefined` renders the widget outside any layout. */
const savedRows = ref<number | undefined>(undefined);

function chrome(): ILayoutBlockChromeType {
  return {
    draggable: computed(() => false),
    grabbed: computed(() => false),
    title: computed(() => "Recent orders"),
    hide: vi.fn(),
    handleKeydown: vi.fn(),
    handleBlur: vi.fn(),
    editing: computed(() => false),
    settings: computed(() => ({ maxRows: savedRows.value, hiddenTabs: [] })),
    savedSettings: computed(() => ({ maxRows: savedRows.value, hiddenTabs: [] })),
    maxRows: computed(() => undefined),
    updateSettings: vi.fn(),
  };
}

// As a layout block renders it: the block provides the chrome, the widget reads its saved row cap.
const InLayout = defineComponent({
  setup() {
    provideBlockChrome(chrome());
    return () => h(RecentOrdersWidget, { title: "Recent orders" });
  },
});

function mountWidget(inLayout = true) {
  return mount(inLayout ? InLayout : RecentOrdersWidget, {
    global: {
      // The real tab switch: the chosen chip lives in its markup.
      components: { VcTabSwitch },
      stubs: {
        VcWidget: { template: '<div class="widget"><slot name="append" /><slot name="default-container" /></div>' },
        VcEmptyView: {
          props: ["text", "variant", "icon"],
          template: '<div class="empty-view" :data-variant="variant">{{ text }}<slot name="button" /></div>',
        },
        OrdersTable: true,
        VcLink: true,
        VcIcon: true,
        VcButton: { template: '<button class="cta"><slot /></button>' },
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

// [label, count] per chip; the baseline chip has no count.
const chips = (wrapper: ReturnType<typeof mountWidget>) =>
  wrapper.findAll(".recent-orders-widget__filter .vc-tab-switch button").map((chip) => {
    const count = chip.find(".recent-orders-widget__count");
    return [chip.find(".recent-orders-widget__label").text(), count.exists() ? count.text() : undefined];
  });

beforeEach(() => {
  savedRows.value = 5;
  getOrders.mockReset().mockResolvedValue(response([order("1"), order("2", "Processing")]));
  ordersPageFacets.value = undefined;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("RecentOrdersWidget", () => {
  it("lists the user's orders newest first, faceted by status, as many as the saved row cap", async () => {
    savedRows.value = 3;

    const wrapper = mountWidget();
    await flushPromises();

    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(getOrders).toHaveBeenCalledWith({ first: 3, sort: "createdDate:desc", filter: "", facet: "status" });
    expect(wrapper.findComponent(OrdersTable).props()).toMatchObject({
      orders: [order("1"), order("2", "Processing")],
      orderScope: "private",
      loading: false,
    });
  });

  it("shows five outside a layout", async () => {
    mountWidget(false);
    await flushPromises();

    expect(getOrders).toHaveBeenCalledWith(expect.objectContaining({ first: 5 }));
  });

  // The cap is a query variable, applied when the layout is saved — a saved change refetches.
  it("follows a newly saved row cap", async () => {
    mountWidget();
    await flushPromises();

    savedRows.value = 10;
    await flushPromises();

    expect(getOrders).toHaveBeenLastCalledWith(expect.objectContaining({ first: 10 }));
  });

  it("offers a chip per status the orders carry, after the baseline, with grouped counts", async () => {
    const wrapper = mountWidget();
    await flushPromises();

    expect(chips(wrapper)).toEqual([
      ["shared.account.dashboard.recent_orders.filter_all", undefined],
      ["New", "3"],
      ["Processing", "1,200"],
    ]);
  });

  // Driven by the widget's own selection rather than the kit's `--checked` class, which is not ours to select.
  it("accents the count of the chosen chip only", async () => {
    const wrapper = mountWidget();
    await flushPromises();
    expect(wrapper.find(".recent-orders-widget__count--checked").exists()).toBe(false);

    await wrapper.findAll(".recent-orders-widget__filter .vc-tab-switch button")[2].trigger("click");
    await flushPromises();

    const accented = wrapper.findAll(".recent-orders-widget__count--checked");
    expect(accented.map((count) => count.text())).toEqual(["1,200"]);
  });

  it("offers no chips while the orders carry no status", async () => {
    getOrders.mockResolvedValue(response([], []));

    const wrapper = mountWidget();
    await flushPromises();

    expect(wrapper.find(".recent-orders-widget__filter").exists()).toBe(false);
  });

  it("lists only the chosen status, and every status again from the baseline chip", async () => {
    const wrapper = mountWidget();
    await flushPromises();

    await wrapper.findAll(".recent-orders-widget__filter .vc-tab-switch button")[2].trigger("click");
    await flushPromises();
    expect(getOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({ filter: 'status:"Processing"', facet: "status" }),
    );

    await wrapper.findAll(".recent-orders-widget__filter .vc-tab-switch button")[0].trigger("click");
    await flushPromises();
    expect(getOrders).toHaveBeenLastCalledWith(expect.objectContaining({ filter: "" }));
  });

  // A user who never ordered gets the way to the catalog, as the dashboard always offered.
  it("invites a user with no orders to shop", async () => {
    getOrders.mockResolvedValue(response([], []));

    const wrapper = mountWidget();
    await flushPromises();

    expect(wrapper.find(".empty-view").text()).toContain("shared.account.dashboard.recent_orders.empty");
    expect(wrapper.find(".empty-view .cta").exists()).toBe(true);
    expect(wrapper.findComponent(OrdersTable).exists()).toBe(false);
  });

  // With a status chosen, nothing found means "none in this status", not "never ordered".
  it("says when the chosen status has no orders", async () => {
    const wrapper = mountWidget();
    await flushPromises();
    getOrders.mockResolvedValue(response([]));

    await wrapper.findAll(".recent-orders-widget__filter .vc-tab-switch button")[1].trigger("click");
    await flushPromises();

    expect(wrapper.find(".empty-view").text()).toBe("shared.account.dashboard.recent_orders.no_results");
    expect(wrapper.find(".empty-view .cta").exists()).toBe(false);
  });

  it("replaces the list with an error when the orders cannot be read", async () => {
    getOrders.mockRejectedValue(new Error("network"));

    const wrapper = mountWidget();
    await flushPromises();

    expect(wrapper.find(".empty-view").attributes("data-variant")).toBe("error");
    expect(wrapper.find(".empty-view").text()).toBe("shared.account.dashboard.recent_orders.load_failed");
    expect(wrapper.findComponent(OrdersTable).exists()).toBe(false);
  });

  // A chip clicked while the previous list is still loading must not be overwritten when that list lands late.
  it("keeps the latest request's orders when an earlier one answers last", async () => {
    let answerFirst: (value: unknown) => void = () => {};
    getOrders.mockReset();
    getOrders.mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)));
    getOrders.mockResolvedValue(response([order("9", "Processing")]));

    const wrapper = mountWidget();
    savedRows.value = 7;
    await flushPromises();

    answerFirst(response([order("1")]));
    await flushPromises();

    expect(wrapper.findComponent(OrdersTable).props("orders")).toEqual([order("9", "Processing")]);
  });

  // The Orders page keeps its facets module-global (useUserOrders); a dashboard widget writing there would leak its
  // statuses into that page's filter.
  it("leaves the Orders page's facet state alone", async () => {
    mountWidget();
    await flushPromises();

    expect(ordersPageFacets.value).toBeUndefined();
  });
});
