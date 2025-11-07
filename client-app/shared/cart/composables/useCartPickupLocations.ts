import { createSharedComposable } from "@vueuse/core";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getCartPickupLocations } from "@/core/api/graphql/cart";
import { Logger, termFacetToCommonFacet } from "@/core/utilities";
import type { ProductPickupLocation, QueryCartPickupLocationsArgs } from "@/core/api/graphql/types";
import type { FacetItemType } from "@/core/types";

export const COUNTRY_NAME_FACET = "address_countryname";
export const REGION_NAME_FACET = "address_regionname";
export const CITY_FACET = "address_city";

export function _useCartPickupLocations() {
  const { t } = useI18n();

  const pickupLocationsLoading = ref(false);

  const pickupLocations = ref<ProductPickupLocation[]>([]);

  const filterOptionsCountries = ref<FacetItemType>();
  const filterOptionsRegions = ref<FacetItemType>();
  const filterOptionsCities = ref<FacetItemType>();

  const filterCountries = ref<string[]>([]);
  const filterRegions = ref<string[]>([]);
  const filterCities = ref<string[]>([]);
  const filterKeyword = ref<string>("");

  const filterSelectsAreEmpty = computed(
    () => !(filterCountries.value.length || filterRegions.value.length || filterCities.value.length),
  );

  const filterIsApplied = ref(false);

  function buildFilter(): string | undefined {
    const resultItems = [];

    if (filterCities.value?.length) {
      resultItems.push(`${CITY_FACET}:"${filterCities.value.join('","')}"`);
    }

    if (filterRegions.value?.length) {
      resultItems.push(`${REGION_NAME_FACET}:"${filterRegions.value.join('","')}"`);
    }

    if (filterCountries.value?.length) {
      resultItems.push(`${COUNTRY_NAME_FACET}:"${filterCountries.value.join('","')}"`);
    }
    console.warn("buildFilter", resultItems);
    return resultItems.join(" ");
  }

  function clearFilter() {
    filterCountries.value = [];
    filterRegions.value = [];
    filterCities.value = [];
    filterKeyword.value = "";
  }

  async function fetchPickupLocations(
    payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName" | "facet">,
  ) {
    pickupLocationsLoading.value = true;
    try {
      const data = await getCartPickupLocations({
        facet: `${COUNTRY_NAME_FACET} ${REGION_NAME_FACET} ${CITY_FACET}`,
        ...payload,
      });
      pickupLocations.value = data.items ?? [];

      const termFacetCounties = data.term_facets?.find((f) => f.name === COUNTRY_NAME_FACET);
      if (termFacetCounties) {
        filterOptionsCountries.value = termFacetToCommonFacet(termFacetCounties);
        filterOptionsCountries.value.label = t("common.labels.country");
      }

      const termFacetRegions = data.term_facets?.find((f) => f.name === REGION_NAME_FACET);
      if (termFacetRegions) {
        filterOptionsRegions.value = termFacetToCommonFacet(termFacetRegions);
        filterOptionsRegions.value.label = t("common.labels.region");
      }

      const termFacetCities = data.term_facets?.find((f) => f.name === CITY_FACET);
      if (termFacetCities) {
        filterOptionsCities.value = termFacetToCommonFacet(termFacetCities);
        filterOptionsCities.value.label = t("common.labels.city");
      }
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

    filterOptionsCountries,
    filterOptionsRegions,
    filterOptionsCities,

    filterCountries,
    filterRegions,
    filterCities,
    filterKeyword,

    filterSelectsAreEmpty,
    filterIsApplied,
    buildFilter,
    clearFilter,
  };
}

export const useCartPickupLocations = createSharedComposable(_useCartPickupLocations);
