import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import CompareTable from "./compare-table.vue";
import type { ICompareDisplayProduct, ICompareTableRow } from "../types";
import type { DOMWrapper } from "@vue/test-utils";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/core/composables", () => ({
  useBrowserTarget: () => ({ browserTarget: { value: "_blank" } }),
}));

const tableRows: { value: ICompareTableRow[] } = { value: [] };

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
    unpinnedRows: tableRows,
  }),
}));

// isCompact derives from useElementBounding's anchor top (and useElementSize's header row height)
// against useCssVar's app header height — real layout reads jsdom can't produce. Mocked as one shared, real ref so tests can flip
// isCompact deterministically (and reactively — a live watch on it is what's under test) just by
// moving headerRowAnchorTop below/above the (fixed at 0) header height.
vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  const { ref: vueRef } = await import("vue");
  const headerRowAnchorTop = vueRef(100); // > appHeaderHeight (0) + 1, i.e. not compact by default
  const headerRowHeight = vueRef(0);
  const isMobile = vueRef(false);

  return {
    ...actual,
    useBreakpoints: () => ({ smaller: () => isMobile }),
    useElementBounding: () => ({ top: headerRowAnchorTop, update: vi.fn() }),
    useElementSize: () => ({ width: vueRef(0), height: headerRowHeight }),
    useCssVar: () => vueRef("0"),
    __headerRowAnchorTop: headerRowAnchorTop,
    __headerRowHeight: headerRowHeight,
    __isMobile: isMobile,
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
  await setHeaderRowAnchorTop(compact ? 0 : 100);
}

async function vueuseMock() {
  return (await import("@vueuse/core")) as unknown as {
    __headerRowAnchorTop: { value: number };
    __headerRowHeight: { value: number };
    __isMobile: { value: boolean };
  };
}

async function setHeaderRowAnchorTop(top: number) {
  (await vueuseMock()).__headerRowAnchorTop.value = top;
}

async function setHeaderRowHeight(height: number) {
  (await vueuseMock()).__headerRowHeight.value = height;
}

function row(key: string, values: string[]): ICompareTableRow {
  return { key, label: `Label ${key}`, kind: "text", values, differs: false };
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
        VcTooltip: { template: "<span><slot name='trigger' /></span>" },
        VcIcon: true,
        InStock: true,
      },
    },
  });
}

async function setMobile(mobile: boolean) {
  (await vueuseMock()).__isMobile.value = mobile;
}

// jsdom lays nothing out, so scrollHeight is 0 unless a test gives the page room to scroll.
function setRoomBelow(room: number) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: window.innerHeight + window.scrollY + room,
  });
}

beforeEach(() => {
  setRoomBelow(10_000);
});

afterEach(async () => {
  await setCompact(false);
  await setHeaderRowHeight(0);
  await setMobile(false);
  tableRows.value = [];
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

    // The button is teleported alongside the tabs, gated by v-if="mobileTabsBarRef" — null on the
    // first render, so it only appears once that ref populates and triggers a second render pass.
    await nextTick();

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

describe("CompareTable — table semantics", () => {
  function cellRole(cell: DOMWrapper<Element>) {
    if (cell.element.tagName === "TD") {
      return "cell";
    }

    const scope = cell.attributes("scope");

    if (scope === "col") {
      return "columnheader";
    }

    return scope === "row" ? "rowheader" : `th[scope=${scope}]`;
  }

  function rowsOf(wrapper: ReturnType<typeof mountTable>) {
    const tables = wrapper.findAll("table");
    expect(tables).toHaveLength(1);

    return tables[0]
      .findAll("tr")
      .map((rowWrapper) =>
        rowWrapper
          .findAll("td, th")
          .map((cell) => [cellRole(cell), cell.element.tagName === "TH" ? cell.attributes("aria-label") : cell.text()]),
      );
  }

  it("puts the product header row and every attribute row in one table, column for column", async () => {
    tableRows.value = [row("sku", ["SKU-1", "SKU-2"]), row("color", ["Red", "Blue"])];
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });
    await nextTick();

    expect(wrapper.get("table").attributes("aria-label")).toBe("pages.compare.title");
    expect(rowsOf(wrapper)).toEqual([
      [
        ["cell", expect.stringContaining("shared.compare.table.tabs.all")],
        ["columnheader", "Product p1"],
        ["columnheader", "Product p2"],
      ],
      [
        ["rowheader", "Label sku"],
        ["cell", "SKU-1"],
        ["cell", "SKU-2"],
      ],
      [
        ["rowheader", "Label color"],
        ["cell", "Red"],
        ["cell", "Blue"],
      ],
    ]);

    wrapper.unmount();
  });

  it("keeps the product columns once the header row turns compact", async () => {
    tableRows.value = [row("sku", ["SKU-1", "SKU-2"])];
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });
    await nextTick();

    await setCompact(true);
    await nextTick();

    expect(wrapper.findAll(".compare-table__product--compact")).toHaveLength(2);
    expect(rowsOf(wrapper)[0]).toEqual([
      ["cell", expect.any(String)],
      ["columnheader", "Product p1"],
      ["columnheader", "Product p2"],
    ]);

    wrapper.unmount();
  });

  it("keeps the corner cell, and the tabs out of the table, on mobile", async () => {
    await setMobile(true);
    tableRows.value = [row("sku", ["SKU-1", "SKU-2"])];
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });
    await nextTick();

    const table = wrapper.get("table");
    expect(table.find(".compare-table__tabs").exists()).toBe(false);
    expect(wrapper.find(".compare-table__mobile-tabs-bar .compare-table__tabs").exists()).toBe(true);
    expect(rowsOf(wrapper)).toEqual([
      [
        ["cell", ""],
        ["columnheader", "Product p1"],
        ["columnheader", "Product p2"],
      ],
      [
        ["rowheader", "Label sku"],
        ["cell", "SKU-1"],
        ["cell", "SKU-2"],
      ],
    ]);

    wrapper.unmount();
  });

  it("scrolls the header row along with the body", async () => {
    tableRows.value = [row("sku", ["SKU-1", "SKU-2"])];
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });
    await nextTick();

    const body = wrapper.get("tbody").element;
    body.scrollLeft = 120;
    body.dispatchEvent(new Event("scroll"));

    expect(wrapper.get("thead").element.scrollLeft).toBe(120);

    wrapper.unmount();
  });

  it("describes a row header by its description, and only when it has one", async () => {
    tableRows.value = [{ ...row("price", ["$1", "$2"]), description: "Price, excl. VAT" }, row("sku", ["A", "B"])];
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });
    await nextTick();

    const [priceHeader, skuHeader] = wrapper.findAll("th[scope=row]");
    const describedBy = priceHeader.attributes("aria-describedby");

    expect(priceHeader.attributes("aria-label")).toBe("Label price");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`[id="${describedBy}"]`).attributes("label")).toBe("Price, excl. VAT");
    expect(skuHeader.attributes("aria-describedby")).toBeUndefined();

    wrapper.unmount();
  });
});

