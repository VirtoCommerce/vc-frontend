import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, computed, nextTick } from "vue";
import { useProductVariations } from "./useProductVariations";
import type { ProductsFiltersType } from "../types";
import type { Ref } from "vue";

const mockGetFilterExpression = vi.hoisted(() => vi.fn((filters: string[]) => filters.filter(Boolean).join(" ")));
const mockGetFilterExpressionForAvailableIn = vi.hoisted(() =>
  vi.fn((branches: string[]) => (branches.length ? `available_in:"${branches.join('","')}"` : "")),
);
const mockGetFilterExpressionForInStock = vi.hoisted(() =>
  vi.fn((inStock: boolean) => (inStock ? "inStock:true" : "")),
);
const mockGetFilterExpressionForPurchasedBefore = vi.hoisted(() =>
  vi.fn((purchasedBefore: boolean) => (purchasedBefore ? "isPurchased:true" : "")),
);

vi.mock("@/core/utilities", () => ({
  getFilterExpression: mockGetFilterExpression,
  getFilterExpressionForAvailableIn: mockGetFilterExpressionForAvailableIn,
  getFilterExpressionForInStock: mockGetFilterExpressionForInStock,
  getFilterExpressionForPurchasedBefore: mockGetFilterExpressionForPurchasedBefore,
}));

