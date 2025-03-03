import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick, ref } from "vue";
import { useProductsCached } from "./useProductsCached";

type FakeProductType = {
  id: string;
  name: string;
};

const mockProductsComposable = {
  products: ref<Array<FakeProductType>>([]),
  fetchingProducts: ref(false),
  pagesCount: ref(1),
  totalProductsCount: ref(0),
  currentPage: ref(1),
  fetchProducts: vi.fn(),
  fetchMoreProducts: vi.fn(),
};

const mockIndexedDB = {
  setValue: vi.fn(() => Promise.resolve()),
  getValue: vi.fn(),
  deleteValue: vi.fn(() => Promise.resolve()),
  getAllKeys: vi.fn<() => Promise<IDBValidKey[]>>(() => Promise.resolve([])),
  clearStore: vi.fn(() => Promise.resolve()),
};

// Set up mocks with proper module exports
vi.mock("./useProducts", () => ({
  useProducts: () => mockProductsComposable,
}));

vi.mock("@/core/composables/useIndexedDB", () => ({
  useIndexedDB: () => mockIndexedDB,
}));

vi.mock("@vueuse/core", () => ({
  useSessionStorage: () => ref(0),
}));

// Create mock functions for the beforeEach section
const useProducts = vi.fn();
const useIndexedDB = vi.fn();

