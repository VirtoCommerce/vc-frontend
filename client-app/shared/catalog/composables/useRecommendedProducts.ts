import { ref, computed, readonly } from "vue";
import { searchRecommendedProducts } from "@/core/api/graphql/catalog";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID_XRECOMMEND } from "@/core/constants/modules";
import { Logger } from "@/core/utilities";
import type { RecommendedProductsSearchParamsType } from "@/core/api/graphql/catalog";
import type { Product } from "@/core/api/graphql/types";

const RECOMMENDATIONS_ENABLED = "XRecommend.RecommendationsEnabled";

export function useRecommendedProducts() {
  const loading = ref(true);
  const recommendedProducts = ref<Product[]>([]);
  const { hasModuleSettings, isEnabled } = useModuleSettings(MODULE_ID_XRECOMMEND);

  async function fetchRecommendedProducts(params: RecommendedProductsSearchParamsType) {
    loading.value = true;
    try {
      if (hasModuleSettings.value && isEnabled(RECOMMENDATIONS_ENABLED)) {
        const associations = await searchRecommendedProducts(params);
        recommendedProducts.value = associations.products ?? [];
      } else {
        recommendedProducts.value = [];
      }
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
