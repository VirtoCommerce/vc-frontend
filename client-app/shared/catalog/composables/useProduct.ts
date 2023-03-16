import { ref, computed, readonly } from "vue";
import { Logger } from "@/core/utilities";
import { getProduct } from "@/xapi/graphql/catalog";
import type { Product } from "@/xapi/types";
import type { Ref } from "vue";

export default () => {
  const loading: Ref<boolean> = ref(true);
  const product: Ref<Product | null> = ref(null);

  async function loadProduct(id: string) {
    loading.value = true;
    try {
      product.value = await getProduct(id);
    } catch (e) {
      Logger.error("useProduct.loadProduct", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loadProduct,
    loading: readonly(loading),
    product: computed(() => product.value),
  };
};
