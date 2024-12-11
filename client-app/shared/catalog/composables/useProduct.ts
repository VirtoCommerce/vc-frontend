import { ref, computed, readonly } from "vue";
import { getProduct } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import type { GetProductQuery } from "@/core/api/graphql/types";
import type { Ref } from "vue";

export function useProduct() {
  const fetching: Ref<boolean> = ref(true);
  const product: Ref<GetProductQuery["product"] | undefined> = ref();

  async function fetchProduct(id: string) {
    fetching.value = true;
    try {
      product.value = await getProduct(id);
    } catch (e) {
      Logger.error(`${useProduct.name}.${fetchProduct.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  return {
    fetchProduct,
    fetching: readonly(fetching),
    product: computed(() => product.value),
  };
}
