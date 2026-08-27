import { beforeEach, describe, expect, it, vi } from "vitest";
import { PropertyValueTypes } from "@/core/api/graphql/types";
import { ProductType } from "@/core/enums";
import { useNotifications } from "@/shared/notification";
import {
  AVAILABILITY_ROW_KEY,
  PRICE_ROW_KEY,
  PROPERTY_ROW_KEY_PREFIX,
  RATING_ROW_KEY,
  SKU_ROW_KEY,
} from "../constants";
import type { ICompareProductEntry } from "../types";
import type { AvailabilityData, Product, Property } from "@/core/api/graphql/types";

const hoisted = await vi.hoisted(async () => {
  const { ref } = await import("vue");

  const state = {
    compareEntries: ref<ICompareProductEntry[]>([]),
    fetchedProducts: ref<Product[]>([]),
    fetchingProducts: ref(false),
    route: { query: {} },
  };

  const fetchProducts = vi.fn();
  // Real object so useCompareProductsPage's call args (opts) can be asserted on — see the
  // "useProducts integration" describe block below.
  const useProducts = vi.fn(() => ({
    fetchProducts,
    products: state.fetchedProducts,
    fetchingProducts: state.fetchingProducts,
  }));

  return {
    state,
    fns: {
      fetchProducts,
      useProducts,
      analytics: vi.fn(),
      isEnabled: vi.fn(() => false),
    },
    t: vi.fn((key: string) => key),
    n: vi.fn((value: number) => String(value)),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: hoisted.t, n: hoisted.n }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => hoisted.state.route,
}));

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/core/composables", () => ({
  useAnalytics: () => ({ analytics: hoisted.fns.analytics }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ isEnabled: hoisted.fns.isEnabled }),
}));

vi.mock("@/core/globals", () => ({
  globals: {
    storeId: "store-1",
    currencyCode: "USD",
    cultureName: "en-US",
    // getPropertyValue (real, used by propertyRows) reads this directly.
    i18n: {
      global: { t: (key: string) => key, d: (value: unknown) => String(value), n: (value: unknown) => String(value) },
    },
  },
}));

vi.mock("@/shared/catalog/composables/useProducts", () => ({
  useProducts: hoisted.fns.useProducts,
}));

vi.mock("./useCompareProducts", () => ({
  useCompareProducts: () => ({
    products: hoisted.state.compareEntries,
    getCategoryProductsCount: (categoryKey: string) =>
      hoisted.state.compareEntries.value.filter((e) => e.categoryKey === categoryKey).length,
  }),
}));

const { useCompareProductsPage } = await import("./useCompareProductsPage");

function entry(
  productId: string,
  categoryKey: string,
  overrides: Partial<ICompareProductEntry> = {},
): ICompareProductEntry {
  return { productId, categoryKey, ...overrides };
}

function availabilityData(overrides: Partial<AvailabilityData> = {}): AvailabilityData {
  return {
    isActive: true,
    isAvailable: true,
    isBuyable: true,
    isInStock: true,
    isEstimated: false,
    isTrackInventory: false,
    inventories: [],
    availableQuantity: 100,
    ...overrides,
  };
}

function product(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    code: `SKU-${id}`,
    minQuantity: 1,
    price: { actual: { formattedAmount: "$10.00" } },
    properties: [],
    breadcrumbs: [{ itemId: id, title: id, typeName: "Category" }],
    availabilityData: availabilityData(),
    ...overrides,
  } as Product;
}

function property(overrides: Partial<Property> = {}): Property {
  return {
    id: "prop-1",
    name: "color",
    label: "Color",
    hidden: false,
    multivalue: false,
    propertyValueType: PropertyValueTypes.LongText,
    value: "Red",
    ...overrides,
  } as Property;
}

