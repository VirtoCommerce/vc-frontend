import { ref } from "vue";
import { getProductPickupLocations } from "@/core/api/graphql/catalog";
import { Logger } from "@/core/utilities";
import type { ProductPickupLocation, QueryProductPickupLocationsArgs } from "@/core/api/graphql/types";

export function useProductPickupLocations() {
  const pickupLocationsLoading = ref(false);

  const pickupLocations = ref<ProductPickupLocation[]>([]);

  async function fetchPickupLocations(payload: Omit<QueryProductPickupLocationsArgs, "storeId" | "cultureName">) {
    pickupLocationsLoading.value = true;
    try {
      const data = await getProductPickupLocations(payload);
      pickupLocations.value = data.items ?? [];
    } catch (e) {
      Logger.error(`${useProductPickupLocations.name}.${fetchPickupLocations.name}`, e);
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
