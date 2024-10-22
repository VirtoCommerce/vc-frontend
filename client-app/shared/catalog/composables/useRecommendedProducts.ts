import { ref, readonly } from "vue";
import { searchRecommendedProducts } from "@/core/api/graphql/catalog";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID_XRECOMMEND } from "@/core/constants/modules";
import { Logger } from "@/core/utilities";
import type { RecommendedProductsSearchParamsType } from "@/core/api/graphql/catalog";
import type { Product } from "@/core/api/graphql/types";

type RecommendedProductsType = { [key: string]: Product[] };

const RECOMMENDATIONS_ENABLED = "XRecommend.RecommendationsEnabled";

export function useRecommendedProducts() {
  const loading = ref(true);
  const recommendedProducts = ref<RecommendedProductsType>({});
  const { hasModuleSettings, isEnabled } = useModuleSettings(MODULE_ID_XRECOMMEND);

  async function fetchRecommendedProducts(paramsList: RecommendedProductsSearchParamsType[]) {
    loading.value = true;
    try {
      if (hasModuleSettings.value && isEnabled(RECOMMENDATIONS_ENABLED)) {
        const results = await Promise.allSettled(paramsList.map((params) => searchRecommendedProducts(params)));
        const successfulResults = results.reduce((acc, item, index) => {
          if (item.status === "fulfilled") {
            acc[paramsList[index].model] = item.value.products ?? [];
          } else {
            acc[paramsList[index].model] = [];
          }
          return acc;
        }, {} as RecommendedProductsType);
        recommendedProducts.value = successfulResults;
      } else {
        recommendedProducts.value = {};
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
    recommendedProducts: readonly(recommendedProducts),
  };
}
