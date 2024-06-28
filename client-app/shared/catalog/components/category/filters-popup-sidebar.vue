<template>
  <VcPopupSidebar
    :class="[!isMobile && 'desktop-popup-sidebar w-[358px]']"
    :is-visible="isVisible"
    @hide="$emit('hideMobileSidebar')"
  >
    <ProductsFilters
      :show-common-filters="areHorizontalFilters"
      :keyword="keywordQueryParam"
      :filters="mobileFilters"
      :loading="loading || facetsLoading"
      @change="$emit('updateMobileFilters', $event)"
      @open-branches="$emit('openBranchesModal', true)"
    >
      <template v-if="areHorizontalFilters" #prepend="{ loading }">
        <div>
          <span class="text-sm font-bold text-neutral-900">
            {{ $t("pages.catalog.sort_by_label") }}
          </span>
          <VcSelect
            v-model="sortQueryParam"
            text-field="name"
            value-field="id"
            :disabled="loading"
            :items="PRODUCT_SORTING_LIST"
            class="mb-4"
          />
          <VcCheckbox
            :disabled="loading"
            @change="$emit('updateMobileFilters', { ...mobileFilters, inStock: $event as boolean })"
          >
            {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
          </VcCheckbox>
          <button type="button" @click.prevent="$emit('openBranchesModal', true)">
            <VcCheckbox :model-value="!!mobileFilters.branches.length" :disabled="loading">
              <i18n-t keypath="pages.catalog.branch_availability_filter_card.available_in" tag="div" scope="global">
                <span>
                  {{
                    $t("pages.catalog.branch_availability_filter_card.branches", {
                      n: mobileFilters.branches.length,
                    })
                  }}
                </span>
              </i18n-t>
            </VcCheckbox>
          </button>
        </div>
      </template>
    </ProductsFilters>

    <template #footer>
      <VcButton
        variant="outline"
        :disabled="!isExistSelectedFacets && !isExistSelectedMobileFacets"
        @click="
          $emit('resetFacetFilters');
          $emit('hideMobileSidebar');
        "
      >
        {{ $t("common.buttons.reset") }}
      </VcButton>

      <VcButton
        :disabled="!isMobileFilterDirty"
        @click="
          $emit('applyFilters', mobileFilters);
          $emit('hideMobileSidebar');
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
  (event: "hideMobileSidebar"): void;
  (event: "updateMobileFilters", filters: ProductsFiltersType): void;
  (event: "openBranchesModal", fromMobileFilter: boolean): void;
  (event: "resetFacetFilters"): void;
  (event: "applyFilters", filters: ProductsFiltersType): void;
}

interface IProps {
  areHorizontalFilters: boolean;
  isExistSelectedFacets: boolean;
  isMobile: boolean;
  isMobileFilterDirty: boolean;
  isVisible: boolean;
  loading: boolean;
  facetsLoading: boolean;
  keywordQueryParam: string;
  mobileFilters: ProductsFiltersType;
}

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
});

const isExistSelectedMobileFacets = computedEager<boolean>(() =>
  props.mobileFilters.facets.some((facet) => facet.values.some((value) => value.selected)),
);
</script>
