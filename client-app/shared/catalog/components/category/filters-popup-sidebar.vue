<template>
  <VcPopupSidebar
    class="filters-popup-sidebar"
    :is-visible="isVisible"
    :title="isMobile ? $t('common.buttons.filters') : $t('common.buttons.allFilters')"
    @hide="$emit('hidePopupSidebar')"
  >
    <ProductsFilters
      v-if="localFilters"
      :keyword="keywordQueryParam"
      :filters="localFilters"
      :loading="loading || facetsLoading"
      @change="onProductsFiltersChange"
    >
      <template #prepend="{ loading: updatingFiltersState }">
        <div class="filters-popup-sidebar__container">
          <VcCheckbox
            v-if="!hideControls && isPurchasedBeforeEnabled"
            :model-value="localFilters.purchasedBefore"
            class="filters-popup-sidebar__control"
            :disabled="updatingFiltersState"
            data-test-id="purchased-before-checkbox-filter"
            @change="onTopFiltersChange({ purchasedBefore: $event })"
          >
            {{ $t("pages.catalog.purchased_before_filter_card.checkbox_label") }}
          </VcCheckbox>

          <VcCheckbox
            v-if="!hideControls"
            :model-value="localFilters.inStock"
            class="filters-popup-sidebar__control"
            :disabled="updatingFiltersState"
            @change="onTopFiltersChange({ inStock: $event })"
          >
            {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
          </VcCheckbox>

          <VcCheckbox
            v-if="!hideControls"
            class="filters-popup-sidebar__control"
            :model-value="!!localFilters.branches.length"
            :disabled="updatingFiltersState"
            :message="$t('pages.catalog.branch_availability_filter_card.select_branch_text')"
            prevent-default
            @change="openBranchesModal"
          >
            <i18n-t keypath="pages.catalog.branch_availability_filter_card.available_in" tag="div" scope="global">
              <span>
                {{
                  $t("pages.catalog.branch_availability_filter_card.branches", {
                    n: localFilters.branches.length,
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
        :title="$t('common.buttons.reset')"
        size="sm"
        icon="reset"
        :disabled="!isExistSelectedFacets"
        @click="onReset"
      />

      <VcButton
        class="filters-popup-sidebar__footer-btn"
        variant="outline"
        :disabled="!isPopupSidebarFilterDirty"
        min-width="6.25rem"
        size="sm"
        @click="onCancel"
      >
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton
        class="filters-popup-sidebar__footer-btn"
        :disabled="!isPopupSidebarFilterDirty"
        min-width="6.25rem"
        size="sm"
        @click="onApply"
      >
        {{ $t("common.buttons.apply") }}
      </VcButton>
    </template>
  </VcPopupSidebar>
</template>

<script setup lang="ts">
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { watch, ref, computed } from "vue";
import { usePurchasedBefore } from "@/shared/catalog/composables";
import { useModal } from "@/shared/modal";
import type { ProductsFiltersType } from "@/shared/catalog";
import ProductsFilters from "@/shared/catalog/components/products-filters.vue";
import BranchesModal from "@/shared/fulfillmentCenters/components/branches-modal.vue";

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

interface IEmits {
  (event: "hidePopupSidebar"): void;
  (event: "resetFacetFilters"): void;
  (event: "applyFilters", filters: ProductsFiltersType): void;
}

interface IProps {
  isMobile?: boolean;
  isVisible?: boolean;
  loading?: boolean;
  facetsLoading?: boolean;
  hideControls?: boolean;
  keywordQueryParam?: string;
  popupSidebarFilters: ProductsFiltersType;
  isExistSelectedFacets: boolean;
}

const localFilters = ref<ProductsFiltersType>();

const beforeChangeFilterState = ref<ProductsFiltersType>();

const { isPurchasedBeforeEnabled } = usePurchasedBefore();

function onTopFiltersChange(payload: { purchasedBefore: boolean } | { inStock: boolean }) {
  if (!localFilters.value) {
    return;
  }
  if ("purchasedBefore" in payload) {
    localFilters.value.purchasedBefore = payload.purchasedBefore;
  } else {
    localFilters.value.inStock = payload.inStock;
  }

  emit("applyFilters", localFilters.value);
}

watch(
  () => props.popupSidebarFilters,
  (filters) => {
    localFilters.value = cloneDeep(filters);
  },
  { immediate: true },
);

watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      beforeChangeFilterState.value = cloneDeep(props.popupSidebarFilters);
    }
  },
);

const isPopupSidebarFilterDirty = computed(() => {
  return !isEqual(beforeChangeFilterState.value, localFilters.value);
});

function onProductsFiltersChange(payload: ProductsFiltersType) {
  localFilters.value = cloneDeep(payload);
  emit("applyFilters", localFilters.value);
}

function onCancel() {
  if (beforeChangeFilterState.value) {
    emit("applyFilters", cloneDeep(beforeChangeFilterState.value));
  }

  emit("hidePopupSidebar");
}

function onReset() {
  emit("resetFacetFilters");
  emit("hidePopupSidebar");
}

function onApply() {
  if (!localFilters.value) {
    return;
  }

  emit("hidePopupSidebar");
}

const { openModal } = useModal();
function openBranchesModal() {
  openModal({
    component: BranchesModal,
    props: {
      selectedBranches: localFilters.value?.branches,
      onSave(branches: string[]) {
        if (!localFilters.value) {
          return;
        }
        localFilters.value.branches = cloneDeep(branches);

        emit("applyFilters", localFilters.value);
      },
    },
  });
}
</script>

<style lang="scss">
.filters-popup-sidebar {
  @apply lg:w-[22rem] #{!important};

  &__container {
    @apply space-y-5 mb-4;
  }

  &__footer-btn {
    &:first-child {
      @apply me-auto;
    }
  }
}
</style>
