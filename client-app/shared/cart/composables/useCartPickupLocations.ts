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

  const committedKeyword = ref<string | undefined>(undefined);
  const committedFilter = ref<string | undefined>(undefined);

  // Monotonic, never reset (guards below compare by equality).
  // fetchGeneration: bumps on successful reset — arbitrates fetch-vs-loadMore.
  // fetchToken: bumps on every reset entry — arbitrates fetch-vs-fetch (last-started wins).
  const fetchGeneration = ref(0);
  const fetchToken = ref(0);

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
    const requestToken = ++fetchToken.value;
    pickupLocationsLoading.value = true;

    try {
      const data = await getCartPickupLocations({
        facet: PICKUP_LOCATIONS_FACET,
        ...payload,
      });

      // Superseded by a newer reset: drop this response.
      if (fetchToken.value !== requestToken) {
        return;
      }

      // Bump on success, not on entry: a failed fetch must not invalidate a valid in-flight loadMore.
      fetchGeneration.value++;

      pickupLocations.value = data.items ?? [];
      pickupLocationsTotalCount.value = data.totalCount ?? 0;

      pickupLocationsEndCursor.value = data.pageInfo?.endCursor ?? undefined;
      pickupLocationsHasNextPage.value = data.pageInfo?.hasNextPage ?? false;

      // This reset supersedes any in-flight loadMore, so its spinner is done.
      pickupLocationsLoadingMore.value = false;

      // loadMore reads this snapshot, never the live filter refs.
      committedKeyword.value = payload.keyword;
      committedFilter.value = payload.filter;

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
      // Only the last-started fetch surfaces its error and owns the loading flag.
      if (fetchToken.value === requestToken) {
        Logger.error(`${useCartPickupLocations.name}.${fetchPickupLocations.name}`, e);
        throw e;
      }
    } finally {
      if (fetchToken.value === requestToken) {
        pickupLocationsLoading.value = false;
      }
    }
  }

  async function loadMorePickupLocations(
    payload: Omit<QueryCartPickupLocationsArgs, "storeId" | "cultureName" | "facet" | "after" | "keyword" | "filter">,
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
        keyword: committedKeyword.value,
        filter: committedFilter.value,
        after: pickupLocationsEndCursor.value,
      });

      // Superseded by a reset: a stale loadMore must have zero observable effect.
      if (fetchGeneration.value !== requestGeneration) {
        return;
      }

      // keep-first dedup (BL-BOPIS-008): a duplicate on a later page must not overwrite items[0].
      pickupLocations.value = uniqBy([...pickupLocations.value, ...(data.items ?? [])], (item) => item.id);

      pickupLocationsEndCursor.value = data.pageInfo?.endCursor ?? undefined;
      pickupLocationsHasNextPage.value = data.pageInfo?.hasNextPage ?? false;
    } catch (e) {
      // Only the current generation surfaces its error and owns the spinner.
      if (fetchGeneration.value === requestGeneration) {
        Logger.error(`${useCartPickupLocations.name}.${loadMorePickupLocations.name}`, e);
        throw e;
      }
    } finally {
      if (fetchGeneration.value === requestGeneration) {
        pickupLocationsLoadingMore.value = false;
      }
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
