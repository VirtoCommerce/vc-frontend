import { ref } from "vue";
import { getCartPickupLocations } from "@/core/api/graphql/cart";
import { Logger } from "@/core/utilities";
import type { ProductPickupLocation } from "@/core/api/graphql/types";

export function useCartPickupLocations() {
  const MAX_LOCATIONS_COUNT = 20;

  const pickupLocationsLoading = ref(false);

  const pickupLocations = ref<ProductPickupLocation[]>([]);

  async function fetchPickupLocations(cartId: string) {
    pickupLocationsLoading.value = true;
    try {
      const data = await getCartPickupLocations({ cartId, first: MAX_LOCATIONS_COUNT });
      pickupLocations.value = data.items ?? [];
    } catch (e) {
      Logger.error(`${useCartPickupLocations.name}.${fetchPickupLocations.name}`, e);
      throw e;
    } finally {
      pickupLocationsLoading.value = false;
    }
  }
  return {
    pickupLocationsLoading,
    pickupLocations,
    fetchPickupLocations,
  };
}
