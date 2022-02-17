import { ref, computed, readonly, shallowRef } from "vue";
import { searchRelatedProducts, RelatedProductsSearchParams } from "@core/api/graphql/catalog";
import { Product } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";

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
