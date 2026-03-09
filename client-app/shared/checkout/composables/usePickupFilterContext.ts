import { computed, inject, markRaw, provide, ref } from "vue";
import { useCartPickupLocations } from "@/shared/cart/composables";
import type { FacetFilterType, FacetItemType } from "@/core/types";
import type { ComputedRef, InjectionKey, Ref } from "vue";

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
    clearFilter,
    buildFilter,
  });
}
