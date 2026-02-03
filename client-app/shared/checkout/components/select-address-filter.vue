<template>
  <div class="select-address-filter">
    <VcScrollbar class="select-address-filter__filter-container" horizontal no-bar>
      <div class="select-address-filter__filter-group">
        <FacetFilter
          v-if="filterOptionsCountries"
          ref="facetFilterCountriesRef"
          :facet="filterOptionsCountries"
          :filter="filterCountries"
          :disabled="!filterOptionsCountries.values?.length"
          mode="dropdown"
          data-test-id="filter-country"
          @update:filter="applyFilter"
        />

        <FacetFilter
          v-if="filterOptionsRegions"
          ref="facetFilterRegionsRef"
          :facet="filterOptionsRegions"
          :filter="filterRegions"
          :disabled="!filterOptionsRegions.values?.length"
          mode="dropdown"
          data-test-id="filter-region"
          @update:filter="applyFilter"
        />

        <FacetFilter
          v-if="filterOptionsCities"
          ref="facetFilterCitiesRef"
          :facet="filterOptionsCities"
          :filter="filterCities"
          :disabled="!filterOptionsCities.values?.length"
          mode="dropdown"
          data-test-id="filter-city"
          @update:filter="applyFilter"
        />

        <VcButton
          v-if="!filterSelectsAreEmpty"
          size="sm"
          color="secondary"
          variant="outline"
          no-wrap
          class="select-address-filter__clear-filter-mobile"
          @click="resetFilter"
        >
          {{ $t("common.buttons.reset_filters") }}
        </VcButton>
      </div>
    </VcScrollbar>

    <VcInput
      v-model="filterKeyword"
      :placeholder="$t('common.labels.search')"
      :aria-label="$t('common.labels.search')"
      size="sm"
      class="select-address-filter__filter-keyword"
      test-id-input="search-keyword-input"
      clearable
      :disabled="pickupLocationsLoading"
      @keyup.enter="applyFilter"
    >
      <template #append>
        <VcButton
          icon="search"
          :aria-label="$t('common.labels.search')"
          @click="applyFilter"
          :disabled="pickupLocationsLoading"
          data-test-id="search-button"
        />
      </template>
    </VcInput>
  </div>

  <div v-if="!filterSelectsAreEmpty" class="select-address-filter__applied-filter">
    <template v-for="value in filterCountries?.termValues" :key="value.value">
      <VcChip
        color="secondary"
        closable
        :data-test-id="`filter-country-${value.value}`"
        @close="removeFilterCountry(value.value)"
      >
        {{ value.value }}
      </VcChip>
    </template>

    <template v-for="value in filterRegions?.termValues" :key="value.value">
      <VcChip
        color="secondary"
        closable
        :data-test-id="`filter-region-${value.value}`"
        @close="removeFilterRegion(value.value)"
      >
        {{ value.value }}
      </VcChip>
    </template>

    <template v-for="value in filterCities?.termValues" :key="value.value">
      <VcChip
        color="secondary"
        closable
        :data-test-id="`filter-city-${value.value}`"
        @close="removeFilterCity(value.value)"
      >
        {{ value.value }}
      </VcChip>
    </template>

    <VcChip color="secondary" variant="outline" clickable data-test-id="reset-filters-chip" @click="resetFilter">
      <span>{{ $t("common.buttons.reset_filters") }}</span>

      <VcIcon name="reset" />
    </VcChip>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { CITY_FACET, COUNTRY_NAME_FACET, REGION_NAME_FACET, useCartPickupLocations } from "@/shared/cart";
import { FacetFilter } from "@/shared/catalog";
import type { FacetFilterType } from "@/core/types";

interface IEmits {
  (event: "applyFilter"): void;
}

const emit = defineEmits<IEmits>();

const {
  filterOptionsCountries,
  filterOptionsRegions,
  filterOptionsCities,

  filterCountries,
  filterRegions,
  filterCities,
  filterKeyword,

  filterSelectsAreEmpty,
  clearFilter,
  pickupLocationsLoading,
} = useCartPickupLocations();

const facetFilterCountriesRef = useTemplateRef<InstanceType<typeof FacetFilter>>("facetFilterCountriesRef");
const facetFilterRegionsRef = useTemplateRef<InstanceType<typeof FacetFilter>>("facetFilterRegionsRef");
const facetFilterCitiesRef = useTemplateRef<InstanceType<typeof FacetFilter>>("facetFilterCitiesRef");

function resetFacetSearchAndApply() {
  facetFilterCountriesRef.value?.resetSearch();
  facetFilterRegionsRef.value?.resetSearch();
  facetFilterCitiesRef.value?.resetSearch();
  emit("applyFilter");
}

function applyFilter(changedFilter?: FacetFilterType) {
  if (changedFilter?.name === COUNTRY_NAME_FACET) {
    filterCountries.value = changedFilter;
  }

  if (changedFilter?.name === REGION_NAME_FACET) {
    filterRegions.value = changedFilter;
  }

  if (changedFilter?.name === CITY_FACET) {
    filterCities.value = changedFilter;
  }

  resetFacetSearchAndApply();
}

function resetFilter() {
  clearFilter();
  resetFacetSearchAndApply();
}

function removeFilterCountry(value: string) {
  if (filterCountries.value?.termValues?.length) {
    filterCountries.value.termValues = filterCountries.value.termValues.filter((x) => x.value !== value);
  }
  resetFacetSearchAndApply();
}

function removeFilterRegion(value: string) {
  if (filterRegions.value?.termValues?.length) {
    filterRegions.value.termValues = filterRegions.value.termValues.filter((x) => x.value !== value);
  }
  resetFacetSearchAndApply();
}

function removeFilterCity(value: string) {
  if (filterCities.value?.termValues?.length) {
    filterCities.value.termValues = filterCities.value.termValues.filter((x) => x.value !== value);
  }
  resetFacetSearchAndApply();
}
</script>

<style lang="scss">
.select-address-filter {
  @apply flex items-center flex-wrap gap-2 pb-2;

  &__filter-container {
    @apply -mx-5;
  }

  &__filter-group {
    @apply inline-flex gap-2 px-5;
  }

  &__filter-keyword {
    @apply w-full;

    @media (min-width: theme("screens.md")) {
      @apply grow w-auto min-w-40;
    }
  }

  &__clear-filter-mobile {
    @media (min-width: theme("screens.md")) {
      @apply hidden;
    }
  }

  &__applied-filter {
    @apply hidden;

    @media (min-width: theme("screens.md")) {
      @apply flex flex-row flex-wrap gap-2 pb-3;
    }
  }
}
</style>