describe("useCompareProductsPage", () => {
  beforeEach(() => {
    hoisted.state.compareEntries.value = [];
    hoisted.state.fetchedProducts.value = [];
    hoisted.state.fetchingProducts.value = false;
    hoisted.state.route.query = {};
    hoisted.fns.isEnabled.mockReturnValue(false);
    useNotifications().clear();
    vi.clearAllMocks();
  });

  describe("category selection", () => {
    it("defaults to the first tab when there is no ?category= in the URL", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-b")];
      // A tab with nothing resolved yet is hidden (see "categoryTabs — unresolved entries" below)
      // unless it's already selected, so give both categories something to resolve to here —
      // this test is about the default-selection logic, not resolution.
      hoisted.state.fetchedProducts.value = [product("p1"), product("p2")];

      const { selectedCategoryKey } = useCompareProductsPage();

      expect(selectedCategoryKey.value).toBe("cat-a");
    });

    it("opens the category from ?category= when it matches an existing tab", () => {
      hoisted.state.route.query = { category: "cat-b" };
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-b")];

      const { selectedCategoryKey } = useCompareProductsPage();

      expect(selectedCategoryKey.value).toBe("cat-b");
    });

    it("falls back to the first tab when ?category= does not match any tab (stale link)", () => {
      hoisted.state.route.query = { category: "cat-nonexistent" };
      hoisted.state.compareEntries.value = [entry("p1", "cat-a")];
      hoisted.state.fetchedProducts.value = [product("p1")];

      const { selectedCategoryKey } = useCompareProductsPage();

      expect(selectedCategoryKey.value).toBe("cat-a");
    });

    it("does not clobber a pending ?category= selection while categoryTabs is still empty", () => {
      hoisted.state.route.query = { category: "cat-b" };
      hoisted.state.compareEntries.value = []; // categoryTabs computes to [] with nothing in the list yet

      const { selectedCategoryKey } = useCompareProductsPage();

      expect(selectedCategoryKey.value).toBe("cat-b");
    });

    it("selectCategory switches the current selection", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-b")];

      const { selectedCategoryKey, selectCategory } = useCompareProductsPage();
      selectCategory("cat-b");

      expect(selectedCategoryKey.value).toBe("cat-b");
    });
  });

  describe("categoryTabs — unresolved entries", () => {
    it("labels a category whose entries have no Category breadcrumb (categoryKey === '') instead of leaving it blank", () => {
      hoisted.state.compareEntries.value = [entry("p1", "")];
      hoisted.state.fetchedProducts.value = [product("p1", { breadcrumbs: [] })];

      const { categoryTabs } = useCompareProductsPage();

      expect(categoryTabs.value).toEqual([{ categoryKey: "", label: "shared.compare.table.uncategorized", count: 1 }]);
    });

    it("hides a category entirely once nothing in it has resolved (still loading, >16 cap, deleted product, or a failed fetch) — the fetch-failure toast, tested below, is what surfaces that", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-b")];
      hoisted.state.fetchedProducts.value = [product("p2")]; // p1/cat-a never resolved

      const { categoryTabs } = useCompareProductsPage();

      expect(categoryTabs.value).toEqual([{ categoryKey: "cat-b", label: "p2", count: 1 }]);
    });

    it("keeps the currently selected category visible (blank label) even at zero resolved, so a mid-refetch doesn't yank the user to a different tab", () => {
      hoisted.state.route.query = { category: "cat-a" };
      hoisted.state.compareEntries.value = [entry("p1", "cat-a")];
      hoisted.state.fetchedProducts.value = [];

      const { categoryTabs, selectedCategoryKey } = useCompareProductsPage();

      expect(selectedCategoryKey.value).toBe("cat-a");
      expect(categoryTabs.value).toEqual([{ categoryKey: "cat-a", label: "", count: 0 }]);
    });

    it("uses a later entry's resolved product for the label when an earlier entry in the same category is unresolved", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-a")];
      hoisted.state.fetchedProducts.value = [product("p2")]; // p1 never resolved

      const { categoryTabs } = useCompareProductsPage();

      expect(categoryTabs.value).toEqual([{ categoryKey: "cat-a", label: "p2", count: 1 }]);
    });

    it("counts only resolved entries, not the raw number of entries in storage", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-a"), entry("p3", "cat-a")];
      hoisted.state.fetchedProducts.value = [product("p1"), product("p2")]; // p3 unresolved

      const { categoryTabs } = useCompareProductsPage();

      expect(categoryTabs.value[0].count).toBe(2);
    });

    it("shows a warning notification when a refetch fails, since a failed fetch would otherwise look identical to a successful-but-empty one", async () => {
      hoisted.fns.fetchProducts.mockRejectedValueOnce(new Error("network error"));
      hoisted.state.compareEntries.value = [entry("p1", "cat-a")];

      useCompareProductsPage();

      await vi.waitFor(() => {
        expect(useNotifications().stack.value.some((n) => n.text === "shared.compare.notifications.fetch_failed")).toBe(
          true,
        );
      });
    });
  });

  describe("useProducts integration", () => {
    it("opts into preserveProductsWhileFetching, so a refetch (see useProducts.fetchProducts) doesn't clear fetchedProducts out from under categoryTabs/selectedCategoryProducts on every add/remove", () => {
      // The actual "don't clear while fetching" behavior lives in useProducts.ts itself and is
      // covered there (useProducts.test.ts) — this only asserts the compare page opts in.
      useCompareProductsPage();

      expect(hoisted.fns.useProducts).toHaveBeenCalledWith(
        expect.objectContaining({ preserveProductsWhileFetching: true }),
      );
    });

    it("dedupes ids and sizes itemsPerPage to match, so a >16-entry list doesn't fall back to searchProducts' default page size and lose products past the 16th", async () => {
      // p1 appears twice (two configurations of the same product) — without dedup it would eat
      // an extra slot in an itemsPerPage sized off ids.length.
      hoisted.state.compareEntries.value = [
        entry("p1", "cat-a", { localId: "l1", configurationSectionInput: [{ sectionId: "s1", type: "Product" }] }),
        entry("p1", "cat-a", { localId: "l2", configurationSectionInput: [{ sectionId: "s2", type: "Product" }] }),
        entry("p2", "cat-a"),
      ];

      useCompareProductsPage();
      // fetchProducts is called from inside a promise queue chained off the productIds watcher,
      // not synchronously — let that microtask run.
      await Promise.resolve();
      await Promise.resolve();

      expect(hoisted.fns.fetchProducts).toHaveBeenCalledWith({ productIds: ["p1", "p2"], itemsPerPage: 2 });
    });
  });

  describe("customFieldRows — availability differs (VCST-5735 fix)", () => {
    function setUpCategory(products: Product[]) {
      hoisted.state.compareEntries.value = products.map((p) => entry(p.id, "cat-a"));
      hoisted.state.fetchedProducts.value = products;
    }

    function availableAt(quantity: number) {
      return availabilityData({ availableQuantity: quantity });
    }

    it.each([
      {
        name: "quantities differ, even though isInStock is the same for both",
        overridesA: { availabilityData: availableAt(5) },
        overridesB: { availabilityData: availableAt(500) },
        expected: true,
      },
      {
        name: "isInStock and quantity are identical",
        overridesA: { availabilityData: availableAt(5) },
        overridesB: { availabilityData: availableAt(5) },
        expected: false,
      },
      {
        name: "digital vs. a physical product",
        overridesA: { productType: ProductType.Digital },
        overridesB: { productType: ProductType.Physical },
        expected: true,
      },
    ] as const)("marks availability differs=$expected when $name", ({ overridesA, overridesB, expected }) => {
      setUpCategory([product("p1", overridesA), product("p2", overridesB)]);

      const { tableRows } = useCompareProductsPage();
      const availabilityRow = tableRows.value.find((row) => row.key === AVAILABILITY_ROW_KEY);

      expect(availabilityRow?.differs).toBe(expected);
    });

    it("caps the availability signature at MAX_DISPLAY_IN_STOCK_QUANTITY, matching what InStock renders", () => {
      // Both well above the 9999 display cap — InStock would show "9999+" for both, so they read
      // as the same even though the raw numbers differ.
      setUpCategory([
        product("p1", { availabilityData: availabilityData({ availableQuantity: 20000 }) }),
        product("p2", { availabilityData: availabilityData({ availableQuantity: 30000 }) }),
      ]);

      const { tableRows } = useCompareProductsPage();
      const availabilityRow = tableRows.value.find((row) => row.key === AVAILABILITY_ROW_KEY);

      expect(availabilityRow?.differs).toBe(false);
    });
  });

  describe("customFieldRows — other fields", () => {
    it("marks price as differing when formatted amounts differ", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-a")];
      hoisted.state.fetchedProducts.value = [
        product("p1", { price: { actual: { formattedAmount: "$10.00" } } } as Partial<Product>),
        product("p2", { price: { actual: { formattedAmount: "$20.00" } } } as Partial<Product>),
      ];

      const { tableRows } = useCompareProductsPage();
      const priceRow = tableRows.value.find((row) => row.key === PRICE_ROW_KEY);

      expect(priceRow?.differs).toBe(true);
    });

    it("shows a placeholder and does not throw for a missing SKU", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a")];
      hoisted.state.fetchedProducts.value = [product("p1", { code: undefined })];

      const { tableRows } = useCompareProductsPage();
      const skuRow = tableRows.value.find((row) => row.key === SKU_ROW_KEY);

      expect(skuRow?.values).toEqual(["–"]);
    });

    it("only builds rows for products in the currently selected category", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-b")];
      hoisted.state.fetchedProducts.value = [product("p1"), product("p2")];

      const { selectedCategoryProducts } = useCompareProductsPage();

      expect(selectedCategoryProducts.value.map((item) => item.product.id)).toEqual(["p1"]);
    });
  });

  describe("propertyRows", () => {
    it("marks a dynamic property row as differing when values differ across products", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-a")];
      hoisted.state.fetchedProducts.value = [
        product("p1", { properties: [property({ name: "color", value: "Red" })] }),
        product("p2", { properties: [property({ name: "color", value: "Blue" })] }),
      ];

      const { tableRows } = useCompareProductsPage();
      const colorRow = tableRows.value.find((row) => row.key === `${PROPERTY_ROW_KEY_PREFIX}color`);

      expect(colorRow?.differs).toBe(true);
    });

    it("does not mark a property row as differing when values are equal", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-a")];
      hoisted.state.fetchedProducts.value = [
        product("p1", { properties: [property({ name: "color", value: "Red" })] }),
        product("p2", { properties: [property({ name: "color", value: "Red" })] }),
      ];

      const { tableRows } = useCompareProductsPage();
      const colorRow = tableRows.value.find((row) => row.key === `${PROPERTY_ROW_KEY_PREFIX}color`);

      expect(colorRow?.differs).toBe(false);
    });

    it("hides the row entirely when no product has a value for that property", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-a")];
      hoisted.state.fetchedProducts.value = [
        product("p1", { properties: [property({ name: "color", value: undefined })] }),
        product("p2", { properties: [property({ name: "color", value: undefined })] }),
      ];

      const { tableRows } = useCompareProductsPage();

      expect(tableRows.value.some((row) => row.key === `${PROPERTY_ROW_KEY_PREFIX}color`)).toBe(false);
    });

    it("keeps the row when at least one product has a value for that property", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-a")];
      hoisted.state.fetchedProducts.value = [
        product("p1", { properties: [property({ name: "color", value: "Red" })] }),
        product("p2", { properties: [property({ name: "color", value: undefined })] }),
      ];

      const { tableRows } = useCompareProductsPage();

      expect(tableRows.value.some((row) => row.key === `${PROPERTY_ROW_KEY_PREFIX}color`)).toBe(true);
    });
  });

  describe("differRowsCount", () => {
    it("counts only the rows that actually differ", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-a")];
      hoisted.state.fetchedProducts.value = [
        // price differs, sku differs, availability/minOrderQty the same.
        product("p1", { price: { actual: { formattedAmount: "$10.00" } } } as Partial<Product>),
        product("p2", { price: { actual: { formattedAmount: "$20.00" } } } as Partial<Product>),
      ];

      const { differRowsCount, tableRows } = useCompareProductsPage();

      expect(differRowsCount.value).toBe(tableRows.value.filter((row) => row.differs).length);
      expect(differRowsCount.value).toBeGreaterThan(0);
    });
  });

  describe("customer rating row", () => {
    it("is omitted when the customer-reviews module is disabled", () => {
      hoisted.fns.isEnabled.mockReturnValue(false);
      hoisted.state.compareEntries.value = [entry("p1", "cat-a")];
      hoisted.state.fetchedProducts.value = [product("p1", { rating: { value: 4.5 } } as Partial<Product>)];

      const { tableRows } = useCompareProductsPage();

      expect(tableRows.value.some((row) => row.key === RATING_ROW_KEY)).toBe(false);
    });

    it("is included when the module is enabled and at least one product has a rating", () => {
      hoisted.fns.isEnabled.mockReturnValue(true);
      hoisted.state.compareEntries.value = [entry("p1", "cat-a")];
      hoisted.state.fetchedProducts.value = [product("p1", { rating: { value: 4.5 } } as Partial<Product>)];

      const { tableRows } = useCompareProductsPage();

      expect(tableRows.value.some((row) => row.key === RATING_ROW_KEY)).toBe(true);
    });
  });
});
