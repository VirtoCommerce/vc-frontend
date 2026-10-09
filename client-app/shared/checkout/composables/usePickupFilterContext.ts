import { computed, inject, markRaw, provide, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCartPickupLocations } from "@/shared/cart/composables";
import type { FacetFilterType, FacetItemType, FacetValueItemType } from "@/core/types";
import type { ComputedRef, InjectionKey, Ref } from "vue";

type AddressTermFacetType = { name: string; terms: Array<{ term: string; label: string; count: number }> };

export interface IPickupFilterContext {
  filterOptionsCountries: Ref<FacetItemType | undefined>;
  filterOptionsRegions: Ref<FacetItemType | undefined>;
  filterOptionsCities: Ref<FacetItemType | undefined>;
  filterCountries: Ref<FacetFilterType | undefined>;
  filterRegions: Ref<FacetFilterType | undefined>;
  filterCities: Ref<FacetFilterType | undefined>;
  filterKeyword: Ref<string>;
  filterSelectsAreEmpty: ComputedRef<boolean>;
  filterIsApplied: Ref<boolean>;
  pickupLocationsLoading: Ref<boolean>;
  searchAriaLabelKey: string;
  clearFilter: () => void;
  buildFilter: () => string | undefined;
}

export const PICKUP_FILTER_KEY: InjectionKey<IPickupFilterContext> = Symbol("pickupFilterContext");

export function providePickupFilterContext(context: IPickupFilterContext): void {
  provide(PICKUP_FILTER_KEY, markRaw(context));
}

export function usePickupFilterContext(): IPickupFilterContext {
  const context = inject(PICKUP_FILTER_KEY);

  if (!context) {
    throw new Error("usePickupFilterContext: no filter context provided. Wrap with providePickupFilterContext.");
  }

  return context;
}

export function createCartFilterContext(): IPickupFilterContext {
  const {
    filterOptionsCountries,
    filterOptionsRegions,
    filterOptionsCities,
    filterCountries,
    filterRegions,
    filterCities,
    filterKeyword,
    filterSelectsAreEmpty,
    filterIsApplied,
    pickupLocationsLoading,
    clearFilter,
    buildFilter,
  } = useCartPickupLocations();

  return markRaw({
    filterOptionsCountries,
    filterOptionsRegions,
    filterOptionsCities,
    filterCountries,
    filterRegions,
    filterCities,
    filterKeyword,
    filterSelectsAreEmpty,
    filterIsApplied,
    pickupLocationsLoading,
    searchAriaLabelKey: "pages.account.order_details.bopis.search_pickup_locations",
    clearFilter,
    buildFilter,
  });
}

const ADDRESS_COUNTRY_FACET = "CountryCode";
const ADDRESS_REGION_FACET = "RegionId";
const ADDRESS_CITY_FACET = "City";

export function createAddressFilterContext(options: {
  loading: Ref<boolean>;
  termFacets: Ref<AddressTermFacetType[]>;
}): IPickupFilterContext {
  const { t } = useI18n();

  const filterKeyword = ref("");
  const filterIsApplied = ref(false);

  const filterCountries = ref<FacetFilterType | undefined>(undefined);
  const filterRegions = ref<FacetFilterType | undefined>(undefined);
  const filterCities = ref<FacetFilterType | undefined>(undefined);

  function toFacetItem(facet: AddressTermFacetType, label: string): FacetItemType {
    return {
      type: "terms",
      label,
      paramName: facet.name,
      values: facet.terms
        .map<FacetValueItemType>((term) => ({
          count: term.count,
          label: term.label,
          value: term.term,
          selected: false,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  }

  const filterOptionsCountries = computed<FacetItemType | undefined>(() => {
    const facet = options.termFacets.value.find((f) => f.name === ADDRESS_COUNTRY_FACET);
    return facet ? toFacetItem(facet, t("common.labels.country")) : undefined;
  });

  const filterOptionsRegions = computed<FacetItemType | undefined>(() => {
    const facet = options.termFacets.value.find((f) => f.name === ADDRESS_REGION_FACET);
    return facet ? toFacetItem(facet, t("common.labels.region")) : undefined;
  });

  const filterOptionsCities = computed<FacetItemType | undefined>(() => {
    const facet = options.termFacets.value.find((f) => f.name === ADDRESS_CITY_FACET);
    return facet ? toFacetItem(facet, t("common.labels.city")) : undefined;
  });

  const filterSelectsAreEmpty = computed(
    () =>
      !(
        filterCountries.value?.termValues?.length ||
        filterRegions.value?.termValues?.length ||
        filterCities.value?.termValues?.length
      ),
  );

  function clearFilter() {
    filterKeyword.value = "";
    filterCountries.value = undefined;
    filterRegions.value = undefined;
    filterCities.value = undefined;
    filterIsApplied.value = false;
  }

  function buildFilter(): string | undefined {
    return undefined;
  }

  return markRaw({
    filterOptionsCountries,
    filterOptionsRegions,
    filterOptionsCities,
    filterCountries,
    filterRegions,
    filterCities,
    filterKeyword,
    filterSelectsAreEmpty,
    filterIsApplied,
    pickupLocationsLoading: options.loading,
    searchAriaLabelKey: "shared.checkout.select_address_modal.search_addresses_aria_label",
    clearFilter,
    buildFilter,
  });
}

export function createProductFilterContext(options: { loading: Ref<boolean> }): IPickupFilterContext {
  const filterKeyword = ref("");
  const filterIsApplied = ref(false);

  const filterOptionsCountries = ref<FacetItemType | undefined>(undefined);
  const filterOptionsRegions = ref<FacetItemType | undefined>(undefined);
  const filterOptionsCities = ref<FacetItemType | undefined>(undefined);

  const filterCountries = ref<FacetFilterType | undefined>(undefined);
  const filterRegions = ref<FacetFilterType | undefined>(undefined);
  const filterCities = ref<FacetFilterType | undefined>(undefined);

  const filterSelectsAreEmpty = computed(() => true);

  function clearFilter() {
    filterKeyword.value = "";
    filterIsApplied.value = false;
  }

  function buildFilter(): string | undefined {
    return undefined;
  }

  return markRaw({
    filterOptionsCountries,
    filterOptionsRegions,
    filterOptionsCities,
    filterCountries,
    filterRegions,
    filterCities,
    filterKeyword,
    filterSelectsAreEmpty,
    filterIsApplied,
    pickupLocationsLoading: options.loading,
    searchAriaLabelKey: "pages.account.order_details.bopis.search_pickup_locations",
    clearFilter,
    buildFilter,
  });
}
