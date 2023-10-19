import { ref, computed, readonly, shallowRef, triggerRef } from "vue";
import { searchRelatedProducts } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import { productsInWishlistEvent, useBroadcast } from "@/shared/broadcast";
import type { RelatedProductsSearchParamsType } from "@/core/api/graphql/catalog";
import type { Product } from "@/core/api/graphql/types";
import type { ProductInWishlistEventDataType } from "@/shared/broadcast";

export function useRelatedProducts() {
  const broadcast = useBroadcast();

  const loading = ref(true);
  const relatedProducts = shallowRef<Product[]>([]);

  const productsById = computed(() =>
    relatedProducts.value.reduce(
      (result, product, index) => {
        result[product.id] = { index, product };
        return result;
      },
      {} as Record<string, { index: number; product: Product }>,
    ),
  );

  async function fetchRelatedProducts(params: RelatedProductsSearchParamsType) {
    loading.value = true;
    try {
      const associations = await searchRelatedProducts(params);
      relatedProducts.value = associations.map((association) => association.product!);
    } catch (e) {
      Logger.error("useRelatedProducts.fetchRelatedProducts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  broadcast.on(productsInWishlistEvent, (eventItems: ProductInWishlistEventDataType[]) => {
    let trigger = false;

    eventItems.forEach(({ productId, inWishlist }) => {
      const { index, product } = productsById.value[productId] ?? {};

      if (product) {
        relatedProducts.value.splice(index, 1, { ...product, inWishlist });
        trigger = true;
      }
    });

    if (trigger) {
      triggerRef(relatedProducts);
    }
  });

  return {
    fetchRelatedProducts,
    loading: readonly(loading),
    relatedProducts: computed(() => [...relatedProducts.value]),
  };
}
