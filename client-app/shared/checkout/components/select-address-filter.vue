<template>
  <div class="select-address-filter">
    <VcSelect
      v-model="filterCountry"
      :items="filterOptions?.countries ?? []"
      text-field="label"
      value-field="term"
      class="select-address-filter__filter-select"
      autocomplete
      clearable
      :placeholder="$t('common.labels.country')"
      :disabled="pickupLocationsLoading"
      @change="applyFilter"
    />

    <VcSelect
      v-model="filterRegion"
      :items="filterOptions?.regions ?? []"
      text-field="label"
      value-field="term"
      class="select-address-filter__filter-select"
      autocomplete
      clearable
      :placeholder="$t('common.labels.region')"
      :disabled="pickupLocationsLoading"
      @change="applyFilter"
    />

    <VcSelect
      v-model="filterCity"
      :items="filterOptions?.cities ?? []"
      text-field="label"
      value-field="term"
      class="select-address-filter__filter-select"
      autocomplete
      clearable
      :placeholder="$t('common.labels.city')"
      :disabled="pickupLocationsLoading"
      @change="applyFilter"
    />

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
import { useCartPickupLocations } from "@/shared/cart";

interface IEmits {
  (event: "applyFilter"): void;
}

const emit = defineEmits<IEmits>();

const { filterOptions, filterKeyword, filterCountry, filterRegion, filterCity, pickupLocationsLoading } =
  useCartPickupLocations();

function applyFilter() {
  emit("applyFilter");
}
</script>

<style lang="scss">
.select-address-filter {
  @apply flex flex-col items-center gap-2 pb-3;

  @media (min-width: theme("screens.md")) {
    @apply flex-row;
  }

  &__filter-select {
    @apply w-full;

    @media (min-width: theme("screens.md")) {
      @apply w-auto;
    }
  }

  &__filter-keyword {
    @apply grow w-full;

    @media (min-width: theme("screens.md")) {
      @apply w-auto;
    }
  }
}
</style>
