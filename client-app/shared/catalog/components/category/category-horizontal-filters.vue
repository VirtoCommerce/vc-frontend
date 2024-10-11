<template>
  <ProductsFilters
    class="category-horizontal-filters"
    orientation="horizontal"
    :keyword="keywordQueryParam"
    :filters="filters"
    :loading="loading"
    @change="$emit('applyFilters', $event)"
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
        <template #trigger>
          <VcButton
            size="sm"
            variant="outline"
            prepend-icon="switch-vertical"
            class="category-horizontal-filters__sorting-trigger"
          >
            {{ $t("common.buttons.sort_by") }}
          </VcButton>
        </template>

        <template #content="{ close }">
          <VcMenuItem
            v-for="sortingOption in PRODUCT_SORTING_LIST"
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
              @change="
                () => {
                  emit('applySort');
                  close();
                }
              "
              @click.stop
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
import type { ProductsFiltersType } from "@/shared/catalog";
import ProductsFilters from "@/shared/catalog/components/products-filters.vue";

const emit = defineEmits<IEmits>();
withDefaults(defineProps<IProps>(), {
  hideAllFilters: false,
  hideSorting: false,
});

interface IEmits {
  (event: "applyFilters", filters: ProductsFiltersType): void;
  (event: "applySort"): void;
  (event: "showPopupSidebar"): void;
}

interface IProps {
  loading: boolean;
  keywordQueryParam: string;
  filters: ProductsFiltersType;
  hideSorting?: boolean;
  hideAllFilters?: boolean;
}

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
});

function sortingItemClickHandler(id: string, close: () => void) {
  sortQueryParam.value = id;
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
