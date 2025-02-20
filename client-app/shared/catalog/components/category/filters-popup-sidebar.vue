<template>
  <VcPopupSidebar
    class="filters-popup-sidebar"
    :is-visible="isVisible"
    :title="isMobile ? $t('common.buttons.filters') : $t('common.buttons.allFilters')"
    @hide="$emit('hidePopupSidebar')"
  >
    <ProductsFilters
      :keyword="keywordQueryParam"
      :filters="popupSidebarFilters"
      :loading="loading || facetsLoading"
      @change="$emit('updatePopupSidebarFilters', $event)"
    >
      <template #prepend="{ loading: updatingFiltersState }">
        <div class="filters-popup-sidebar__container">
          <VcCheckbox
            v-if="!hideControls"
            :model-value="popupSidebarFilters.inStock"
            class="filters-popup-sidebar__control"
            :disabled="updatingFiltersState"
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
            :disabled="updatingFiltersState"
            :message="$t('pages.catalog.branch_availability_filter_card.select_branch_text')"
            prevent-default
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
        color="secondary"
        :disabled="!isExistSelectedFacets && !isExistSelectedPopupSidebarFacets"
        :title="$t('common.buttons.reset')"
        size="sm"
        icon="reset"
        @click="
          $emit('resetFacetFilters');
          $emit('hidePopupSidebar');
        "
      />

      <VcButton
        class="filters-popup-sidebar__footer-btn"
        variant="outline"
        :disabled="!isExistSelectedFacets && !isExistSelectedPopupSidebarFacets"
        min-width="6.25rem"
        size="sm"
        @click="$emit('hidePopupSidebar')"
      >
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton
        class="filters-popup-sidebar__footer-btn"
        :disabled="!isPopupSidebarFilterDirty"
        min-width="6.25rem"
        size="sm"
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
  isExistSelectedFacets?: boolean;
  isMobile?: boolean;
  isPopupSidebarFilterDirty?: boolean;
  isVisible?: boolean;
  loading?: boolean;
  facetsLoading?: boolean;
  hideControls?: boolean;
  keywordQueryParam?: string;
  popupSidebarFilters: ProductsFiltersType;
}

const isExistSelectedPopupSidebarFacets = computedEager<boolean>(() =>
  props.popupSidebarFilters.facets.some((facet) => facet.values.some((value) => value.selected)),
);
</script>

<style lang="scss">
.filters-popup-sidebar {
  @apply lg:w-[22rem] #{!important};

  &__container {
    @apply space-y-5 mb-4;
  }

  &__sorting-label {
    @apply font-bold text-neutral-900;
  }

  &__footer-btn {
    &:first-child {
      @apply me-auto;
    }
  }
}
</style>
