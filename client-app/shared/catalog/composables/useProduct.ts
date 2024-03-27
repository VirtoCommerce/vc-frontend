import { ref, computed, readonly, triggerRef, shallowRef } from "vue";
import { getProduct, getProductWishlistIds } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import { productsInWishlistEvent, useBroadcast } from "@/shared/broadcast";
import type { Product } from "@/core/api/graphql/types";
import type { ProductInWishlistEventDataType } from "@/shared/broadcast";
import type { Ref, ShallowRef } from "vue";

export function useProduct() {
  const loading: Ref<boolean> = ref(true);
  const product: ShallowRef<Product | undefined> = shallowRef();
  const productWishlistIds: ShallowRef<string[] | undefined> = shallowRef();

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

  async function fetchProductWishlistIds(productId: string): Promise<void> {
    loading.value = true;

    try {
      productWishlistIds.value = await getProductWishlistIds(productId);
    } catch (e) {
      Logger.error(`${useProduct.name}.${fetchProductWishlistIds.name}`, e);
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
    fetchProductWishlistIds,
    loading: readonly(loading),
    product: computed(() => product.value),
    productWishlistIds: computed(() => productWishlistIds.value),
  };
}
