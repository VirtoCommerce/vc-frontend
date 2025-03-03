import omit from "lodash/omit";
import { computed, readonly, ref, toRaw } from "vue";
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
const CACHE_KEY_PRODUCTS_PREFIX = "products";
const CACHE_KEY_META_PREFIX = "meta";
const STORE_NAME = "products";
const DB_NAME = "products-db";

function getCacheKey(params: Partial<ProductsSearchParamsType>): string {
  return JSON.stringify(omit(params, "page"));
}

function getMetaData(data: ReturnType<typeof useProducts>): MetaDataType {
  return {
    pagesCount: data.pagesCount.value,
    totalProductsCount: data.totalProductsCount.value,
    currentPage: data.currentPage.value,
  };
}

/**
 *
 */
export function useProductsCached(options: Parameters<typeof useProducts>[0] & { shouldUseCache?: boolean } = {}) {
  const productsComposable = useProducts(options);
  const shouldUseCache = options.shouldUseCache ?? false;

  const { setValue, getValue, deleteValue, getAllKeys } = useIndexedDB({
    storeName: STORE_NAME,
    dbName: DB_NAME,
  });

  const products = ref<Product[]>([]);
  const metaData = ref<MetaDataType>({});
  const readingProductsFromCache = ref(false);
  const isCacheLoaded = ref(false);
  const isUsingLiveMetadata = ref(false);

  const allProducts = computed(() => [...(products.value ?? []), ...(productsComposable.products.value ?? [])]);
  const fetchingProducts = computed(() =>
    isCacheLoaded.value ? productsComposable.fetchingProducts.value : readingProductsFromCache.value,
  );
  const totalProductsCount = computed(() =>
    isUsingLiveMetadata.value ? productsComposable.totalProductsCount.value : (metaData.value.totalProductsCount ?? 0),
  );
  const currentPage = computed(() =>
    isUsingLiveMetadata.value ? productsComposable.currentPage.value : (metaData.value.currentPage ?? 1),
  );
  const pagesCount = computed(() =>
    isUsingLiveMetadata.value ? productsComposable.pagesCount.value : (metaData.value.pagesCount ?? 1),
  );

  async function storeInCache(cacheKey: string, productsData: Product[], metadata: MetaDataType): Promise<void> {
    try {
      await setValue(`${CACHE_KEY_PRODUCTS_PREFIX}:${cacheKey}`, productsData.map(toRaw));
      await setValue(`${CACHE_KEY_META_PREFIX}:${cacheKey}`, {
        ...metadata,
        lastUpdated: Date.now(),
      });

      void cleanupOldCache();
    } catch (err) {
      console.error("Error storing products in cache:", err);
    }
  }

  async function cleanupOldCache(): Promise<void> {
    const keys = await getAllKeys();
    const now = Date.now();

    for (const key of keys) {
      const keyString = String(key);
      if (keyString.includes(CACHE_KEY_META_PREFIX)) {
        const meta = await getValue<MetaDataType>(keyString);
        if (meta?.lastUpdated && now - meta.lastUpdated > CACHE_EXPIRATION_TIME * 2) {
          const baseKey = keyString.replace(CACHE_KEY_META_PREFIX, CACHE_KEY_PRODUCTS_PREFIX);
          await deleteValue(baseKey);
          await deleteValue(keyString);
        }
      }
    }
  }

  async function fetchWithApi(params: Partial<ProductsSearchParamsType>, first?: number) {
    const cacheKey = getCacheKey(params);
    await productsComposable.fetchProducts(params, first);
    void storeInCache(cacheKey, productsComposable.products.value, getMetaData(productsComposable));
    isUsingLiveMetadata.value = true;
  }

  async function fetchFromCache(params: Partial<ProductsSearchParamsType>) {
    const cacheKey = getCacheKey(params);
    readingProductsFromCache.value = true;

    const cachedProducts = await getValue<Product[]>(`${CACHE_KEY_PRODUCTS_PREFIX}:${cacheKey}`);
    const cachedMetaData = await getValue<MetaDataType>(`${CACHE_KEY_META_PREFIX}:${cacheKey}`);

    if (cachedProducts) {
      products.value = cachedProducts ?? [];
      metaData.value = cachedMetaData ?? {};
    }

    readingProductsFromCache.value = false;
    isCacheLoaded.value = true;
  }

  const fetchProducts = async (params: Partial<ProductsSearchParamsType>, first?: number) => {
    if (isCacheLoaded.value || !shouldUseCache) {
      await fetchWithApi(params, first);
      return;
    }

    await fetchFromCache(params);

    const isOutdated = !metaData.value.lastUpdated || metaData.value.lastUpdated < Date.now() - CACHE_EXPIRATION_TIME;

    if (isOutdated || !products.value.length) {
      await fetchWithApi(params, products.value.length || undefined);
    }
  };

  const fetchMoreProducts = async (params: Partial<ProductsSearchParamsType>) => {
    const nextPage = (metaData.value.currentPage ?? 1) + 1;
    await productsComposable.fetchMoreProducts({ ...params, page: isUsingLiveMetadata.value ? params.page : nextPage });
    isUsingLiveMetadata.value = true;
    void storeInCache(getCacheKey(params), allProducts.value, getMetaData(productsComposable));
  };

  return {
    ...productsComposable,
    fetchingProducts: readonly(fetchingProducts),
    products: allProducts,
    pagesCount: readonly(pagesCount),
    totalProductsCount: readonly(totalProductsCount),
    currentPage: readonly(currentPage),
    fetchProducts,
    fetchMoreProducts,
  };
}
