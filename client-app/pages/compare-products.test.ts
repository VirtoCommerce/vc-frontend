import { cleanup, configure, fireEvent, render } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CompareProducts from "./compare-products.vue";
import type { ICompareCategoryTab, ICompareDisplayProduct } from "@/shared/compare";
import "@testing-library/jest-dom/vitest";

configure({ testIdAttribute: "data-test-id" });

const mocks = await vi.hoisted(async () => {
  const { ref, defineComponent: define, h: createElement } = await import("vue");

  const compareTableSpy = {
    props: {} as Record<string, unknown>,
    emit: undefined as undefined | ((event: string, payload?: unknown) => void),
  };

  const CompareTable = define({
    props: {
      products: { type: Array, default: () => [] },
      rows: { type: Array, default: () => [] },
      differCount: { type: Number, default: 0 },
      totalRows: { type: Number, default: 0 },
    },
    emits: ["clearCategory", "removeProduct", "selectItem"],
    setup(props, { emit }) {
      compareTableSpy.emit = (event, payload) => emit(event as never, payload);
      return () => {
        compareTableSpy.props = { ...props };
        return createElement("div", { "data-test-id": "compare-table" });
      };
    },
  });

  return {
    products: ref<{ productId: string; categoryKey: string }[]>([]),
    productsLimit: 5,
    removeFromCompareList: vi.fn(),
    clearCompareList: vi.fn(),
    clearCategory: vi.fn(),
    restoreProducts: vi.fn(),
    canRestoreProducts: ref(false),
    categoryTabs: ref<ICompareCategoryTab[]>([]),
    selectedCategoryKey: ref(""),
    selectedCategoryLabel: ref(""),
    selectedCategoryCount: ref(0),
    selectedCategoryProducts: ref<ICompareDisplayProduct[]>([]),
    tableRows: ref<unknown[]>([]),
    differRowsCount: ref(0),
    fetchingProducts: ref(false),
    selectCategory: vi.fn(),
    selectItemEvent: vi.fn(),
    openModal: vi.fn(),
    closeModal: vi.fn(),
    compareTableSpy,
    CompareTable,
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
  }),
}));

vi.mock("@/core/composables", () => ({
  useBreadcrumbs: () => ({ value: [] }),
  usePageHead: () => {},
}));

vi.mock("@/shared/modal", () => ({
  useModal: () => ({ openModal: mocks.openModal, closeModal: mocks.closeModal }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getModuleSettings: () => ({}) }),
}));

vi.mock("@/shared/compare", () => ({
  CompareTable: mocks.CompareTable,
  useCompareProducts: () => ({
    products: mocks.products,
    productsLimit: mocks.productsLimit,
    removeFromCompareList: mocks.removeFromCompareList,
    clearCompareList: mocks.clearCompareList,
    clearCategory: mocks.clearCategory,
    restoreProducts: mocks.restoreProducts,
    canRestoreProducts: mocks.canRestoreProducts,
  }),
  useCompareProductsPage: () => ({
    categoryTabs: mocks.categoryTabs,
    selectedCategoryKey: mocks.selectedCategoryKey,
    selectedCategoryLabel: mocks.selectedCategoryLabel,
    selectedCategoryCount: mocks.selectedCategoryCount,
    selectedCategoryProducts: mocks.selectedCategoryProducts,
    tableRows: mocks.tableRows,
    differRowsCount: mocks.differRowsCount,
    fetchingProducts: mocks.fetchingProducts,
    selectCategory: mocks.selectCategory,
    selectItemEvent: mocks.selectItemEvent,
  }),
}));

