import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PAGE_LIMIT } from "@/core/constants";
import { CATALOG_PAGINATION_MODES } from "@/shared/catalog/constants/catalog";
import { useProducts } from "./useProducts";
import type { CatalogPaginationModeType } from "../types";
import type { SearchProductFilterResult } from "@/core/api/graphql/types";
import type { FacetItemType } from "@/core/types";

// Mock types
interface Product {
  id: string;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

interface ProductConnection {
  items: Product[] | undefined;
  totalCount: number;
  pageInfo: PageInfo;
  term_facets: unknown[];
  range_facets: unknown[];
  filter_facets: unknown[];
  edges: unknown[];
}

interface ILanguage {
  languageCode: string;
  cultureName: string;
}

interface ICurrency {
  code: string;
}

interface IThemeSettings {
  catalog_pagination_mode?: CatalogPaginationModeType;
  image_carousel_in_product_card_enabled: boolean;
  zero_price_product_enabled: boolean;
}

interface IThemeContext {
  storeId: string;
  storeName: string;
  catalogId: string;
  defaultLanguage: ILanguage;
  defaultCurrency: ICurrency;
  availableLanguages: ILanguage[];
  availableCurrencies: ICurrency[];
  settings: IThemeSettings;
  defaultPresetName: string;
  storeSettings: Record<string, unknown>;
}

const mockData = vi.hoisted(() => {
  const mockPageInfo: PageInfo = {
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: "",
    endCursor: "",
  };

  const mockThemeContext: IThemeContext = {
    storeId: "store1",
    storeName: "Test Store",
    catalogId: "catalog1",
    defaultLanguage: { languageCode: "en-US", cultureName: "en-US" },
    defaultCurrency: { code: "USD" },
    availableLanguages: [],
    availableCurrencies: [],
    settings: {
      image_carousel_in_product_card_enabled: true,
      zero_price_product_enabled: true,
    },
    defaultPresetName: "default",
    storeSettings: {},
  };

  const mockSearchProductsResponse: ProductConnection = {
    items: [{ id: "product1" }, { id: "product2" }],
    totalCount: 10,
    pageInfo: mockPageInfo,
    term_facets: [],
    range_facets: [],
    filter_facets: [],
    edges: [],
  };

  const mockSearchProductsMoreResponse: ProductConnection = {
    items: [{ id: "product3" }, { id: "product4" }],
    totalCount: 10,
    pageInfo: mockPageInfo,
    term_facets: [],
    range_facets: [],
    filter_facets: [],
    edges: [],
  };

  const searchProducts = vi.fn();
  const useThemeContext = vi.fn();
  const barcodeQueryParam = { value: "" as unknown };

  return {
    mockPageInfo,
    mockThemeContext,
    mockSearchProductsResponse,
    mockSearchProductsMoreResponse,
    searchProducts,
    useThemeContext,
    barcodeQueryParam,
  };
});

vi.mock("@/core/api/graphql/catalog", () => ({
  searchProducts: mockData.searchProducts,
}));

vi.mock("@/core/composables", () => ({
  useThemeContext: mockData.useThemeContext,
  useRouteQueryParam: (key: string) =>
    key === "barcode"
      ? mockData.barcodeQueryParam
      : {
          value: "",
        },
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({
    getModuleSettings: () => ({}),
    isEnabled: () => true,
  }),
}));

vi.mock("@/core/utilities", async () => ({
  Logger: {
    error: vi.fn(),
  },
  getFilterExpressionFromFacets: vi.fn(),
  rangeFacetToCommonFacet: vi.fn(),
  termFacetToCommonFacet: vi.fn(),
  toFirstString: (await import("@/core/utilities/common")).toFirstString,
}));

vi.mock("@/shared/modal", () => ({
  useModal: () => ({
    openModal: vi.fn(),
  }),
}));

// Partial, like the other suites that mock this module: replacing it wholesale breaks as soon as
// anything in the graph reaches for another export - the logger takes `noop` from here.
vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();

