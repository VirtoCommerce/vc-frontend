import { ref } from "vue";
import { getCartPickupLocations } from "@/core/api/graphql/cart";
import { Logger } from "@/core/utilities";
import type { ProductPickupLocation, QueryCartPickupLocationsArgs } from "@/core/api/graphql/types";

export function useCartPickupLocations() {
  const pickupLocationsLoading = ref(false);

  const pickupLocations = ref<ProductPickupLocation[]>([]);

  async function fetchPickupLocations(payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName">) {
    pickupLocationsLoading.value = true;
    try {
      const data = await getCartPickupLocations(payload);
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
