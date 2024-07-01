<template>
  <VcPopupSidebar
    :class="[!isMobile && 'desktop-popup-sidebar w-[358px]']"
    :is-visible="isVisible"
    @hide="$emit('hidePopupSidebar')"
  >
    <template v-if="!isMobile" #header>
      <div class="text-2xl font-bold">
        {{ $t("common.buttons.allFilters") }}
      </div>
      <button type="button" class="appearance-none px-5 py-4" @click="$emit('hidePopupSidebar')">
        <VcIcon class="!text-neutral-600" size="sm" name="x" />
      </button>
    </template>

    <ProductsFilters
      :show-common-filters="isHorizontalFilters"
      :keyword="keywordQueryParam"
      :filters="popupSidebarFilters"
      :loading="loading || facetsLoading"
      @change="$emit('updatePopupSidebarFilters', $event)"
      @open-branches="$emit('openBranchesModal', true)"
    >
      <template v-if="isHorizontalFilters && !hideSorting" #prepend="{ loading }">
        <div class="space-y-4">
          <div>
            <span class="text-md font-bold text-neutral-900">
              {{ $t("pages.catalog.sort_by_label") }}
            </span>
            <VcSelect
              v-model="sortQueryParam"
              size="sm"
              text-field="name"
              value-field="id"
              :disabled="loading"
              :items="PRODUCT_SORTING_LIST"
            />
          </div>
          <VcCheckbox
            v-if="!hideControls"
            :disabled="loading"
            @change="$emit('updatePopupSidebarFilters', { ...popupSidebarFilters, inStock: $event as boolean })"
          >
            {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
          </VcCheckbox>
          <VcCheckbox
            v-if="!hideControls"
            :model-value="!!popupSidebarFilters.branches.length"
            :disabled="loading"
            @change="$emit('openBranchesModal', true)"
          >
            <i18n-t keypath="pages.catalog.branch_availability_filter_card.available_in" tag="div" scope="global">
              <span>
                {{
                  $t("pages.catalog.branch_availability_filter_card.branches", {
                    n: popupSidebarFilters.branches.length,
                  })
                }}
              </span>
            </i18n-t>
          </VcCheckbox>
        </div>
      </template>
    </ProductsFilters>

    <template #footer>
      <VcButton
        variant="outline"
        :disabled="!isExistSelectedFacets && !isExistSelectedPopupSidebarFacets"
        @click="
          $emit('resetFacetFilters');
          $emit('hidePopupSidebar');
        "
      >
        {{ $t("common.buttons.reset") }}
      </VcButton>

      <VcButton
        :disabled="!isPopupSidebarFilterDirty"
        @click="
          $emit('applyFilters', popupSidebarFilters);
          $emit('hidePopupSidebar');
        "
      >
        {{ $t("common.buttons.apply") }}
      </VcButton>
    </template>
  </VcPopupSidebar>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { useRouteQueryParam } from "@/core/composables";
import { PRODUCT_SORTING_LIST } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import type { ProductsFilters as ProductsFiltersType } from "@/shared/catalog";
import ProductsFilters from "@/shared/catalog/components/products-filters.vue";

defineEmits<IEmits>();
const props = defineProps<IProps>();

interface IEmits {
  (event: "hidePopupSidebar"): void;
  (event: "updatePopupSidebarFilters", filters: ProductsFiltersType): void;
  (event: "openBranchesModal", fromPopupSidebarFilter: boolean): void;
  (event: "resetFacetFilters"): void;
  (event: "applyFilters", filters: ProductsFiltersType): void;
}

interface IProps {
  isHorizontalFilters: boolean;
  isExistSelectedFacets: boolean;
  isMobile: boolean;
  isPopupSidebarFilterDirty: boolean;
  isVisible: boolean;
  loading: boolean;
  facetsLoading: boolean;
  hideSorting?: boolean;
  hideControls?: boolean;
  keywordQueryParam: string;
  popupSidebarFilters: ProductsFiltersType;
}

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
});

const isExistSelectedPopupSidebarFacets = computedEager<boolean>(() =>
  props.popupSidebarFilters.facets.some((facet) => facet.values.some((value) => value.selected)),
);
</script>
