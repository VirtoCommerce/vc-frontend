import { ref } from "vue";
import { getProductPickupLocations } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import type { ProductPickupLocation } from "@/core/api/graphql/types";

const PRODUCT_ITEMS_COUNT = 5;

export function useProductPickupLocations() {
  const productPickupLocationsLoading = ref(false);

  const productPickupLocations = ref<ProductPickupLocation[]>([]);

  async function fetchProductPickupLocations(productId: string) {
    productPickupLocationsLoading.value = true;
    try {
      const data = await getProductPickupLocations({ productId, first: PRODUCT_ITEMS_COUNT });
      productPickupLocations.value = data.items ?? [];
    } catch (e) {
      Logger.error(`${useProductPickupLocations.name}.${fetchProductPickupLocations.name}`, e);
      throw e;
    } finally {
      productPickupLocationsLoading.value = false;
    }
  }
  return {
    productPickupLocationsLoading,
    productPickupLocations,
    fetchProductPickupLocations,
  };
}
