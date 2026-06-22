<template>
  <ProductsFilters
    class="category-horizontal-filters"
    orientation="horizontal"
    :filters="filters"
    :loading="loading"
    @change:filters="$emit('change:filters', $event)"
  >
    <template #prepend>
      <VcButton
        v-if="!hideAllFilters"
        size="sm"
        variant="outline"
        class="category-horizontal-filters__show-all"
        prepend-icon="filter"
        @click="$emit('showPopupSidebar')"
      >
        {{ $t("common.buttons.all_filters") }}
      </VcButton>

      <VcDropdownMenu
        v-if="!hideSorting"
        :offset-options="4"
        class="category-horizontal-filters__sorting"
        max-height="20rem"
        width="15rem"
        z-index="3"
      >
        <template #trigger="{ triggerProps }">
          <VcButton
            size="sm"
            variant="outline"
            prepend-icon="switch-vertical"
            class="category-horizontal-filters__sorting-trigger"
            v-bind="triggerProps"
          >
            {{ $t("common.buttons.sort_by") }}
          </VcButton>
        </template>

        <template #content="{ close }">
          <VcMenuItem
            v-for="sortingOption in translatedProductSortingList"
            :key="sortingOption.id"
            class="category-horizontal-filters__sorting-input"
            color="secondary"
            size="sm"
            @click="sortingItemClickHandler(sortingOption.id, close)"
          >
            <VcRadioButton
              v-model="sortQueryParam"
              size="sm"
              :value="sortingOption.id"
              :label="sortingOption.name"
              class="category-horizontal-filters__sorting-input"
            />
          </VcMenuItem>
        </template>
      </VcDropdownMenu>
    </template>
  </ProductsFilters>
</template>

<script setup lang="ts">
import { useRouteQueryParam } from "@/core/composables";
import { PRODUCT_SORTING_LIST } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { useProductSortDefinitions } from "@/shared/catalog/composables/useProductSortDefinitions";
import type { SearchProductFilterResult } from "@/core/api/graphql/types";
import type { ProductsFiltersType } from "@/shared/catalog";
import ProductsFilters from "@/shared/catalog/components/products-filters.vue";

const emit = defineEmits<IEmits>();
withDefaults(defineProps<IProps>(), {
  hideAllFilters: false,
  hideSorting: false,
});

interface IEmits {
  (event: "change:filters", filters: SearchProductFilterResult[]): void;
  (event: "applySort"): void;
  (event: "showPopupSidebar"): void;
}

interface IProps {
  loading: boolean;
  filters: ProductsFiltersType;
  hideSorting?: boolean;
  hideAllFilters?: boolean;
}

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  // Sort codes are store-defined (dynamic) and resolved server-side, so accept any token-shaped value.
  validator: (value) => /^[a-z0-9-_]*$/i.test(value),
});

const { sortList: translatedProductSortingList } = useProductSortDefinitions();

function sortingItemClickHandler(id: string, close: () => void) {
  sortQueryParam.value = id;
  emit("applySort");
  close();
}
</script>

<style lang="scss">
.category-horizontal-filters {
  @apply mb-4.5;

  &__show-all {
    @apply shrink-0;
  }

  &__sorting {
    @apply shrink-0;
  }
}
</style>
