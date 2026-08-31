import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import CompareTable from "./compare-table.vue";
import type { ICompareDisplayProduct } from "../types";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/core/composables", () => ({
  useBrowserTarget: () => ({ browserTarget: { value: "_blank" } }),
}));

vi.mock("../composables", () => ({
  useCompareAddToCart: () => ({
    isAddingToCart: () => false,
    isAddToCartDisabled: () => false,
    onAddToCart: vi.fn(),
  }),
  useCompareTableRowPins: () => ({
    isRowPinned: () => false,
    togglePin: vi.fn(),
    pinnedRows: { value: [] },
    unpinnedRows: { value: [] },
  }),
}));

// isCompact derives from useElementBounding's headerRowTop against useCssVar's app header height —
// both real layout reads jsdom can't produce. Mocked as one shared, real ref so tests can flip
// isCompact deterministically (and reactively — a live watch on it is what's under test) just by
// moving headerRowTop below/above the (fixed at 0) header height.
vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  const { ref: vueRef } = await import("vue");
  const headerRowTop = vueRef(100); // > appHeaderHeight (0) + 1, i.e. not compact by default

  return {
    ...actual,
    useBreakpoints: () => ({ smaller: () => vueRef(false) }),
    useElementBounding: () => ({ top: headerRowTop, update: vi.fn() }),
    useCssVar: () => vueRef("0"),
    __headerRowTop: headerRowTop,
  };
});

const VcWidgetStub = defineComponent({
  name: "VcWidget",

  setup(_, { slots }) {
    return () => h("div", slots["default-container"]?.());
  },
});

const VcButtonStub = defineComponent({
  name: "VcButton",
  emits: { click: () => true },

  setup(_, { emit, slots }) {
    return () => h("button", { type: "button", onClick: () => emit("click") }, slots.default?.());
  },
});

const VcTabSwitchStub = defineComponent({
  name: "VcTabSwitch",
  props: { value: { type: null, default: undefined }, label: { type: String, default: "" } },
  emits: { change: (value: unknown) => value !== undefined },

  setup(props, { emit }) {
    return () => h("button", { type: "button", onClick: () => emit("change", props.value) }, props.label);
  },
});

const VcProductActionsButtonStub = defineComponent({
  name: "VcProductActionsButton",
  emits: { click: () => true },

  setup(_, { emit }) {
    return () => h("button", { type: "button", onClick: () => emit("click") }, "remove");
  },
});

function product(id: string): ICompareDisplayProduct {
  return {
    product: {
      id,
      name: `Product ${id}`,
      isConfigurable: false,
      hasVariations: false,
    } as ICompareDisplayProduct["product"],
    entry: { productId: id, categoryKey: "cat-a" },
  };
}

async function setCompact(compact: boolean) {
  const vueuseCore = (await import("@vueuse/core")) as unknown as { __headerRowTop: { value: number } };
  vueuseCore.__headerRowTop.value = compact ? 0 : 100;
}

function mountTable(props: { products?: ICompareDisplayProduct[] } = {}) {
  // attachTo: real DOM connection is what document.activeElement tracks — a detached mount (the
  // default) makes every .focus() in this file a silent no-op.
  return mount(CompareTable, {
    attachTo: document.body,
    props: { products: props.products ?? [], rows: [], differCount: 0, totalRows: 0 },
    global: {
      stubs: {
        VcWidget: VcWidgetStub,
        VcButton: VcButtonStub,
        VcTabSwitch: VcTabSwitchStub,
        VcProductActionsButton: VcProductActionsButtonStub,
        VcProductActions: { template: "<div><slot /></div>" },
        VcImage: true,
        VcProductTitle: true,
        VcProductPrice: true,
        VcRating: true,
        VcTooltip: true,
        VcIcon: true,
        InStock: true,
      },
    },
  });
}

afterEach(async () => {
  await setCompact(false);
});

describe("CompareTable — focus management", () => {
  it("does not steal focus on an isCompact flip when the previously focused control survives it (e.g. an All/Differences tab)", async () => {
    await setCompact(false);
    // 2 products, not 0 — the tabs are disabled (and so unfocusable) at 1 or fewer.
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });

    // The tabs are teleported, gated by v-if="mobileTabsBarRef" — null on the first render, so
    // they only appear once that ref populates and triggers a second render pass.
    await nextTick();

    const tabButton = wrapper.get(".compare-table__tab").element as HTMLElement;
    tabButton.focus();
    expect(document.activeElement).toBe(tabButton);

    await setCompact(true);
    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(tabButton);
    wrapper.unmount();
  });

  it("moves focus to the header row when the focused control is destroyed by an isCompact flip (e.g. Clear category disappearing)", async () => {
    await setCompact(false);
    const wrapper = mountTable();

    const clearCategoryButton = wrapper.get(".compare-table__clear-category").element as HTMLElement;
    clearCategoryButton.focus();
    expect(document.activeElement).toBe(clearCategoryButton);

    await setCompact(true);
    await nextTick();
    await nextTick();

    expect(clearCategoryButton.isConnected).toBe(false);
    expect(document.activeElement).toBe(wrapper.get(".compare-table__header-row").element);
    wrapper.unmount();
  });

  it("moves focus to the header row once a product is removed, since removing it can destroy whatever held focus", async () => {
    await setCompact(false);
    const wrapper = mountTable({ products: [product("p1")] });

    await wrapper.get(".compare-table__product-remove button").trigger("click");
    expect(wrapper.emitted("removeProduct")).toEqual([[product("p1")]]);

    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(wrapper.get(".compare-table__header-row").element);
    wrapper.unmount();
  });
});