  return {
    ...actual,
    useLocalStorage: () => ({
      value: [],
    }),
    createGlobalState: (fn: () => unknown) => fn,
    createFetch: () => ({}),
  };
});

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockData.barcodeQueryParam.value = "";
    mockData.searchProducts.mockResolvedValue(mockData.mockSearchProductsResponse);
    mockData.useThemeContext.mockReturnValue({
      themeContext: { value: mockData.mockThemeContext },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchMoreProducts", () => {
    it("should fetch more products and append them to the existing products list when catalog_pagination_mode is infinite_scroll", async () => {
      const { fetchProducts, fetchMoreProducts, products } = useProducts();

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product1" }, { id: "product2" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: 1, itemsPerPage: 2 });

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product3" }, { id: "product4" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchMoreProducts({ page: 2, itemsPerPage: 2 });

      expect(products.value).toEqual([{ id: "product1" }, { id: "product2" }, { id: "product3" }, { id: "product4" }]);
    });

    it("should append products when loading a page higher than minimum visited page with catalog_pagination_mode=load_more", async () => {
      const { fetchProducts, fetchMoreProducts, products } = useProducts({
        catalogPaginationMode: CATALOG_PAGINATION_MODES.loadMore,
      });

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product1" }, { id: "product2" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: 2, itemsPerPage: 2 });

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product3" }, { id: "product4" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchMoreProducts({ page: 3, itemsPerPage: 2 });

      expect(products.value).toEqual([{ id: "product1" }, { id: "product2" }, { id: "product3" }, { id: "product4" }]);
    });

    it("should prepend products when loading a page equal to the minimum visited page with catalog_pagination_mode=load_more", async () => {
      const { fetchProducts, fetchMoreProducts, products } = useProducts({
        catalogPaginationMode: CATALOG_PAGINATION_MODES.loadMore,
      });

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product5" }, { id: "product6" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: 3, itemsPerPage: 2 });

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product3" }, { id: "product4" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchMoreProducts({ page: 2, itemsPerPage: 2 });

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product1" }, { id: "product2" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchMoreProducts({ page: 1, itemsPerPage: 2 });

      expect(products.value).toEqual([
        { id: "product1" },
        { id: "product2" },
        { id: "product3" },
        { id: "product4" },
        { id: "product5" },
        { id: "product6" },
      ]);
    });

    it("should handle API errors gracefully during fetchMoreProducts", async () => {
      const errorMessage = "API Error";
      mockData.searchProducts.mockRejectedValueOnce(new Error(errorMessage));

      const { fetchMoreProducts, fetchingMoreProducts } = useProducts();

      await expect(fetchMoreProducts({ page: 2, itemsPerPage: 2 })).rejects.toThrow(errorMessage);

      expect(fetchingMoreProducts.value).toBe(false);
    });
  });

  describe("preserveProductsWhileFetching", () => {
    it("clears products immediately on refetch by default", async () => {
      const { fetchProducts, products, totalProductsCount, pagesCount } = useProducts();

      await fetchProducts({ page: 1, itemsPerPage: 2 });
      expect(products.value).toEqual([{ id: "product1" }, { id: "product2" }]);
      expect(totalProductsCount.value).toBe(10);
      expect(pagesCount.value).toBe(5);

      let resolveRefetch!: (value: typeof mockData.mockSearchProductsResponse) => void;
      mockData.searchProducts.mockReturnValueOnce(new Promise((resolve) => (resolveRefetch = resolve)));

      // fetchProducts clears synchronously (before its first await), so this is already true
      // right after calling it — no need to wait for the request to resolve.
      const refetchPromise = fetchProducts({ page: 1, itemsPerPage: 2 });
      expect(products.value).toEqual([]);
      expect(totalProductsCount.value).toBe(0);
      expect(pagesCount.value).toBe(1);

      resolveRefetch(mockData.mockSearchProductsResponse);
      await refetchPromise;

      expect(products.value).toEqual([{ id: "product1" }, { id: "product2" }]);
    });

    it("keeps showing the previous products until a refetch resolves, when enabled", async () => {
      const { fetchProducts, products } = useProducts({ preserveProductsWhileFetching: true });

      await fetchProducts({ page: 1, itemsPerPage: 2 });
      expect(products.value).toEqual([{ id: "product1" }, { id: "product2" }]);

      let resolveRefetch!: (value: typeof mockData.mockSearchProductsMoreResponse) => void;
      mockData.searchProducts.mockReturnValueOnce(new Promise((resolve) => (resolveRefetch = resolve)));

      const refetchPromise = fetchProducts({ page: 1, itemsPerPage: 2 });
      expect(products.value).toEqual([{ id: "product1" }, { id: "product2" }]);

      resolveRefetch(mockData.mockSearchProductsMoreResponse);
      await refetchPromise;

      expect(products.value).toEqual([{ id: "product3" }, { id: "product4" }]);
    });

    it("keeps totalProductsCount and pagesCount alongside the preserved products, not just products itself", async () => {
      const { fetchProducts, totalProductsCount, pagesCount } = useProducts({
        preserveProductsWhileFetching: true,
      });

      await fetchProducts({ page: 1, itemsPerPage: 2 });
      expect(totalProductsCount.value).toBe(10);
      expect(pagesCount.value).toBe(5);

      let resolveRefetch!: (value: typeof mockData.mockSearchProductsMoreResponse) => void;
      mockData.searchProducts.mockReturnValueOnce(new Promise((resolve) => (resolveRefetch = resolve)));

      const refetchPromise = fetchProducts({ page: 1, itemsPerPage: 2 });
      expect(totalProductsCount.value).toBe(10);
      expect(pagesCount.value).toBe(5);

      resolveRefetch(mockData.mockSearchProductsMoreResponse);
      await refetchPromise;
    });
  });

  describe("page history handling", () => {
    beforeEach(() => {
      const localThemeContext = { ...mockData.mockThemeContext };
      localThemeContext.settings = {
        ...mockData.mockThemeContext.settings,
        catalog_pagination_mode: CATALOG_PAGINATION_MODES.loadMore,
      };

      mockData.useThemeContext.mockReturnValue({
        themeContext: { value: localThemeContext },
      });
    });

    it("should add page to history when fetchProducts is called without page", async () => {
      const { fetchProducts, pageHistory } = useProducts();

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product1" }, { id: "product2" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ itemsPerPage: 2 });

      expect(pageHistory.value).toEqual([1]);
    });

    it("should add pages to history when fetchProducts is called", async () => {
      const { fetchProducts, pageHistory } = useProducts();

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product1" }, { id: "product2" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: 3, itemsPerPage: 2 });

      expect(pageHistory.value).toEqual([3]);

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product3" }, { id: "product4" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: 2, itemsPerPage: 2 });

      expect(pageHistory.value).toEqual([3, 2]);
    });

    it("should add page to history on fetchMoreProducts", async () => {
      const { fetchProducts, fetchMoreProducts, pageHistory } = useProducts();

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product1" }, { id: "product2" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: 3, itemsPerPage: 2 });

      await fetchMoreProducts({ page: 2, itemsPerPage: 2 });
      await fetchMoreProducts({ page: 1, itemsPerPage: 2 });

      expect(pageHistory.value).toEqual([3, 2, 1]);
    });

    it("should not add page to history when page is 0", async () => {
      const { fetchProducts, pageHistory } = useProducts();

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product3" }, { id: "product4" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: 0, itemsPerPage: 2 });

      expect(pageHistory.value).toEqual([]);
    });

    it("should not add page to history when page is greater than pagesCount", async () => {
      const { fetchProducts, pageHistory } = useProducts();

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product3" }, { id: "product4" }],
        totalCount: 10,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: 10, itemsPerPage: 2 });

      expect(pageHistory.value).toEqual([]);
    });

    it("should not add page to history when page is greater than page limit", async () => {
      const { fetchProducts, pageHistory } = useProducts();

      mockData.searchProducts.mockResolvedValueOnce({
        items: [{ id: "product3" }, { id: "product4" }],
        totalCount: 300,
        pageInfo: mockData.mockPageInfo,
        term_facets: [],
        range_facets: [],
        filter_facets: [],
        edges: [],
      });

      await fetchProducts({ page: PAGE_LIMIT + 1, itemsPerPage: 2 });

      expect(pageHistory.value).toEqual([]);
    });
  });

  describe("facetsToHide property", () => {
    it("should not count hidden facets as selected in hasSelectedFacets", () => {
      const { facets, hasSelectedFacets, updateProductsFilters } = useProducts({ facetsToHide: ["hiddenFacet"] });

      // Set up facets
      facets.value = [
        {
          paramName: "hiddenFacet",
          type: "terms",
          label: "Hidden Facet",
          values: [{ value: "v1", label: "Value 1", count: 1 }],
        },
      ] as unknown as FacetItemType[];

      // Set up filters to make the facet appear selected
      updateProductsFilters({
        filters: [
          {
            name: "hiddenFacet",
            filterType: "term",
            isGenerated: false,
            termValues: [{ value: "v1", label: "Value 1" }],
          },
        ],
        facets: [],
        inStock: false,
        branches: [],
        purchasedBefore: false,
      });

      expect(hasSelectedFacets.value).toBe(false);
    });

    it("should count visible facets as selected in hasSelectedFacets", () => {
      const { facets, hasSelectedFacets, updateProductsFilters } = useProducts({ facetsToHide: ["hiddenFacet"] });

      // Set up facets
      facets.value = [
        {
          paramName: "visibleFacet",
          type: "terms",
          label: "Visible Facet",
          values: [{ value: "v1", label: "Value 1", count: 1 }],
        },
      ] as unknown as FacetItemType[];

      // Set up filters to make the facet appear selected
      updateProductsFilters({
        filters: [
          {
            name: "visibleFacet",
            filterType: "term",
            isGenerated: false,
            termValues: [{ value: "v1", label: "Value 1" }],
          },
        ],
        facets: [],
        inStock: false,
        branches: [],
        purchasedBefore: false,
      });

      expect(hasSelectedFacets.value).toBe(true);
    });

    it("should ignore hidden facets and count visible ones correctly", () => {
      const { facets, hasSelectedFacets, updateProductsFilters } = useProducts({ facetsToHide: ["hiddenFacet"] });

      // Set up facets
      facets.value = [
        {
          paramName: "hiddenFacet",
          type: "terms",
          label: "Hidden Facet",
          values: [{ value: "v1", label: "Value 1", count: 1 }],
        },
        {
          paramName: "visibleFacet",
          type: "terms",
          label: "Visible Facet",
          values: [{ value: "v2", label: "Value 2", count: 1 }],
        },
      ] as unknown as FacetItemType[];

      // Set up filters to make both facets appear selected
      updateProductsFilters({
        filters: [
          {
            name: "hiddenFacet",
            filterType: "term",
            isGenerated: false,
            termValues: [{ value: "v1", label: "Value 1" }],
          },
          {
            name: "visibleFacet",
            filterType: "term",
            isGenerated: false,
            termValues: [{ value: "v2", label: "Value 2" }],
          },
        ],
        facets: [],
        inStock: false,
        branches: [],
        purchasedBefore: false,
      });

      expect(hasSelectedFacets.value).toBe(true);
    });

    it("should return false when all selected facets are hidden", () => {
      const { facets, hasSelectedFacets, updateProductsFilters } = useProducts({
        facetsToHide: ["hiddenFacet", "anotherHidden"],
      });

      // Set up facets
      facets.value = [
        {
          paramName: "hiddenFacet",
          type: "terms",
          label: "Hidden Facet",
          values: [{ value: "v1", label: "Value 1", count: 1 }],
        },
        {
          paramName: "anotherHidden",
          type: "terms",
          label: "Another Hidden Facet",
          values: [{ value: "v2", label: "Value 2", count: 1 }],
        },
      ] as unknown as FacetItemType[];

      // Set up filters to make both facets appear selected
      updateProductsFilters({
        filters: [
          {
            name: "hiddenFacet",
            filterType: "term",
            isGenerated: false,
            termValues: [{ value: "v1", label: "Value 1" }],
          },
          {
            name: "anotherHidden",
            filterType: "term",
            isGenerated: false,
            termValues: [{ value: "v2", label: "Value 2" }],
          },
        ],
        facets: [],
        inStock: false,
        branches: [],
        purchasedBefore: false,
      });

      expect(hasSelectedFacets.value).toBe(false);
    });
  });

  // Chips, the "Reset filters" button and the facet expression all read the prepared filters.
  describe("prepared filters", () => {
    // The names are deliberately outside EXCLUDED_FILTER_NAMES, so only the isGenerated flag can drop them.
    const generatedAndUserFilters: SearchProductFilterResult[] = [
      {
        name: "gtin",
        filterType: "term",
        isGenerated: true,
        termValues: [{ value: "4006381333931", label: "4006381333931" }],
      },
      {
        name: "color",
        filterType: "term",
        isGenerated: false,
        termValues: [{ value: "red", label: "Red" }],
      },
    ];

    function prepare(filters: SearchProductFilterResult[]) {
      const { productsFilters, hasSelectedFilters, updateProductsFilters } = useProducts();

      updateProductsFilters({ filters, facets: [], inStock: false, branches: [], purchasedBefore: false });

      return { names: productsFilters.value.filters.map((filter) => filter.name), hasSelectedFilters };
    }

    // Intent search marks the filters it infers from the query as generated; they show as chips, and removing
    // one is how the user keeps their own query.
    it("keeps server-generated filters in a normal search", () => {
      const { names, hasSelectedFilters } = prepare(generatedAndUserFilters);

      expect(names).toEqual(["gtin", "color"]);
      expect(hasSelectedFilters.value).toBe(true);
    });

    // The barcode expansion is generated from the scanned code, so the user has nothing to remove.
    it("drops server-generated filters in a barcode lookup and keeps the user's own", () => {
      mockData.barcodeQueryParam.value = "4006381333931";

      const { names, hasSelectedFilters } = prepare(generatedAndUserFilters);

      expect(names).toEqual(["color"]);
      expect(hasSelectedFilters.value).toBe(true);
    });

    // `?barcode=a&barcode=b` reaches the composable as an array.
    it("treats a repeated barcode param as a barcode lookup", () => {
      mockData.barcodeQueryParam.value = ["4006381333931", "150701"];

      expect(prepare(generatedAndUserFilters).names).toEqual(["color"]);
    });

    // An older backend without the barcode middleware echoes the term back as an ordinary filter.
    it("drops the barcode filter even when it is not marked as generated", () => {
      const { productsFilters, hasSelectedFilters, updateProductsFilters } = useProducts();

      updateProductsFilters({
        filters: [
          {
            name: "barcode",
            filterType: "term",
            isGenerated: false,
            termValues: [{ value: "150701", label: "150701" }],
          },
        ],
        facets: [],
        inStock: false,
        branches: [],
        purchasedBefore: false,
      });

      expect(productsFilters.value.filters).toEqual([]);
      expect(hasSelectedFilters.value).toBe(false);
    });
  });

  describe("fetchProducts result", () => {
    // A caller that navigates on the result (the single barcode hit) must read its own request's response.
    it("resolves with the items and total count it applied", async () => {
      const { fetchProducts, products, totalProductsCount } = useProducts();

      const result = await fetchProducts({ page: 1, itemsPerPage: 2 });

      expect(result).toEqual({ items: [{ id: "product1" }, { id: "product2" }], totalCount: 10 });
      expect(products.value).toEqual(result.items);
      expect(totalProductsCount.value).toBe(result.totalCount);
    });
  });
});
