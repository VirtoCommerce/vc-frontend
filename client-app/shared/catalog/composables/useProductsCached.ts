import { computed, readonly, ref, toRaw, watch } from "vue";
import { useIndexedDB } from "@/core/composables/useIndexedDB";
import { useProducts } from "./useProducts";
import type { ProductsSearchParamsType } from "../types";
import type { Product } from "@/core/api/graphql/types";

type MetaDataType = {
  lastUpdated?: number;
  pagesCount?: number;
  totalProductsCount?: number;
  currentPage?: number;
};

const CACHE_EXPIRATION_TIME = 1000 * 60 * 3; // 3 minutes

function getCacheKey(params: Partial<ProductsSearchParamsType>): string {
  return `products:${JSON.stringify(params)}`;
}

/**
 *
 */
export function useProductsCached(options: Parameters<typeof useProducts>[0] & { shouldUseCache?: boolean } = {}) {
  const productsComposable = useProducts(options);
  const shouldUseCache = options.shouldUseCache ?? false;

  const products = ref<Product[]>([]);
  const metaData = ref<MetaDataType>({});

  if (!shouldUseCache) {
    return productsComposable;
  }

  const fetchingProducts = ref(false);
  const isCacheLoaded = ref(false);
  const isUsingLiveMetadata = ref(false);

  const { setValue, getValue, deleteValue, getAllKeys } = useIndexedDB({
    storeName: "products",
    dbName: "products-db",
  });

  async function storeInCache(cacheKey: string, productsData: Product[], metadata: MetaDataType): Promise<void> {
    try {
      console.log("storeInCache", cacheKey, productsData, metadata);
      await setValue(cacheKey, productsData.map(toRaw));
      await setValue(`${cacheKey}:meta`, {
        ...metadata,
        lastUpdated: Date.now(),
      });

      void cleanupOldCache();
    } catch (err) {
      console.error("Error storing products in cache:", err);
    }
  }

  watch(
    () => productsComposable.products.value,
    (newProducts) => {
      if (newProducts && newProducts.length > 0) {
        const metadata = {
          pagesCount: productsComposable.pagesCount.value,
          totalProductsCount: productsComposable.totalProductsCount.value,
          currentPage: productsComposable.currentPage.value,
        };
        void storeInCache("products", newProducts, metadata);
      }
    },
    { deep: true },
  );

  async function cleanupOldCache(): Promise<void> {
    const keys = await getAllKeys();
    console.log("cleanupOldCache", keys);
    const now = Date.now();

    for (const key of keys) {
      const keyString = String(key);
      if (keyString.includes(":meta")) {
        const meta = await getValue<MetaDataType>(keyString);
        if (meta?.lastUpdated && now - meta.lastUpdated > CACHE_EXPIRATION_TIME * 2) {
          const baseKey = keyString.replace(":meta", "");
          await deleteValue(baseKey);
          await deleteValue(keyString);
        }
      }
    }
  }

  const fetchProducts = async (params: Partial<ProductsSearchParamsType>, first?: number) => {
    const cacheKey = getCacheKey(params);

    if (isCacheLoaded.value) {
      await productsComposable.fetchProducts(params, first);
      const metadata = {
        pagesCount: productsComposable.pagesCount.value,
        totalProductsCount: productsComposable.totalProductsCount.value,
        currentPage: productsComposable.currentPage.value,
      };
      void storeInCache(cacheKey, productsComposable.products.value, metadata);
      isUsingLiveMetadata.value = true;
      return;
    }

    fetchingProducts.value = true;

    const cachedProducts = await getValue<Product[]>(cacheKey);
    const cachedMetaData = await getValue<MetaDataType>(`${cacheKey}:meta`);

    if (cachedProducts) {
      products.value = cachedProducts ?? [];
      metaData.value = cachedMetaData ?? {};
    }

    fetchingProducts.value = false;
    isCacheLoaded.value = true;

    const isOutdated = !metaData.value.lastUpdated || metaData.value.lastUpdated < Date.now() - CACHE_EXPIRATION_TIME;
    console.log("isOutdated", isOutdated);
    console.log("products.value", products.value);
    console.log("metaData.value.lastUpdated", metaData.value);

    if (isOutdated || !products.value.length) {
      await productsComposable.fetchProducts(params, products.value.length || undefined);
      isUsingLiveMetadata.value = true;

      if (productsComposable.products.value.length > 0) {
        const metadata = {
          pagesCount: productsComposable.pagesCount.value,
          totalProductsCount: productsComposable.totalProductsCount.value,
          currentPage: productsComposable.currentPage.value,
        };
        void storeInCache(cacheKey, productsComposable.products.value, metadata);
      }
    }
  };

  const fetchMoreProducts = async (params: Partial<ProductsSearchParamsType>) => {
    if (isUsingLiveMetadata.value) {
      await productsComposable.fetchMoreProducts(params);
      return;
    }
    await productsComposable.fetchMoreProducts({ ...params, page: (metaData.value.currentPage ?? 1) + 1 });
  };

  return {
    ...productsComposable,
    fetchingProducts: readonly(
      computed(() => (isCacheLoaded.value ? productsComposable.fetchingProducts.value : fetchingProducts.value)),
    ),
    products: computed(() => [...(products.value ?? []), ...(productsComposable.products.value ?? [])]),
    pagesCount: computed(() =>
      isUsingLiveMetadata.value ? productsComposable.pagesCount.value : (metaData.value.pagesCount ?? 1),
    ),
    totalProductsCount: computed(() =>
      isUsingLiveMetadata.value
        ? productsComposable.totalProductsCount.value
        : (metaData.value.totalProductsCount ?? 0),
    ),
    currentPage: computed(() =>
      isUsingLiveMetadata.value ? productsComposable.currentPage.value : (metaData.value.currentPage ?? 1),
    ),
    fetchProducts,
    fetchMoreProducts,
  };
}
