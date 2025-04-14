import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PAGE_LIMIT } from "@/core/constants";
import { CATALOG_MODES } from "@/shared/catalog/constants/catalog";
import { useProducts } from "./useProducts";
import type { CatalogModeType } from "../types";

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
  catalog_mode?: CatalogModeType;
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

  return {
    mockPageInfo,
    mockThemeContext,
    mockSearchProductsResponse,
    mockSearchProductsMoreResponse,
    searchProducts,
    useThemeContext,
  };
});

vi.mock("@/core/api/graphql/catalog", () => ({
  searchProducts: mockData.searchProducts,
}));

vi.mock("@/core/composables", () => ({
  useThemeContext: mockData.useThemeContext,
  useRouteQueryParam: () => ({
    value: "",
  }),
}));

vi.mock("@/core/utilities", () => ({
  Logger: {
    error: vi.fn(),
  },
  getFilterExpressionFromFacets: vi.fn(),
  rangeFacetToCommonFacet: vi.fn(),
  termFacetToCommonFacet: vi.fn(),
}));

vi.mock("@/shared/modal", () => ({
  useModal: () => ({
    openModal: vi.fn(),
  }),
}));

vi.mock("@vueuse/core", () => {
  return {
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
    mockData.searchProducts.mockResolvedValue(mockData.mockSearchProductsResponse);
    mockData.useThemeContext.mockReturnValue({
      themeContext: { value: mockData.mockThemeContext },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchMoreProducts", () => {
    it("should fetch more products and append them to the existing products list when catalog_mode is infinite_scroll", async () => {
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

    it("should append products when loading a page higher than minimum visited page with catalog_mode=load_more", async () => {
      const { fetchProducts, fetchMoreProducts, products } = useProducts({
        catalogMode: CATALOG_MODES.loadMore,
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

    it("should prepend products when loading a page equal to the minimum visited page with catalog_mode=load_more", async () => {
      const { fetchProducts, fetchMoreProducts, products } = useProducts({
        catalogMode: CATALOG_MODES.loadMore,
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

  describe("page history handling", () => {
    beforeEach(() => {
      const localThemeContext = { ...mockData.mockThemeContext };
      localThemeContext.settings = {
        ...mockData.mockThemeContext.settings,
        catalog_mode: CATALOG_MODES.loadMore,
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
});
