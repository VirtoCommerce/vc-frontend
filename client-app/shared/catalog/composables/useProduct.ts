import { ref, computed, readonly } from "vue";
import { getProduct } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import { productsInWishlistEvent, useBroadcast } from "@/shared/broadcast";
import type { GetProductQuery } from "@/core/api/graphql/types";
import type { ProductInWishlistEventDataType } from "@/shared/broadcast";
import type { Ref } from "vue";

export function useProduct() {
  const fetching: Ref<boolean> = ref(true);
  const product: Ref<GetProductQuery["product"] | undefined> = ref();

  const broadcast = useBroadcast();

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

  broadcast.on(productsInWishlistEvent, (eventItems: ProductInWishlistEventDataType[]) => {
    eventItems.forEach(({ productId, inWishlist }) => {
      if (product.value && product.value.id === productId) {
        product.value = { ...product.value, inWishlist };
      }
    });
  });

  return {
    fetchProduct,
    fetching: readonly(fetching),
    product: computed(() => product.value),
  };
}
