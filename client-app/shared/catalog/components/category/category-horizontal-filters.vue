<template>
  <ProductsFilters
    class="mb-4.5"
    orientation="horizontal"
    :keyword="keywordQueryParam"
    :filters="filters"
    :loading="loading"
    @change="$emit('applyFilters', $event)"
  >
    <template #prepend>
      <VcButton size="sm" variant="outline" class="shrink-0" @click="$emit('showPopupSidebar')">
        <template #prepend>
          <VcIcon name="filter" class="mr-2" />
        </template>
        {{ $t("common.buttons.all_filters") }}</VcButton
      >

      <VcDropdownMenu :offset-options="4" class="z-10" max-height="20rem">
        <template #trigger>
          <VcButton size="sm" variant="outline" class="shrink-0">
            <template #prepend>
              <VcIcon name="switch-vertical" class="mr-2" />
            </template>
            {{ $t("common.buttons.sort_by") }}</VcButton
          >
        </template>
        <template #content="{ close }">
          <div class="py-2">
            <VcMenuItem
              v-for="sortingOption in PRODUCT_SORTING_LIST"
              :key="sortingOption.id"
              class="border-none"
              color="secondary"
              size="sm"
            >
              <VcRadioButton
                v-model="sortQueryParam"
                size="sm"
                :value="sortingOption.id"
                :label="sortingOption.name"
                class="pl-1 pr-5"
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
defineProps<IProps>();

interface IEmits {
  (event: "applyFilters", filters: ProductsFiltersType): void;
  (event: "showPopupSidebar"): void;
}

interface IProps {
  loading: boolean;
  keywordQueryParam: string;
  filters: ProductsFiltersType;
}

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
});
</script>

<style scoped lang="scss">
:deep(.vc-menu-item__inner) {
  @apply p-0;
}

:deep(.vc-radio-button) {
  @apply py-2 ps-4 pe-8;
}
</style>
