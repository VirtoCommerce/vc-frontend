import { ref, computed } from "vue";
import { getCartPickupLocations } from "@/core/api/graphql/cart";
import { Logger } from "@/core/utilities";
import type {
  ProductPickupLocation,
  QueryCartPickupLocationsArgs,
  TermFacet,
  ProductPickupLocationConnection,
  FacetTermType,
} from "@/core/api/graphql/types";

export type PickupLocationsFilterOptionsType = {
  countries: FacetTermType[];
  regions: FacetTermType[];
  cities: FacetTermType[];
};

export function useCartPickupLocations() {
  const pickupLocationsLoading = ref(false);

  const pickupLocations = ref<ProductPickupLocation[]>([]);
  const termFacets = ref<TermFacet[] | undefined>();

  const pickupLocationsFilterOptions = computed(
    () =>
      ({
        countries: termFacets.value?.find((f) => f.name === "address_countryname")?.terms ?? [],
        regions: termFacets.value?.find((f) => f.name === "address_regionname")?.terms ?? [],
        cities: termFacets.value?.find((f) => f.name === "address_city")?.terms ?? [],
      }) as PickupLocationsFilterOptionsType,
  );

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
    pickupLocationsFilterOptions,
    fetchPickupLocations,
  };
}
