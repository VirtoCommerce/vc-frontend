import { Ref, ref, computed, readonly } from "vue";
import { searchRelatedProducts } from "@core/api/graphql/catalog";
import { Product } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";

export default () => {
  const loading: Ref<boolean> = ref(true);
  const relatedProducts: Ref<Product[]> = ref([]);

  async function fetchRelatedProducts(id: string) {
    loading.value = true;
    try {
      const associations = await searchRelatedProducts(id);
      relatedProducts.value = associations.map((x) => x.product!);
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
