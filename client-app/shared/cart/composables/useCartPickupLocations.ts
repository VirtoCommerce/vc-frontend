import { createSharedComposable } from "@vueuse/core";
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

export function _useCartPickupLocations() {
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

  const filterKeyword = ref<string>("");
  const filterCountry = ref<string | undefined>();
  const filterRegion = ref<string | undefined>();
  const filterCity = ref<string | undefined>();

  const filterApplied = ref(false);

  function buildFilter(): string | undefined {
    if (filterCity.value) {
      return `address_city:"${filterCity.value}"`;
    }
    if (filterRegion.value) {
      return `address_regionname:"${filterRegion.value}"`;
    }
    if (filterCountry.value) {
      return `address_countryname:"${filterCountry.value}"`;
    }
    return undefined;
  }

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
    fetchPickupLocations,

    pickupLocationsFilterOptions,
    filterKeyword,
    filterCountry,
    filterRegion,
    filterCity,
    filterApplied,
    buildFilter,
  };
}

export const useCartPickupLocations = createSharedComposable(_useCartPickupLocations);
