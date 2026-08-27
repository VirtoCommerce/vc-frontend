<template>
  <VcContainer class="compare-products">
    <VcBreadcrumbs class="compare-products__breadcrumbs" :items="breadcrumbs" />

    <div class="compare-products__head">
      <div class="compare-products__title-block">
        <VcTypography tag="h1" class="compare-products__title">
          {{ t("pages.compare.title") }}
        </VcTypography>

        <p class="compare-products__added-count">
          <span class="compare-products__added-count-value">{{ selectedCategoryCount }}</span>
          {{
            selectedCategoryLabel
              ? t("pages.compare.added_count_in_category", {
                  total: productsLimit,
                  category: selectedCategoryLabel,
                })
              : t("pages.compare.added_count", { total: productsLimit })
          }}
        </p>
      </div>

      <div class="compare-products__actions">
        <VcButton variant="outline" size="sm" :disabled="isEmpty" prepend-icon="trash-2" @click="openClearAllModal">
          {{ t("pages.compare.actions.clear_all") }}
        </VcButton>
      </div>
    </div>

    <VcWidget v-if="isEmpty" class="compare-products__empty-state">
      <VcEmptyView>
        <template #icon>
          <div class="compare-products__empty-icon">
            <VcIcon name="compare" />
          </div>
        </template>

        <VcTypography tag="h3">
          {{ t("pages.compare.empty.title") }}
        </VcTypography>

        <p class="compare-products__empty-description">
          {{ t("pages.compare.empty.description", { limit: productsLimit }) }}
        </p>

        <template #button>
          <div class="compare-products__empty-actions">
            <VcButton v-if="canRestoreProducts" size="sm" prepend-icon="refresh-cw" @click="restoreProducts">
              {{ t("pages.compare.empty.restore_button") }}
            </VcButton>

            <VcButton
              variant="outline"
              size="sm"
              prepend-icon="plus"
              :external-link="continueShoppingLink"
              :to="continueShoppingLink ? undefined : '/'"
            >
              {{ t("pages.compare.empty.add_button") }}
            </VcButton>
          </div>
        </template>
      </VcEmptyView>
    </VcWidget>

    <!-- Only for the very first load: useCompareProductsPage's useProducts call opts into
         preserveProductsWhileFetching, so selectedCategoryProducts keeps showing the last known
         products during a refetch instead of dropping to empty — this only stays true before
         anything has ever loaded. Once there's something to show we'd rather keep the table
         mounted (see below, with just an overlay) than tear it down and lose scroll position,
         pins, and the All/Differences selection on every edit. -->
    <div v-else-if="fetchingProducts && !selectedCategoryProducts.length" class="compare-products__loading-state">
      <VcLoaderOverlay visible no-bg />
    </div>

    <template v-else>
      <div class="compare-products__category-tabs">
        <VcButton
          v-for="tab in categoryTabs"
          :key="tab.categoryKey"
          class="compare-products__category-tab"
          size="xs"
          color="secondary"
          :variant="tab.categoryKey === selectedCategoryKey ? 'solid' : 'outline'"
          @click="selectCategory(tab.categoryKey)"
        >
          <span class="compare-products__category-tab-content">
            {{ tab.label }}

            <VcBadge
              size="sm"
              color="secondary"
              rounded
              :variant="tab.categoryKey === selectedCategoryKey ? 'surface' : 'outline'"
            >
              {{ tab.count }}
            </VcBadge>
          </span>
        </VcButton>
      </div>

      <div class="compare-products__table-wrap">
        <VcLoaderOverlay :visible="fetchingProducts" />

        <CompareTable
          :products="selectedCategoryProducts"
          :rows="tableRows"
          :differ-count="differRowsCount"
          :total-rows="tableRows.length"
          @clear-category="openClearCategoryModal"
          @remove-product="removeProduct"
          @select-item="selectItemEvent"
        />
      </div>
    </template>
  </VcContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { CompareTable, useCompareProducts, useCompareProductsPage } from "@/shared/compare";
import { useModal } from "@/shared/modal";
import { VcConfirmationModal } from "@/ui-kit/components";
import type { ICompareDisplayProduct } from "@/shared/compare";

const { t } = useI18n();
const { openModal, closeModal } = useModal();

const breadcrumbs = useBreadcrumbs([{ title: t("pages.compare.title") }]);

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { continue_shopping_link: continueShoppingLink } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const {
  products,
  productsLimit,
  removeFromCompareList,
  clearCompareList,
  clearCategory,
  restoreProducts,
  canRestoreProducts,
} = useCompareProducts();
const {
  categoryTabs,
  selectedCategoryKey,
  selectedCategoryLabel,
  selectedCategoryCount,
  selectedCategoryProducts,
  tableRows,
  differRowsCount,
  fetchingProducts,
  selectCategory,
  selectItemEvent,
} = useCompareProductsPage();

const isEmpty = computed(() => products.value.length === 0);

function removeProduct({ product, entry }: ICompareDisplayProduct) {
  removeFromCompareList(product, entry.configurationSectionInput);
}

function openClearAllModal() {
  openModal({
    component: VcConfirmationModal,
    props: {
      variant: "danger",
      title: t("pages.compare.clear_all_modal.title"),
      text: t("pages.compare.clear_all_modal.message", { n: products.value.length }, products.value.length),
      onConfirm() {
        clearCompareList();
        closeModal();
      },
    },
  });
}

function openClearCategoryModal() {
  openModal({
    component: VcConfirmationModal,
    props: {
      variant: "danger",
      title: t("pages.compare.clear_category_modal.title"),
      text: t(
        "pages.compare.clear_category_modal.message",
        { n: selectedCategoryCount.value, category: selectedCategoryLabel.value },
        selectedCategoryCount.value,
      ),
      onConfirm() {
        clearCategory(selectedCategoryKey.value);
        closeModal();
      },
    },
  });
}

usePageHead({
  title: t("pages.compare.title"),
  meta: {
    keywords: t("pages.compare.meta.keywords"),
    description: t("pages.compare.meta.description"),
  },
});
</script>

<style lang="scss">
.compare-products {
  overflow-anchor: none;

  &__breadcrumbs {
    @apply mb-3;
  }

  &__head {
    @apply flex items-start justify-between gap-4;
  }

  &__added-count {
    @apply mt-1.5 text-sm text-neutral-500;
  }

  &__added-count-value {
    @apply font-bold text-neutral-950;
  }

  &__actions {
    @apply flex gap-2;

    @media (width < theme("screens.md")) {
      @apply hidden;
    }
  }

  &__empty-state {
    @apply mt-6;
  }

  &__empty-icon {
    @apply flex size-14 items-center justify-center rounded-[--vc-radius] bg-neutral-100 text-neutral-400;
  }

  &__empty-description {
    @apply max-w-md text-sm text-neutral-500;
  }

  &__empty-actions {
    @apply flex flex-wrap items-center justify-center gap-3;
  }

  &__loading-state {
    @apply relative mt-6 min-h-[25rem];
  }

  &__category-tabs {
    @apply mt-5 flex flex-nowrap items-center gap-2.5 overflow-x-auto py-1;

    -ms-overflow-style: none; /* for Edge */
    scrollbar-width: none; /* for Firefox */

    &::-webkit-scrollbar {
      display: none; /* for Chrome, Safari, and Opera */
    }
  }

  &__category-tab {
    @apply shrink-0;
  }

  &__category-tab-content {
    @apply flex items-center gap-2;
  }

  &__table-wrap {
    @apply relative mt-4;
  }
}
</style>