function renderPage() {
  return render(CompareProducts, {
    global: {
      stubs: {
        VcContainer: { template: "<div><slot /></div>" },
        VcBreadcrumbs: true,
        VcTypography: { template: "<div><slot /></div>" },
        VcWidget: { template: "<div><slot /></div>" },
        VcEmptyView: { template: '<div><slot name="icon" /><slot /><slot name="button" /></div>' },
        VcIcon: true,
        VcLoaderOverlay: true,
        VcBadge: { template: "<span><slot /></span>" },
        VcButton: {
          props: ["disabled", "variant"],
          emits: ["click"],
          template: '<button :disabled="disabled" :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  });
}

function product(id: string): ICompareDisplayProduct {
  return {
    product: { id, name: `Product ${id}` } as ICompareDisplayProduct["product"],
    entry: { productId: id, categoryKey: "cat-a" },
  };
}

beforeEach(() => {
  mocks.products.value = [];
  mocks.canRestoreProducts.value = false;
  mocks.categoryTabs.value = [];
  mocks.selectedCategoryKey.value = "";
  mocks.selectedCategoryLabel.value = "";
  mocks.selectedCategoryCount.value = 0;
  mocks.selectedCategoryProducts.value = [];
  mocks.tableRows.value = [];
  mocks.differRowsCount.value = 0;
  mocks.fetchingProducts.value = false;
  mocks.compareTableSpy.props = {};
  mocks.compareTableSpy.emit = undefined;
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("CompareProducts", () => {
  it("shows the empty state and hides the table when the compare list is empty", () => {
    mocks.products.value = [];

    const page = renderPage();

    expect(page.getByText("pages.compare.empty.title")).toBeInTheDocument();
    expect(page.queryByTestId("compare-table")).not.toBeInTheDocument();
  });

  it("shows a loading state instead of the table while products are being fetched", () => {
    mocks.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
    mocks.fetchingProducts.value = true;

    const page = renderPage();

    expect(page.queryByTestId("compare-table")).not.toBeInTheDocument();
    expect(page.queryByText("pages.compare.empty.title")).not.toBeInTheDocument();
  });

  it("renders a tab per category and passes the selected category's data down to CompareTable", () => {
    mocks.products.value = [
      { productId: "p1", categoryKey: "cat-a" },
      { productId: "p2", categoryKey: "cat-b" },
    ];
    mocks.categoryTabs.value = [
      { categoryKey: "cat-a", label: "Category A", count: 1 },
      { categoryKey: "cat-b", label: "Category B", count: 1 },
    ];
    mocks.selectedCategoryKey.value = "cat-b";
    mocks.selectedCategoryProducts.value = [product("p2")];

    const page = renderPage();

    expect(page.getByText("Category A")).toBeInTheDocument();
    expect(page.getByText("Category B")).toBeInTheDocument();
    expect(mocks.compareTableSpy.props.products).toEqual([product("p2")]);
  });

  it("clicking a category tab calls selectCategory with that tab's key", async () => {
    mocks.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
    mocks.categoryTabs.value = [
      { categoryKey: "cat-a", label: "Category A", count: 1 },
      { categoryKey: "cat-b", label: "Category B", count: 1 },
    ];
    mocks.selectedCategoryKey.value = "cat-a";

    const page = renderPage();
    await fireEvent.click(page.getByText("Category B"));

    expect(mocks.selectCategory).toHaveBeenCalledWith("cat-b");
  });

  it("disables Clear all while the list is empty, and enables it once it has products", () => {
    mocks.products.value = [];
    const emptyPage = renderPage();
    const clearAllWhenEmpty = emptyPage.getByText("pages.compare.actions.clear_all").closest("button");
    expect(clearAllWhenEmpty).toBeDisabled();
    cleanup();

    mocks.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
    const filledPage = renderPage();
    const clearAllWithProducts = filledPage.getByText("pages.compare.actions.clear_all").closest("button");
    expect(clearAllWithProducts).not.toBeDisabled();
  });

  it("Clear all opens a confirmation modal whose confirm handler clears the whole list", async () => {
    mocks.products.value = [
      { productId: "p1", categoryKey: "cat-a" },
      { productId: "p2", categoryKey: "cat-b" },
    ];

    const page = renderPage();
    await fireEvent.click(page.getByText("pages.compare.actions.clear_all"));

    expect(mocks.openModal).toHaveBeenCalledTimes(1);
    const options = mocks.openModal.mock.calls[0][0];
    options.props.onConfirm();

    expect(mocks.clearCompareList).toHaveBeenCalledTimes(1);
    expect(mocks.closeModal).toHaveBeenCalledTimes(1);
  });

  it("forwards CompareTable's remove-product event to removeFromCompareList with the entry's configuration", () => {
    mocks.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
    renderPage();

    const item: ICompareDisplayProduct = {
      product: { id: "p1" } as ICompareDisplayProduct["product"],
      entry: {
        productId: "p1",
        categoryKey: "cat-a",
        configurationSectionInput: [{ sectionId: "s1", type: "Product" }],
      },
    };
    mocks.compareTableSpy.emit!("removeProduct", item);

    expect(mocks.removeFromCompareList).toHaveBeenCalledWith(item.product, item.entry.configurationSectionInput);
  });

  it("forwards CompareTable's clear-category event to a confirmation modal that calls clearCategory", () => {
    mocks.products.value = [{ productId: "p1", categoryKey: "cat-a" }];
    mocks.selectedCategoryKey.value = "cat-a";
    renderPage();

    mocks.compareTableSpy.emit!("clearCategory");

    expect(mocks.openModal).toHaveBeenCalledTimes(1);
    const options = mocks.openModal.mock.calls[0][0];
    options.props.onConfirm();

    expect(mocks.clearCategory).toHaveBeenCalledWith("cat-a");
  });
});
