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
        @click="$emit('showPopupSidebar')"
      >
        <template #prepend>
          <VcIcon name="filter" class="category-horizontal-filters__show-all-icon" />
        </template>
        {{ $t("common.buttons.all_filters") }}</VcButton
      >

      <VcDropdownMenu
        v-if="!hideSorting"
        :offset-options="4"
        class="category-horizontal-filters__sorting"
        max-height="20rem"
      >
        <template #trigger>
          <VcButton size="sm" variant="outline" class="category-horizontal-filters__sorting-trigger">
            <template #prepend>
              <VcIcon name="switch-vertical" class="category-horizontal-filters__sorting-trigger-icon" />
            </template>
            {{ $t("common.buttons.sort_by") }}</VcButton
          >
        </template>
        <template #content="{ close }">
          <div class="py-2">
            <VcMenuItem
              v-for="sortingOption in PRODUCT_SORTING_LIST"
              :key="sortingOption.id"
              class="category-horizontal-filters__sorting-list"
              color="secondary"
              size="sm"
            >
              <VcRadioButton
                v-model="sortQueryParam"
                size="sm"
                :value="sortingOption.id"
                :label="sortingOption.name"
                class="category-horizontal-filters__sorting-item"
                @change="close"
              />
            </VcMenuItem>
          </div>
        </template>
      </VcDropdownMenu>
    </template>
  </ProductsFilters>
</template>

<script setup lang="ts">
import { useRouteQueryParam } from "@/core/composables";
import { PRODUCT_SORTING_LIST } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import type { ProductsFilters as ProductsFiltersType } from "@/shared/catalog";
import ProductsFilters from "@/shared/catalog/components/products-filters.vue";

defineEmits<IEmits>();
withDefaults(defineProps<IProps>(), {
  hideAllFilters: false,
  hideSorting: false,
});

interface IEmits {
  (event: "applyFilters", filters: ProductsFiltersType): void;
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
</script>

<style lang="scss">
.category-horizontal-filters {
  @apply mb-4.5;

  &__show-all {
    @apply shrink-0;
  }

  &__show-all-icon {
    @apply mr-2;
  }

  &__sorting {
    @apply z-10;
  }

  &__sorting-trigger {
    @apply shrink-0;
  }

  &__sorting-trigger-icon {
    @apply mr-2;
  }

  &__sorting-list {
    @apply border-none;
  }

  &__sorting-item {
    @apply pl-1 pr-5;
  }

  .vc-menu-item__inner {
    @apply p-0;
  }

  .vc-radio-button {
    @apply py-2 ps-4 pe-8;
  }
}
</style>
