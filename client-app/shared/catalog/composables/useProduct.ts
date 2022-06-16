import { Ref, ref, computed, readonly } from "vue";
import { getProduct } from "@/xapi/graphql/catalog";
import { Product } from "@/xapi/graphql/types";
import { Logger } from "@core/utilities";

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
