import { computed, readonly, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useIndexedDB } from "@/core/composables/useIndexedDB";
import { useProducts } from "./useProducts";
import type { FiltersDisplayOrderType, ProductsSearchParamsType } from "../types";
import type { Product } from "@/core/api/graphql/types";
import type { Ref } from "vue";

/**
 * A wrapper around useProducts that provides the same functionality.
 * This composable will be extended with additional features in the future.
 *
 * Stores products in IndexedDB when they change.
 */
export function useStatefulProducts(
  options: {
    /** @default false */
    withFacets?: boolean;
    /** @default config.image_carousel_in_product_card_enabled */
    withImages?: boolean;
    /** @default config.zero_price_product_enabled */
    withZeroPrice?: boolean;
    filtersDisplayOrder?: Ref<FiltersDisplayOrderType | undefined>;
    useQueryParams?: boolean;
  } = {},
) {
  // Get products from useProducts
  const productsComposable = useProducts(options);
  const products = ref<Product[]>([]);
  const fetchingProducts = ref(false);
  const route = useRoute();

  // const statefulMode: boolean = route.meta.isBack ?? false;
  const statefulMode = ref(true);

  // Set up IndexedDB storage
  const { setValue, getValue } = useIndexedDB({ storeName: "products", dbName: "products-db" });

  // Watch for changes in products and store them in IndexedDB
  watch(
    () => productsComposable.products.value,
    (newProducts) => {
      if (newProducts) {
        try {
          // Serialize the products data before storing
          const serializedProducts = JSON.parse(JSON.stringify(newProducts)) as typeof newProducts;
          void setValue("current", serializedProducts);
        } catch (err) {
          console.error("Error serializing products for IndexedDB:", err);
        }
      }
    },
    { deep: true },
  );

  const fetchProducts = async (params: Partial<ProductsSearchParamsType>) => {
    fetchingProducts.value = true;
    const cachedProducts = await getValue("current");
    if (cachedProducts) {
      products.value = cachedProducts as Product[];
    }
    console.log("loaded from cache");
    await productsComposable.fetchProducts(params);
    statefulMode.value = false;
    fetchingProducts.value = false;
  };

  return {
    ...productsComposable,
    fetchingProducts: readonly(
      computed(() => (statefulMode.value ? fetchingProducts.value : productsComposable.fetchingProducts.value)),
    ),
    products: computed(() => (statefulMode.value ? products.value : productsComposable.products.value)),
    fetchProducts: statefulMode.value ? fetchProducts : productsComposable.fetchProducts,
  };
}
