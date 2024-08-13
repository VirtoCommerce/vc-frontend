<template>
  <VcPopupSidebar class="filters-popup-sidebar" :is-visible="isVisible" @hide="$emit('hidePopupSidebar')">
    <template #header>
      <div class="filters-popup-sidebar__title">
        {{ isMobile ? $t("common.buttons.filters") : $t("common.buttons.allFilters") }}
      </div>
      <button type="button" class="filters-popup-sidebar__close-btn" @click="$emit('hidePopupSidebar')">
        <VcIcon class="filters-popup-sidebar__close-icon" size="sm" name="x" />
      </button>
    </template>

    <ProductsFilters :keyword="keywordQueryParam" :filters="popupSidebarFilters" :loading="loading || facetsLoading">
      <template #prepend="{ loading }">
        <div class="filters-popup-sidebar__container">
          <div v-if="!hideSorting && isHorizontalFilters" class="filters-popup-sidebar__sorting">
            <span class="filters-popup-sidebar__sorting-label">
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
            :model-value="popupSidebarFilters.inStock"
            class="filters-popup-sidebar__control"
            :disabled="loading"
            @change="
              (value) => {
                $emit('updatePopupSidebarFilters', { ...popupSidebarFilters, inStock: value as boolean });
              }
            "
          >
            {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
          </VcCheckbox>
          <VcCheckbox
            v-if="!hideControls"
            class="filters-popup-sidebar__control"
            :model-value="!!popupSidebarFilters.branches.length"
            :disabled="loading"
            :message="$t('pages.catalog.branch_availability_filter_card.select_branch_text')"
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
        class="filters-popup-sidebar__footer-btn"
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
        class="filters-popup-sidebar__footer-btn"
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
import type { ProductsFiltersType } from "@/shared/catalog";
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
  isHorizontalFilters?: boolean;
  isExistSelectedFacets?: boolean;
  isMobile?: boolean;
  isPopupSidebarFilterDirty?: boolean;
  isVisible?: boolean;
  loading?: boolean;
  facetsLoading?: boolean;
  hideSorting?: boolean;
  hideControls?: boolean;
  keywordQueryParam?: string;
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

<style lang="scss">
.filters-popup-sidebar {
  @apply lg:w-[22rem] #{!important};

  &__title {
    @apply text-2xl font-bold;
  }

  &__close-btn {
    @apply appearance-none px-5 py-4;
  }

  &__close-icon {
    --vc-icon-color: var(--color-neutral-600);
  }

  &__container {
    @apply space-y-5 mt-3 mb-4;
  }

  &__sorting-label {
    @apply font-bold text-neutral-900;
  }
}
</style>