describe("useProductVariations", () => {
  let productsFilters: Ref<ProductsFiltersType>;

  beforeEach(() => {
    vi.clearAllMocks();
    productsFilters = ref<ProductsFiltersType>({
      facets: [],
      filters: [],
      inStock: false,
      purchasedBefore: false,
      branches: [],
    });
  });

  describe("initialization and default values", () => {
    it("should initialize with default values", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams, variationsPageNumber } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      expect(variationsPageNumber.value).toBe(1);
      expect(variationsSearchParams.value.page).toBe(1);
      expect(variationsSearchParams.value.itemsPerPage).toBe(50);
      expect(variationsSearchParams.value.sort).toBeUndefined();
      expect(variationsSearchParams.value.filter).toBe("productfamilyid:123 is:product,variation");
    });

    it("should initialize with custom itemsPerPage", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        itemsPerPage: 100,
      });

      expect(variationsSearchParams.value.itemsPerPage).toBe(100);
    });

    it("should initialize with custom sort", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        sort: "name:asc",
      });

      expect(variationsSearchParams.value.sort).toBe("name:asc");
    });

    it("should initialize with string variationsFilterExpression", () => {
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression: "productfamilyid:1234 is:product,variation",
      });

      expect(variationsSearchParams.value.filter).toBe("productfamilyid:1234 is:product,variation");
    });

    it("should build filter expression from productsFilters", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      productsFilters.value = {
        facets: [],
        filters: [],
        inStock: true,
        purchasedBefore: true,
        branches: ["branch1", "branch2"],
      };

      useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      expect(mockGetFilterExpressionForInStock).toHaveBeenCalledWith(true);
      expect(mockGetFilterExpressionForPurchasedBefore).toHaveBeenCalledWith(true);
      expect(mockGetFilterExpressionForAvailableIn).toHaveBeenCalledWith(["branch1", "branch2"]);
      expect(mockGetFilterExpression).toHaveBeenCalled();
    });
  });

  describe("reactivity - variationsPageNumber", () => {
    it("should update variationsSearchParams when variationsPageNumber changes", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams, variationsPageNumber } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      expect(variationsSearchParams.value.page).toBe(1);

      variationsPageNumber.value = 2;
      await nextTick();

      expect(variationsSearchParams.value.page).toBe(2);
    });
  });

  describe("reactivity - variationsFilterExpression", () => {
    it("should update variationsSearchParams when variationsFilterExpression changes", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      expect(variationsSearchParams.value.filter).toBe("productfamilyid:123 is:product,variation");

      variationsFilterExpression.value = "productfamilyid:456 is:product,variation";
      await nextTick();

      expect(variationsSearchParams.value.filter).toContain("productfamilyid:456 is:product,variation");
    });

    it("should work with computed variationsFilterExpression", async () => {
      const productId = ref("123");
      const variationsFilterExpression = computed(() => `productfamilyid:${productId.value} is:product,variation`);
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      expect(variationsSearchParams.value.filter).toContain("productfamilyid:123");

      productId.value = "456";
      await nextTick();

      expect(variationsSearchParams.value.filter).toContain("productfamilyid:456");
    });
  });

  describe("reactivity - productsFilters", () => {
    it("should update variationsSearchParams when productsFilters changes", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      // Initially filter should not contain inStock:true
      expect(variationsSearchParams.value.filter).not.toContain("inStock:true");

      // Create new object to trigger watch
      productsFilters.value = {
        facets: productsFilters.value.facets,
        filters: productsFilters.value.filters,
        inStock: true,
        purchasedBefore: productsFilters.value.purchasedBefore,
        branches: productsFilters.value.branches,
      };
      await nextTick();

      // Filter should be updated (contains inStock:true)
      expect(variationsSearchParams.value.filter).toContain("inStock:true");
    });

    it("should update variationsSearchParams when branches change", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      // Initially filter should not contain available_in
      expect(variationsSearchParams.value.filter).not.toContain("available_in");

      // Create new object to trigger watch
      productsFilters.value = {
        facets: productsFilters.value.facets,
        filters: productsFilters.value.filters,
        inStock: productsFilters.value.inStock,
        purchasedBefore: productsFilters.value.purchasedBefore,
        branches: ["branch1"],
      };
      await nextTick();

      // Filter should be updated (contains available_in)
      expect(variationsSearchParams.value.filter).toContain("available_in");
      expect(variationsSearchParams.value.filter).toContain("branch1");
    });

    it("should update variationsSearchParams when purchasedBefore changes", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      // Initially filter should not contain isPurchased:true
      expect(variationsSearchParams.value.filter).not.toContain("isPurchased:true");

      // Create new object to trigger watch
      productsFilters.value = {
        facets: productsFilters.value.facets,
        filters: productsFilters.value.filters,
        inStock: productsFilters.value.inStock,
        purchasedBefore: true,
        branches: productsFilters.value.branches,
      };
      await nextTick();

      // Filter should be updated (contains isPurchased:true)
      expect(variationsSearchParams.value.filter).toContain("isPurchased:true");
    });
  });

  describe("reactivity - itemsPerPage", () => {
    it("should update variationsSearchParams when itemsPerPage ref changes", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const itemsPerPage = ref(50);
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        itemsPerPage,
      });

      expect(variationsSearchParams.value.itemsPerPage).toBe(50);

      itemsPerPage.value = 100;
      await nextTick();

      expect(variationsSearchParams.value.itemsPerPage).toBe(100);
    });

    it("should work with computed itemsPerPage", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const isB2cLayout = ref(false);
      const itemsPerPage = computed(() => (isB2cLayout.value ? 150 : 50));
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        itemsPerPage,
      });

      expect(variationsSearchParams.value.itemsPerPage).toBe(50);

      isB2cLayout.value = true;
      await nextTick();

      expect(variationsSearchParams.value.itemsPerPage).toBe(150);
    });
  });

  describe("reactivity - sort", () => {
    it("should update variationsSearchParams when sort ref changes", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const sort = ref<string | undefined>(undefined);
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        sort,
      });

      expect(variationsSearchParams.value.sort).toBeUndefined();

      sort.value = "name:asc";
      await nextTick();

      expect(variationsSearchParams.value.sort).toBe("name:asc");
    });

    it("should work with computed sort", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const isB2cLayout = ref(false);
      const sortInfo = ref<{ column: string; direction: "asc" | "desc" }>({ column: "name", direction: "asc" });
      const sort = computed(() => (isB2cLayout.value ? undefined : `name:${sortInfo.value.direction}`));
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        sort,
      });

      expect(variationsSearchParams.value.sort).toBe("name:asc");

      sortInfo.value.direction = "desc";
      await nextTick();

      expect(variationsSearchParams.value.sort).toBe("name:desc");

      isB2cLayout.value = true;
      await nextTick();

      expect(variationsSearchParams.value.sort).toBeUndefined();
    });
  });

  describe("customFilterBuilder", () => {
    it("should use customFilterBuilder when provided", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const customFilterBuilder = vi.fn(() => "custom:filter");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        customFilterBuilder,
      });

      expect(customFilterBuilder).toHaveBeenCalled();
      expect(variationsSearchParams.value.filter).toBe("custom:filter");
    });

    it("should not use productsFilters when customFilterBuilder is provided", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const customFilterBuilder = vi.fn(() => "custom:filter");
      useProductVariations({
        productsFilters,
        variationsFilterExpression,
        customFilterBuilder,
      });

      // Should not call filter functions for productsFilters
      expect(mockGetFilterExpressionForInStock).not.toHaveBeenCalled();
      expect(mockGetFilterExpressionForPurchasedBefore).not.toHaveBeenCalled();
      expect(mockGetFilterExpressionForAvailableIn).not.toHaveBeenCalled();
    });

    it("should react to customFilterBuilderDeps changes", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const isB2cLayout = ref(false);
      const customFilterBuilder = vi.fn(() => (isB2cLayout.value ? "b2c:filter" : "default:filter"));
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        customFilterBuilder,
        customFilterBuilderDeps: [isB2cLayout],
      });

      expect(variationsSearchParams.value.filter).toBe("default:filter");

      isB2cLayout.value = true;
      await nextTick();

      expect(customFilterBuilder).toHaveBeenCalledTimes(2);
      expect(variationsSearchParams.value.filter).toBe("b2c:filter");
    });
  });

  describe("resetVariationsParams", () => {
    it("should reset variationsPageNumber to 1", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsPageNumber, resetVariationsParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      variationsPageNumber.value = 5;
      expect(variationsPageNumber.value).toBe(5);

      resetVariationsParams();
      expect(variationsPageNumber.value).toBe(1);
    });
  });

  describe("updateSearchParams", () => {
    it("should update variationsSearchParams with partial updates", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams, updateSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      updateSearchParams({
        filter: "new:filter",
        page: 2,
      });

      expect(variationsSearchParams.value.filter).toBe("new:filter");
      expect(variationsSearchParams.value.page).toBe(2);
      // Other properties should remain unchanged if not specified
      expect(variationsSearchParams.value.itemsPerPage).toBe(50);
    });

    it("should merge updates with existing params", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams, updateSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        itemsPerPage: 100,
      });

      expect(variationsSearchParams.value.itemsPerPage).toBe(100);

      updateSearchParams({
        sort: "name:asc",
      });

      expect(variationsSearchParams.value.sort).toBe("name:asc");
      expect(variationsSearchParams.value.itemsPerPage).toBe(100); // Should remain unchanged
    });
  });

  describe("edge cases", () => {
    it("should handle empty branches array", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      productsFilters.value.branches = [];
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
      });

      expect(mockGetFilterExpressionForAvailableIn).toHaveBeenCalledWith([]);
      expect(variationsSearchParams.value.filter).toBeDefined();
    });

    it("should handle undefined sort", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        sort: undefined,
      });

      expect(variationsSearchParams.value.sort).toBeUndefined();
    });

    it("should handle string sort parameter", () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        sort: "name:asc",
      });

      expect(variationsSearchParams.value.sort).toBe("name:asc");
    });

    it("should handle multiple dependencies in customFilterBuilderDeps", async () => {
      const variationsFilterExpression = ref("productfamilyid:123 is:product,variation");
      const isB2cLayout = ref(false);
      const productId = ref("123");
      const customFilterBuilder = vi.fn(() => `filter:${productId.value}:${isB2cLayout.value ? "b2c" : "default"}`);
      const { variationsSearchParams } = useProductVariations({
        productsFilters,
        variationsFilterExpression,
        customFilterBuilder,
        customFilterBuilderDeps: [isB2cLayout, productId],
      });

      expect(variationsSearchParams.value.filter).toBe("filter:123:default");

      productId.value = "456";
      await nextTick();

      expect(variationsSearchParams.value.filter).toBe("filter:456:default");

      isB2cLayout.value = true;
      await nextTick();

      expect(variationsSearchParams.value.filter).toBe("filter:456:b2c");
    });
  });
});
