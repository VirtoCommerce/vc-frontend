import { Ref, ref, computed, watch, readonly } from "vue";
import { getProduct } from "@core/api/graphql/catalog";
import { Product } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import { useCart } from "@/shared/cart";
import _ from "lodash";

export default () => {
  const loading: Ref<boolean> = ref(true);
  const product: Ref<Product | null> = ref(null);
  const variationsCartTotal = ref(0);

  const { loading: cartLoading, getItemsTotal } = useCart();

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

  //calculation of total price of variations in the cart
  watch(
    () => !cartLoading.value && !loading.value,
    (condition) => {
      if (condition && product.value?.variations?.length) {
        const variationsIds = _(product.value.variations)
          .filter((x) => !!x?.id)
          .map((x) => x?.id as string)
          .value();

        variationsIds.push(product.value.id);

        variationsCartTotal.value = getItemsTotal(variationsIds);
      }
    }
  );

  return {
    loadProduct,
    loading: readonly(loading),
    product: computed(() => product.value),
    variationsCartTotal: computed(() => variationsCartTotal.value),
  };
};
