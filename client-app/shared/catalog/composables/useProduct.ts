import { ref, computed, readonly } from "vue";
import { getProduct } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { Ref } from "vue";

export function useProduct() {
  const loading: Ref<boolean> = ref(true);
  const product: Ref<Product | undefined> = ref();

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
}
