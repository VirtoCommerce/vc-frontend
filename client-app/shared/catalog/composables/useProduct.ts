import { useLocalStorage } from "@vueuse/core";
import { ref, computed, readonly } from "vue";
import { getProduct } from "@/core/api/graphql/catalog";
import { NAVIGATION_OUTLINE } from "@/core/constants";
import { Logger } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { Ref } from "vue";

export function useProduct() {
  const fetching: Ref<boolean> = ref(true);
  const product: Ref<Product | undefined> = ref();
  const navigationOutline = useLocalStorage<string>(NAVIGATION_OUTLINE, "");

  async function fetchProduct(id: string) {
    fetching.value = true;
    try {
      product.value = await getProduct(id, navigationOutline.value);
      navigationOutline.value = product.value?.outline;
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