describe("CompareTable — selectItem", () => {
  function configuration(localId: string): ICompareDisplayProduct {
    const item = product("p1");
    return { ...item, entry: { ...item.entry, localId } };
  }

  it.each([false, true])("emits the clicked column's position, compact: %s", async (compact) => {
    await setCompact(compact);
    const products = [configuration("config-a"), configuration("config-b")];
    const wrapper = mountTable({ products });
    await nextTick();

    wrapper.findAllComponents({ name: "VcProductTitle" })[1].vm.$emit("click");

    expect(wrapper.emitted("selectItem")).toEqual([[products[1].product, 1]]);

    wrapper.unmount();
  });
});

describe("CompareTable — compact threshold", () => {
  const FULL_HEIGHT = 300;

  it("keeps the full header row when the page has too little room below to absorb compacting", async () => {
    setRoomBelow(FULL_HEIGHT - 1);
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });
    await setHeaderRowHeight(FULL_HEIGHT);
    await nextTick();

    await setCompact(true);
    await nextTick();

    expect(wrapper.findAll(".compare-table__product--compact")).toHaveLength(0);

    wrapper.unmount();
  });

  it("stays compact once the page shrinks under the scroll, and leaves it as soon as the row unsticks", async () => {
    setRoomBelow(FULL_HEIGHT);
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });
    await setHeaderRowHeight(FULL_HEIGHT);
    await nextTick();

    await setCompact(true);
    await nextTick();
    expect(wrapper.findAll(".compare-table__product--compact")).toHaveLength(2);

    setRoomBelow(0);
    await setHeaderRowAnchorTop(1);
    await nextTick();
    expect(wrapper.findAll(".compare-table__product--compact")).toHaveLength(2);

    await setHeaderRowAnchorTop(2);
    await nextTick();
    expect(wrapper.findAll(".compare-table__product--compact")).toHaveLength(0);

    wrapper.unmount();
  });

  it("needs only the room the compact row actually frees once its height is measured", async () => {
    const COMPACT_HEIGHT = 100;
    const wrapper = mountTable({ products: [product("p1"), product("p2")] });
    await setHeaderRowHeight(FULL_HEIGHT);
    await nextTick();

    await setCompact(true);
    await nextTick();
    await setHeaderRowHeight(COMPACT_HEIGHT);
    await nextTick();
    await setCompact(false);
    await nextTick();
    await setHeaderRowHeight(FULL_HEIGHT);
    await nextTick();

    setRoomBelow(FULL_HEIGHT - COMPACT_HEIGHT);
    await setCompact(true);
    await nextTick();

    expect(wrapper.findAll(".compare-table__product--compact")).toHaveLength(2);

    wrapper.unmount();
  });
});
