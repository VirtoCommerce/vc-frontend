<template>
  <div class="select-address-filter">
    <FacetFilter
      v-if="filterOptionsCountries"
      :facet="filterOptionsCountries"
      mode="dropdown"
      @update:filter="applyFilter"
    />

    <FacetFilter
      v-if="filterOptionsRegions"
      :facet="filterOptionsRegions"
      mode="dropdown"
      @update:filter="applyFilter"
    />

    <FacetFilter v-if="filterOptionsCities" :facet="filterOptionsCities" mode="dropdown" @update:filter="applyFilter" />

    <VcInput
      v-model="filterKeyword"
      :placeholder="$t('common.labels.search')"
      :aria-label="$t('common.labels.search')"
      class="select-address-filter__filter-keyword"
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
        />
      </template>
    </VcInput>
  </div>
</template>

<script setup lang="ts">
import { CITY_FACET, COUNTRY_NAME_FACET, REGION_NAME_FACET, useCartPickupLocations } from "@/shared/cart";
import { FacetFilter } from "@/shared/catalog";
import type { FacetFilterChangeType } from "@/core/types";

interface IEmits {
  (event: "applyFilter"): void;
}

const emit = defineEmits<IEmits>();

const {
  filterOptionsCountries,
  filterOptionsRegions,
  filterOptionsCities,
  filterKeyword,
  filterCountries,
  filterRegions,
  filterCities,
  pickupLocationsLoading,
} = useCartPickupLocations();

function applyFilter(changedFilter?: FacetFilterChangeType) {
  if (changedFilter?.name === COUNTRY_NAME_FACET) {
    filterCountries.value = changedFilter.termValues?.map((x) => x.value) ?? [];
  }
  if (changedFilter?.name === REGION_NAME_FACET) {
    filterRegions.value = changedFilter.termValues?.map((x) => x.value) ?? [];
  }
  if (changedFilter?.name === CITY_FACET) {
    filterCities.value = changedFilter.termValues?.map((x) => x.value) ?? [];
  }

  emit("applyFilter");
}
</script>

<style lang="scss">
.select-address-filter {
  @apply flex flex-col items-center gap-2 pb-3;

  @media (min-width: theme("screens.md")) {
    @apply flex-row;
  }

  &__filter-keyword {
    @apply grow w-full;

    @media (min-width: theme("screens.md")) {
      @apply w-auto;
    }
  }
}
</style>
