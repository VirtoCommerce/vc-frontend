import { ref, computed, readonly, shallowRef } from "vue";
import { searchRelatedProducts } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import type { RelatedProductsSearchParamsType } from "@/core/api/graphql/catalog";
import type { Product } from "@/core/api/graphql/types";

export function useRelatedProducts() {
  const loading = ref(true);
  const relatedProducts = shallowRef<Product[]>([]);

  let latestRequest = 0;

  async function fetchRelatedProducts(params: RelatedProductsSearchParamsType) {
    const request = ++latestRequest;
    loading.value = true;
    relatedProducts.value = [];
    try {
      const associations = await searchRelatedProducts(params);
      // A slower answer for the previous product must not replace the current product's list.
      if (request === latestRequest) {
        relatedProducts.value = associations.map((association) => association.product!);
      }
    } catch (e) {
      Logger.error("useRelatedProducts.fetchRelatedProducts", e);
      throw e;
    } finally {
      if (request === latestRequest) {
        loading.value = false;
      }
    }
  }

  return {
    fetchRelatedProducts,
    loading: readonly(loading),
    relatedProducts: computed(() => [...relatedProducts.value]),
  };
}
