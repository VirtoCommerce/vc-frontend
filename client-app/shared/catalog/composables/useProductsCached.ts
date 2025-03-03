import { computed, readonly, ref, toRaw, watch } from "vue";
import { useIndexedDB } from "@/core/composables/useIndexedDB";
import { useProducts } from "./useProducts";
import type { FiltersDisplayOrderType, ProductsSearchParamsType } from "../types";
import type { Product } from "@/core/api/graphql/types";
import type { Ref } from "vue";

type MetaDataType = {
  lastUpdated?: number;
  pagesCount?: number;
  totalProductsCount?: number;
  currentPage?: number;
};

const CACHE_EXPIRATION_TIME = 1000 * 60 * 3; // 3 minutes

/**
 *
 */
export function useProductsCached(
  options: {
    /** @default false */
    withFacets?: boolean;
    /** @default config.image_carousel_in_product_card_enabled */
    withImages?: boolean;
    /** @default config.zero_price_product_enabled */
    withZeroPrice?: boolean;
    filtersDisplayOrder?: Ref<FiltersDisplayOrderType | undefined>;
    useQueryParams?: boolean;
    shouldUseCache?: boolean;
  } = {},
) {
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
  const { setValue, getValue } = useIndexedDB({ storeName: "products", dbName: "products-db" });

  watch(
    () => productsComposable.products.value,
    (newProducts) => {
      if (newProducts) {
        void setValue("products", newProducts.map(toRaw));
        void setValue("meta", {
          lastUpdated: Date.now(),
          pagesCount: productsComposable.pagesCount.value,
          totalProductsCount: productsComposable.totalProductsCount.value,
          currentPage: productsComposable.currentPage.value,
        });
      }
    },
    { deep: true },
  );

  const fetchProducts = async (params: Partial<ProductsSearchParamsType>, first?: number) => {
    if (isCacheLoaded.value) {
      await productsComposable.fetchProducts(params, first);
      isUsingLiveMetadata.value = true;
      return;
    }

    fetchingProducts.value = true;
    const cachedProducts = await getValue<Product[]>("products");
    const cachedMetaData = await getValue<MetaDataType>("meta");

    if (cachedProducts) {
      products.value = cachedProducts ?? [];
      metaData.value = cachedMetaData ?? {};
    }

    fetchingProducts.value = false;
    isCacheLoaded.value = true;
    const isOutdated = !metaData.value.lastUpdated || metaData.value.lastUpdated < Date.now() - CACHE_EXPIRATION_TIME;

    if (isOutdated || !products.value.length) {
      await productsComposable.fetchProducts(params, products.value.length || undefined);
      isUsingLiveMetadata.value = true;
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
