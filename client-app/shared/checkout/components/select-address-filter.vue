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
      size="sm"
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

  <div v-if="!filterSelectsAreEmpty" class="select-address-applied-filter">
    <template v-for="value in filterCountries" :key="value">
      <VcChip color="secondary" closable @close="removeFilterCountry(value)">
        {{ value }}
      </VcChip>
    </template>

    <template v-for="value in filterRegions" :key="value">
      <VcChip color="secondary" closable @close="removeFilterRegion(value)">
        {{ value }}
      </VcChip>
    </template>

    <template v-for="value in filterCities" :key="value">
      <VcChip color="secondary" closable @close="removeFilterCity(value)">
        {{ value }}
      </VcChip>
    </template>

    <VcChip color="secondary" variant="outline" clickable @click="resetFilter">
      <span>{{ $t("common.buttons.reset_filters") }}</span>

      <VcIcon name="reset" />
    </VcChip>
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

  filterCountries,
  filterRegions,
  filterCities,
  filterKeyword,

  filterSelectsAreEmpty,
  clearFilter,
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

function resetFilter() {
  clearFilter();
  emit("applyFilter");
}

function removeFilterCountry(value: string) {
  filterCountries.value = filterCountries.value.filter((x) => x !== value);
  emit("applyFilter");
}

function removeFilterRegion(value: string) {
  filterRegions.value = filterRegions.value.filter((x) => x !== value);
  emit("applyFilter");
}

function removeFilterCity(value: string) {
  filterCities.value = filterCities.value.filter((x) => x !== value);
  emit("applyFilter");
}
</script>

<style lang="scss">
.select-address-filter {
  @apply flex flex-row items-center gap-2 pt-0 pb-3;
  overflow-x: auto;

  &__filter-keyword {
    @apply grow w-full min-w-[10rem];

    @media (min-width: theme("screens.md")) {
      @apply w-auto;
    }
  }
}

.select-address-applied-filter {
  @apply flex flex-row flex-wrap gap-2 pb-3;
}
</style>
