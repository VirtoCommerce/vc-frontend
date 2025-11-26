<template>
  <div class="select-address-filter">
    <div class="select-address-filter__filter-group">
      <FacetFilter
        v-if="filterOptionsCountries"
        :facet="filterOptionsCountries"
        :filter="filterCountries"
        :disabled="!filterOptionsCountries.values?.length"
        mode="dropdown"
        @update:filter="applyFilter"
        data-test-id="select-address-filter-countries"
      />

      <FacetFilter
        v-if="filterOptionsRegions"
        :facet="filterOptionsRegions"
        :filter="filterRegions"
        :disabled="!filterOptionsRegions.values?.length"
        mode="dropdown"
        @update:filter="applyFilter"
        data-test-id="select-address-filter-regions"
      />

      <FacetFilter
        v-if="filterOptionsCities"
        :facet="filterOptionsCities"
        :filter="filterCities"
        :disabled="!filterOptionsCities.values?.length"
        mode="dropdown"
        @update:filter="applyFilter"
        data-test-id="select-address-filter-cities"
      />

      <VcButton
        v-if="!filterSelectsAreEmpty"
        size="sm"
        color="secondary"
        variant="outline"
        no-wrap
        class="select-address-filter__clear-filter-mobile"
        @click="resetFilter"
        data-test-id="select-address-filter-reset-button-mobile"
      >
        {{ $t("common.buttons.reset_filters") }}
      </VcButton>
    </div>

    <VcInput
      v-model="filterKeyword"
      :placeholder="$t('common.labels.search')"
      :aria-label="$t('common.labels.search')"
      size="sm"
      class="select-address-filter__filter-keyword"
      clearable
      :disabled="pickupLocationsLoading"
      @keyup.enter="applyFilter"
      test-id-input="select-address-filter-keyword-input"
    >
      <template #append>
        <VcButton
          icon="search"
          :aria-label="$t('common.labels.search')"
          @click="applyFilter"
          :disabled="pickupLocationsLoading"
          data-test-id="select-address-filter-apply-button"
        />
      </template>
    </VcInput>
  </div>

  <div v-if="!filterSelectsAreEmpty" class="select-address-filter__applied-filter">
    <template v-for="value in filterCountries?.termValues" :key="value">
      <VcChip color="secondary" closable @close="removeFilterCountry(value.value)">
        {{ value.value }}
      </VcChip>
    </template>

    <template v-for="value in filterRegions?.termValues" :key="value">
      <VcChip color="secondary" closable @close="removeFilterRegion(value.value)">
        {{ value.value }}
      </VcChip>
    </template>

    <template v-for="value in filterCities?.termValues" :key="value">
      <VcChip color="secondary" closable @close="removeFilterCity(value.value)">
        {{ value.value }}
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

  emit("applyFilter");
}

function resetFilter() {
  clearFilter();
  emit("applyFilter");
}

function removeFilterCountry(value: string) {
  if (filterCountries.value?.termValues?.length) {
    filterCountries.value.termValues = filterCountries.value.termValues.filter((x) => x.value !== value);
  }
  emit("applyFilter");
}

function removeFilterRegion(value: string) {
  if (filterRegions.value?.termValues?.length) {
    filterRegions.value.termValues = filterRegions.value.termValues.filter((x) => x.value !== value);
  }
  emit("applyFilter");
}

function removeFilterCity(value: string) {
  if (filterCities.value?.termValues?.length) {
    filterCities.value.termValues = filterCities.value.termValues.filter((x) => x.value !== value);
  }
  emit("applyFilter");
}
</script>

<style lang="scss">
.select-address-filter {
  @apply flex flex-row items-center flex-wrap gap-2 pt-0 pb-3;

  &__filter-group {
    @apply flex flex-row items-center gap-2 overflow-x-auto;
  }

  &__filter-keyword {
    @apply grow w-full min-w-[10rem];

    @media (min-width: theme("screens.md")) {
      @apply w-auto;
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
