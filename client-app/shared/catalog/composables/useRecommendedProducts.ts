import { ref, computed, readonly } from "vue";
import { searchRecommendedProducts } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import type { RecommendedProductsSearchParamsType } from "@/core/api/graphql/catalog";
import type { Product } from "@/core/api/graphql/types";

export function useRecommendedProducts() {
  const loading = ref(true);
  const recommendedProducts = ref<Product[]>([]);

  async function fetchRecommendedProducts(params: RecommendedProductsSearchParamsType) {
    loading.value = true;
    try {
      const associations = await searchRecommendedProducts(params);
      recommendedProducts.value = associations.products ?? [];
    } catch (e) {
      Logger.error("useRecommendedProducts.fetchRecommendedProducts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchRecommendedProducts,
    loading: readonly(loading),
    recommendedProducts: computed(() => [...recommendedProducts.value]),
  };
}
