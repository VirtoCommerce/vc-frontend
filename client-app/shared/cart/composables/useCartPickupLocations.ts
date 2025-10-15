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

const COUNTRY_NAME_FACET = "address_countryname";
const REGION_NAME_FACET = "address_regionname";
const CITY_FACET = "address_city";

export type PickupLocationsFilterOptionsType = {
  countries: FacetTermType[];
  regions: FacetTermType[];
  cities: FacetTermType[];
};

export function _useCartPickupLocations() {
  const pickupLocationsLoading = ref(false);

  const pickupLocations = ref<ProductPickupLocation[]>([]);
  const termFacets = ref<TermFacet[] | undefined>();

  const filterOptions = computed(
    () =>
      ({
        countries: termFacets.value?.find((f) => f.name === COUNTRY_NAME_FACET)?.terms ?? [],
        regions: termFacets.value?.find((f) => f.name === REGION_NAME_FACET)?.terms ?? [],
        cities: termFacets.value?.find((f) => f.name === CITY_FACET)?.terms ?? [],
      }) as PickupLocationsFilterOptionsType,
  );

  const filterKeyword = ref<string>("");
  const filterCountry = ref<string | undefined>();
  const filterRegion = ref<string | undefined>();
  const filterCity = ref<string | undefined>();

  const filterApplied = ref(false);

  function buildFilter(): string | undefined {
    if (filterCity.value) {
      return `${CITY_FACET}:"${filterCity.value}"`;
    }
    if (filterRegion.value) {
      return `${REGION_NAME_FACET}:"${filterRegion.value}"`;
    }
    if (filterCountry.value) {
      return `${COUNTRY_NAME_FACET}:"${filterCountry.value}"`;
    }
    return undefined;
  }

  function resetFilter() {
    filterKeyword.value = "";
    filterCountry.value = undefined;
    filterRegion.value = undefined;
    filterCity.value = undefined;
  }

  async function fetchPickupLocations(
    payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName" | "facet">,
  ) {
    pickupLocationsLoading.value = true;
    try {
      const data: ProductPickupLocationConnection = await getCartPickupLocations({
        facet: `${COUNTRY_NAME_FACET} ${REGION_NAME_FACET} ${CITY_FACET}`,
        ...payload,
      });
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

    filterOptions,
    filterKeyword,
    filterCountry,
    filterRegion,
    filterCity,
    filterApplied,
    buildFilter,
    resetFilter,
  };
}

export const useCartPickupLocations = createSharedComposable(_useCartPickupLocations);
