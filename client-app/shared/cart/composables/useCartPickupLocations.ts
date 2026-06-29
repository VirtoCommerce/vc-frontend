import { createSharedComposable } from "@vueuse/core";
import uniqBy from "lodash/uniqBy";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getCartPickupLocations } from "@/core/api/graphql/cart";
import { Logger, termFacetToCommonFacet } from "@/core/utilities";
import type { ProductPickupLocation, QueryCartPickupLocationsArgs } from "@/core/api/graphql/types";
import type { FacetFilterType, FacetItemType } from "@/core/types";

export const COUNTRY_NAME_FACET = "address_countryname";
export const REGION_NAME_FACET = "address_regionname";
export const CITY_FACET = "address_city";

const PICKUP_LOCATIONS_FACET = `${COUNTRY_NAME_FACET} ${REGION_NAME_FACET} ${CITY_FACET}`;

export function _useCartPickupLocations() {
  const { t } = useI18n();

  const pickupLocationsLoading = ref(false);
  const pickupLocationsLoadingMore = ref(false);

  const pickupLocations = ref<ProductPickupLocation[]>([]);

  const filterOptionsCountries = ref<FacetItemType>();
  const filterOptionsRegions = ref<FacetItemType>();
  const filterOptionsCities = ref<FacetItemType>();

  const filterCountries = ref<FacetFilterType>();
  const filterRegions = ref<FacetFilterType>();
  const filterCities = ref<FacetFilterType>();
  const filterKeyword = ref<string>("");

  const pickupLocationsTotalCount = ref(0);

  const pickupLocationsEndCursor = ref<string | undefined>(undefined);
  const pickupLocationsHasNextPage = ref(false);

  const fetchGeneration = ref(0);

  const filterSelectsAreEmpty = computed(
    () =>
      !(
        filterCountries.value?.termValues?.length ||
        filterRegions.value?.termValues?.length ||
        filterCities.value?.termValues?.length
      ),
  );

  const filterIsApplied = ref(false);

  function buildFilter(): string | undefined {
    const resultItems = [];

    if (filterCities.value?.termValues?.length) {
      resultItems.push(`${CITY_FACET}:"${filterCities.value.termValues.map((x) => x.value).join('","')}"`);
    }

    if (filterRegions.value?.termValues?.length) {
      resultItems.push(`${REGION_NAME_FACET}:"${filterRegions.value.termValues.map((x) => x.value).join('","')}"`);
    }

    if (filterCountries.value?.termValues?.length) {
      resultItems.push(`${COUNTRY_NAME_FACET}:"${filterCountries.value.termValues.map((x) => x.value).join('","')}"`);
    }

    return resultItems.join(" ");
  }

  function clearFilter() {
    filterCountries.value = undefined;
    filterRegions.value = undefined;
    filterCities.value = undefined;
    filterKeyword.value = "";
  }

  async function fetchPickupLocations(
    payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName" | "facet">,
  ) {
    pickupLocationsLoading.value = true;

    try {
      const data = await getCartPickupLocations({
        facet: PICKUP_LOCATIONS_FACET,
        ...payload,
      });

      // Bug guard (race): bump the generation on SUCCESS, not on entry. A failed fetch leaves the
      // old data intact, so a concurrent loadMore's append to that old data stays valid and must not
      // be dropped. A successful fetch bumps here — strictly before replacing the list, with no await
      // in between — so a concurrent loadMore that resolves later is correctly discarded by the guard.
      fetchGeneration.value++;

      pickupLocations.value = data.items ?? [];
      pickupLocationsTotalCount.value = data.totalCount ?? 0;

      pickupLocationsEndCursor.value = data.pageInfo?.endCursor ?? undefined;
      pickupLocationsHasNextPage.value = data.pageInfo?.hasNextPage ?? false;

      const termFacetCounties = data.term_facets?.find((f) => f.name === COUNTRY_NAME_FACET);
      if (termFacetCounties) {
        filterOptionsCountries.value = termFacetToCommonFacet(termFacetCounties);
        filterOptionsCountries.value.label = t("common.labels.country");
      } else {
        filterOptionsCountries.value = {
          type: "terms",
          paramName: COUNTRY_NAME_FACET,
          values: [],
          label: t("common.labels.country"),
        };
      }

      const termFacetRegions = data.term_facets?.find((f) => f.name === REGION_NAME_FACET);
      if (termFacetRegions) {
        filterOptionsRegions.value = termFacetToCommonFacet(termFacetRegions);
        filterOptionsRegions.value.label = t("common.labels.region");
      } else {
        filterOptionsRegions.value = {
          type: "terms",
          paramName: REGION_NAME_FACET,
          values: [],
          label: t("common.labels.region"),
        };
      }

      const termFacetCities = data.term_facets?.find((f) => f.name === CITY_FACET);
      if (termFacetCities) {
        filterOptionsCities.value = termFacetToCommonFacet(termFacetCities);
        filterOptionsCities.value.label = t("common.labels.city");
      } else {
        filterOptionsCities.value = {
          type: "terms",
          paramName: CITY_FACET,
          values: [],
          label: t("common.labels.city"),
        };
      }
    } catch (e) {
      Logger.error(`${useCartPickupLocations.name}.${fetchPickupLocations.name}`, e);
      throw e;
    } finally {
      pickupLocationsLoading.value = false;
    }
  }

  async function loadMorePickupLocations(
    payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName" | "facet" | "after">,
  ) {
    if (pickupLocationsLoading.value || pickupLocationsLoadingMore.value || !pickupLocationsHasNextPage.value) {
      return;
    }

    pickupLocationsLoadingMore.value = true;
    const requestGeneration = fetchGeneration.value;
    try {
      const data = await getCartPickupLocations({
        facet: PICKUP_LOCATIONS_FACET,
        ...payload,
        after: pickupLocationsEndCursor.value,
      });

      // Bug guard (race): if a fetchPickupLocations started after this loadMore began, its
      // generation bump makes this response stale. Drop it without touching the list/cursor.
      if (fetchGeneration.value !== requestGeneration) {
        return;
      }

      // keep-first dedup (BL-BOPIS-008): a prepended confirmed location at items[0] must win
      // over a duplicate arriving on a later page, so the FIRST occurrence is retained.
      pickupLocations.value = uniqBy([...pickupLocations.value, ...(data.items ?? [])], (item) => item.id);

      pickupLocationsEndCursor.value = data.pageInfo?.endCursor ?? undefined;
      pickupLocationsHasNextPage.value = data.pageInfo?.hasNextPage ?? false;
    } catch (e) {
      Logger.error(`${useCartPickupLocations.name}.${loadMorePickupLocations.name}`, e);
      throw e;
    } finally {
      pickupLocationsLoadingMore.value = false;
    }
  }

  return {
    pickupLocationsLoading,
    pickupLocationsLoadingMore,
    pickupLocations,
    pickupLocationsTotalCount,
    pickupLocationsHasNextPage,
    fetchPickupLocations,
    loadMorePickupLocations,

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