describe("useProductsCached", () => {
  const mockProducts = [
    { id: "1", name: "Product 1" },
    { id: "2", name: "Product 2" },
  ];
  const mockNewProducts = [
    { id: "3", name: "Product 3" },
    { id: "4", name: "Product 4" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    useProducts.mockReturnValue(mockProductsComposable);
    useIndexedDB.mockReturnValue(mockIndexedDB);

    // Reset reactive values
    mockProductsComposable.products.value = [];
    mockProductsComposable.fetchingProducts.value = false;
    mockProductsComposable.pagesCount.value = 1;
    mockProductsComposable.totalProductsCount.value = 0;
    mockProductsComposable.currentPage.value = 1;

    // Setup mock implementations for new methods
    mockIndexedDB.getAllKeys.mockResolvedValue([
      "products",
      "products:meta",
      'products:{"keyword":"test"}',
      'products:{"keyword":"test"}:meta',
    ] as IDBValidKey[]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return original useProducts composable when shouldUseCache is false", () => {
    const result = useProductsCached({ shouldUseCache: false });
    expect(result).toBe(mockProductsComposable);
  });

  it("should return enhanced composable with cache functionality when shouldUseCache is true", () => {
    const result = useProductsCached({ shouldUseCache: true });

    expect(result).not.toBe(mockProductsComposable);
    expect(result.fetchProducts).toBeDefined();
    expect(result.fetchMoreProducts).toBeDefined();
    expect(result.products).toBeDefined();
  });

  it("should load data from cache when available and not expired", async () => {
    const cachedProducts = [...mockProducts];
    const cachedMetaData = {
      lastUpdated: Date.now(), // Recent timestamp
      pagesCount: 3,
      totalProductsCount: 50,
      currentPage: 2,
    };

    mockIndexedDB.getValue.mockImplementation((key: string) => {
      if (key === "products:{}" || (key.includes("products") && !key.includes(":meta"))) {
        return Promise.resolve(cachedProducts);
      }
      if (key === "products:{}:meta" || key.includes(":meta")) {
        return Promise.resolve(cachedMetaData);
      }
      return Promise.resolve(null);
    });

    const composable = useProductsCached({ shouldUseCache: true });
    await composable.fetchProducts({});

    // Should not call API fetch if cache is valid
    expect(mockProductsComposable.fetchProducts).not.toHaveBeenCalled();

    // Should use cached data
    expect(composable.products.value).toEqual(cachedProducts);
    expect(composable.pagesCount.value).toBe(cachedMetaData.pagesCount);
    expect(composable.totalProductsCount.value).toBe(cachedMetaData.totalProductsCount);
    expect(composable.currentPage.value).toBe(cachedMetaData.currentPage);
  });

  it("should fetch from API when cache is expired", async () => {
    const cachedProducts = [...mockProducts];
    const cachedMetaData = {
      lastUpdated: Date.now() - 1000 * 60 * 5, // 5 minutes ago (expired)
      pagesCount: 3,
      totalProductsCount: 50,
      currentPage: 2,
    };

    mockIndexedDB.getValue.mockImplementation((key: string) => {
      if (key === "products:{}" || (key.includes("products") && !key.includes(":meta"))) {
        return Promise.resolve(cachedProducts);
      }
      if (key === "products:{}:meta" || key.includes(":meta")) {
        return Promise.resolve(cachedMetaData);
      }
      return Promise.resolve(null);
    });

    const composable = useProductsCached({ shouldUseCache: true });
    await composable.fetchProducts({});

    // Should call API fetch if cache is expired
    expect(mockProductsComposable.fetchProducts).toHaveBeenCalled();
  });

  it("should fetch from API when cache is empty", async () => {
    mockIndexedDB.getValue.mockResolvedValue(null);

    const composable = useProductsCached({ shouldUseCache: true });
    await composable.fetchProducts({});

    // Should call API fetch if cache is empty
    expect(mockProductsComposable.fetchProducts).toHaveBeenCalled();
  });

  it("should update cache when new products are fetched", async () => {
    mockProductsComposable.products.value = mockNewProducts;
    mockProductsComposable.pagesCount.value = 2;
    mockProductsComposable.totalProductsCount.value = 20;
    mockProductsComposable.currentPage.value = 1;

    useProductsCached({ shouldUseCache: true });

    // Trigger the watch function by changing products
    await nextTick();

    // Should save to cache
    expect(mockIndexedDB.setValue).toHaveBeenCalledWith("products", expect.any(Array));
    expect(mockIndexedDB.setValue).toHaveBeenCalledWith(
      "products:meta",
      expect.objectContaining({
        pagesCount: 2,
        totalProductsCount: 20,
        currentPage: 1,
        lastUpdated: expect.any(Number) as number,
      }),
    );
  });

  it("should merge cached products with newly fetched products", async () => {
    const cachedProducts = [...mockProducts];
    mockIndexedDB.getValue.mockImplementation((key: string) => {
      if (key === "products:{}" || (key.includes("products") && !key.includes(":meta"))) {
        return Promise.resolve(cachedProducts);
      }
      if (key === "products:{}:meta" || key.includes(":meta")) {
        return Promise.resolve({ lastUpdated: Date.now() });
      }
      return Promise.resolve(null);
    });

    mockProductsComposable.products.value = mockNewProducts;

    const composable = useProductsCached({ shouldUseCache: true });
    await composable.fetchProducts({});

    // Should contain both cached and new products
    expect(composable.products.value).toEqual([...cachedProducts, ...mockNewProducts]);
  });

  it("should handle fetchMoreProducts correctly when using live metadata", async () => {
    mockIndexedDB.getValue.mockResolvedValue(null);

    const composable = useProductsCached({ shouldUseCache: true });
    await composable.fetchProducts({}); // This will set isUsingLiveMetadata to true

    await composable.fetchMoreProducts({});
    await composable.fetchMoreProducts({});

    // Should delegate to original composable's fetchProducts
    expect(mockProductsComposable.fetchMoreProducts).toHaveBeenCalledTimes(2);
    expect(mockProductsComposable.fetchMoreProducts).toHaveBeenLastCalledWith({});
  });

  it("should handle fetchMoreProducts correctly when using cached metadata", async () => {
    const cachedMetaData = {
      lastUpdated: Date.now(),
      pagesCount: 3,
      totalProductsCount: 50,
      currentPage: 1,
    };

    mockIndexedDB.getValue.mockImplementation((key: string) => {
      if (key === "products:{}" || (key.includes("products") && !key.includes(":meta"))) {
        return Promise.resolve(mockProducts);
      }
      if (key === "products:{}:meta" || key.includes(":meta")) {
        return Promise.resolve(cachedMetaData);
      }
      return Promise.resolve(null);
    });

    const composable = useProductsCached({ shouldUseCache: true });
    await composable.fetchProducts({});

    await composable.fetchMoreProducts({});

    // In the implementation, when using cached metadata (isUsingLiveMetadata is false),
    // it calls fetchMoreProducts on the original composable with the next page in params
    expect(mockProductsComposable.fetchMoreProducts).toHaveBeenCalledWith({ page: 2 });
  });

  it("should continue working with live data when caching fails", async () => {
    // Setup IndexedDB to fail silently
    mockIndexedDB.setValue.mockImplementation(() => Promise.resolve());
    mockIndexedDB.getValue.mockResolvedValue(null);

    const composable = useProductsCached({ shouldUseCache: true });

    // Initial fetch should fall back to API
    await composable.fetchProducts({});
    expect(mockProductsComposable.fetchProducts).toHaveBeenCalled();

    // Update products - cache attempt should fail silently
    mockProductsComposable.products.value = mockNewProducts;
    await nextTick();

    // Subsequent fetch should still work via API
    await composable.fetchProducts({});
    expect(mockProductsComposable.fetchProducts).toHaveBeenCalledTimes(2);
    expect(composable.products.value).toEqual(mockNewProducts);
  });

  it("should clean up old cache entries", async () => {
    const oldMeta = {
      lastUpdated: Date.now() - 1000 * 60 * 10, // 10 minutes ago (very expired)
      pagesCount: 1,
      totalProductsCount: 10,
      currentPage: 1,
    };

    mockProductsComposable.products.value = [...mockProducts];

    mockIndexedDB.getValue.mockImplementation((key: string) => {
      if (key === "products:{}" || (key.includes("products") && !key.includes(":meta"))) {
        return Promise.resolve(mockProducts);
      }
      if (key === "products:{}:meta" || key.includes(":meta")) {
        return Promise.resolve(oldMeta);
      }
      return Promise.resolve(null);
    });

    const composable = useProductsCached({ shouldUseCache: true });
    await composable.fetchProducts({});

    await flushPromises();

    // Should attempt to clean up old cache entries
    expect(mockIndexedDB.getAllKeys).toHaveBeenCalled();
    expect(mockIndexedDB.deleteValue).toHaveBeenCalled();
  });
});
