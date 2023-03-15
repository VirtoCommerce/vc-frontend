import { ref, computed, readonly, shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import { searchRelatedProducts } from "@/xapi/graphql/catalog";
import type { RelatedProductsSearchParams } from "@/xapi/graphql/catalog";
import type { Product } from "@/xapi/types";

export default () => {
  const loading = ref(true);
  const relatedProducts = shallowRef<Product[]>([]);

  async function fetchRelatedProducts(params: RelatedProductsSearchParams) {
    loading.value = true;
    try {
      const associations = await searchRelatedProducts(params);
      relatedProducts.value = associations.map((association) => association.product!);
    } catch (e) {
      Logger.error("useRelatedProducts.fetchRelatedProducts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchRelatedProducts,
    loading: readonly(loading),
    relatedProducts: computed(() => relatedProducts.value),
  };
};
