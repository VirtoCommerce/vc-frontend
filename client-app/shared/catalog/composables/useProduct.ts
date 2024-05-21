import { ref, computed, readonly, triggerRef, shallowRef } from "vue";
import { getProduct } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import { productsInWishlistEvent, useBroadcast } from "@/shared/broadcast";
import type { GetProductQuery } from "@/core/api/graphql/types";
import type { ProductInWishlistEventDataType } from "@/shared/broadcast";
import type { Ref, ShallowRef } from "vue";

export function useProduct() {
  const loading: Ref<boolean> = ref(true);
  const product: ShallowRef<GetProductQuery["product"] | undefined> = shallowRef();

  const broadcast = useBroadcast();

  async function loadProduct(id: string) {
    loading.value = true;
    try {
      product.value = await getProduct(id);
    } catch (e) {
      Logger.error(`${useProduct.name}.${loadProduct.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  broadcast.on(productsInWishlistEvent, (eventItems: ProductInWishlistEventDataType[]) => {
    let trigger = false;

    eventItems.forEach(({ productId, inWishlist }) => {
      if (product.value && product.value.id === productId) {
        product.value = { ...product.value, inWishlist };
        trigger = true;
      }
    });

    if (trigger) {
      triggerRef(product);
    }
  });

  return {
    loadProduct,
    loading: readonly(loading),
    product: computed(() => product.value),
  };
}
