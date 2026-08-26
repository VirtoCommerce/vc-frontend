import { beforeEach, describe, expect, it, vi } from "vitest";
import { PropertyValueTypes } from "@/core/api/graphql/types";
import { ProductType } from "@/core/enums";
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

  return {
    state: {
      compareEntries: ref<ICompareProductEntry[]>([]),
      fetchedProducts: ref<Product[]>([]),
      fetchingProducts: ref(false),
      route: { query: {} },
    },
    fns: {
      fetchProducts: vi.fn(),
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
  useProducts: () => ({
    fetchProducts: hoisted.fns.fetchProducts,
    products: hoisted.state.fetchedProducts,
    fetchingProducts: hoisted.state.fetchingProducts,
  }),
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
    vi.clearAllMocks();
  });

  describe("category selection", () => {
    it("defaults to the first tab when there is no ?category= in the URL", () => {
      hoisted.state.compareEntries.value = [entry("p1", "cat-a"), entry("p2", "cat-b")];

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
