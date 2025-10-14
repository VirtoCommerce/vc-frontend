import { ref } from "vue";
import { getCartPickupLocations } from "@/core/api/graphql/cart";
import { Logger } from "@/core/utilities";
import type {
  ProductPickupLocation,
  QueryCartPickupLocationsArgs,
  TermFacet,
  ProductPickupLocationConnection,
} from "@/core/api/graphql/types";

export function useCartPickupLocations() {
  const pickupLocationsLoading = ref(false);

  const pickupLocations = ref<ProductPickupLocation[]>([]);
  const termFacets = ref<TermFacet[] | undefined>();

  async function fetchPickupLocations(payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName">) {
    pickupLocationsLoading.value = true;
    try {
      const data: ProductPickupLocationConnection = await getCartPickupLocations(payload);
      pickupLocations.value = data.items ?? [];
      termFacets.value =
        (data as ProductPickupLocationConnection & { term_facets?: TermFacet[] }).term_facets ?? undefined;
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
    termFacets,
    fetchPickupLocations,
  };
}
