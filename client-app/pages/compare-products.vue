<template>
  <VcContainer class="compare-products">
    <VcBreadcrumbs class="compare-products__breadcrumbs" :items="breadcrumbs" />

    <div class="compare-products__head">
      <div class="compare-products__title-block">
        <VcTypography tag="h1" class="compare-products__title">
          {{ t("pages.compare.title") }}
        </VcTypography>

        <i18n-t
          :keypath="selectedCategoryLabel ? 'pages.compare.added_count_in_category' : 'pages.compare.added_count'"
          scope="global"
          tag="p"
          class="compare-products__added-count"
        >
          <template #count>
            <span class="compare-products__added-count-value">{{ selectedCategoryCount }}</span>
          </template>

          <template #total>{{ productsLimit }}</template>

          <template #category>{{ selectedCategoryLabel }}</template>
        </i18n-t>
      </div>

      <div class="compare-products__actions">
        <VcButton
          class="hidden md:inline-flex"
          variant="outline"
          size="sm"
          :disabled="isEmpty"
          prepend-icon="trash-2"
          @click="openClearAllModal"
        >
          {{ t("pages.compare.actions.clear_all") }}
        </VcButton>

        <VcButton
          class="md:hidden"
          variant="outline"
          size="sm"
          :disabled="isEmpty"
          icon="trash-2"
          :aria-label="t('pages.compare.actions.clear_all')"
          @click="openClearAllModal"
        />
      </div>
    </div>

    <VcWidget v-if="isEmpty" class="compare-products__empty-state">
      <VcEmptyView>
        <template #icon>
          <div class="compare-products__empty-icon">
            <VcIcon name="compare" />
          </div>
        </template>

        <VcTypography
          ref="emptyStateHeadingRef"
          tag="h3"
          data-test-id="compare-empty-heading"
          class="compare-products__empty-heading"
          tabindex="-1"
        >
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

    <div
      v-else-if="fetchingProducts && !selectedCategoryProducts.length"
      data-test-id="compare-loading-state"
      class="compare-products__loading-state"
    >
      <VcLoaderOverlay visible no-bg />
    </div>

    <VcWidget
      v-else-if="fetchFailed && !selectedCategoryProducts.length"
      data-test-id="compare-error-state"
      class="compare-products__error-state"
    >
      <VcEmptyView variant="error" :text="t('pages.compare.error')">
        <template #button>
          <VcButton size="sm" @click="retryFetch">
            {{ t("pages.compare.retry") }}
          </VcButton>
        </template>
      </VcEmptyView>
    </VcWidget>

    <template v-else>
      <div class="compare-products__category-tabs" @wheel="onCategoryTabsWheel">
        <VcButton
          v-for="tab in categoryTabs"
          :key="tab.categoryKey"
          class="compare-products__category-tab"
          size="xs"
          color="secondary"
          :variant="tab.categoryKey === selectedCategoryKey ? 'solid' : 'outline'"
          :aria-pressed="tab.categoryKey === selectedCategoryKey"
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
import { computed, nextTick, onUnmounted, useTemplateRef, watch } from "vue";
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
  clearRestoreBuffer,
  canRestoreProducts,
  getCategoryProductsCount,
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
  fetchFailed,
  retryFetch,
  selectCategory,
  selectItemEvent,
} = useCompareProductsPage();

const isEmpty = computed(() => products.value.length === 0);

function onCategoryTabsWheel(event: WheelEvent) {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
    return;
  }

  event.preventDefault();
  (event.currentTarget as HTMLElement).scrollLeft += event.deltaY;
}

// Focus lands on the real <h3>, not a wrapper — a wrapper div has no role, so a screen reader
// would read the text but lose "heading level 3".
const emptyStateHeadingRef = useTemplateRef<{ $el: HTMLElement }>("emptyStateHeadingRef");

watch(isEmpty, async (empty) => {
  if (!empty) {
    return;
  }

  await nextTick();
  emptyStateHeadingRef.value?.$el?.focus();
});

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
  // The confirmation must count what will actually be removed from storage — selectedCategoryCount
  // is the *resolved* count now (see useCompareProductsPage's categoryTabs), which can undercount
  // if some of the category's products failed to fetch.
  const categoryEntryCount = getCategoryProductsCount(selectedCategoryKey.value);

  openModal({
    component: VcConfirmationModal,
    props: {
      variant: "danger",
      title: t("pages.compare.clear_category_modal.title"),
      text: t(
        "pages.compare.clear_category_modal.message",
        { n: categoryEntryCount, category: selectedCategoryLabel.value },
        categoryEntryCount,
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

onUnmounted(() => {
  clearRestoreBuffer();
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
  }

  &__empty-state,
  &__error-state {
    @apply mt-6;
  }

  &__empty-icon {
    @apply flex size-14 items-center justify-center rounded-[--vc-radius] bg-neutral-100 text-neutral-400;
  }

  &__empty-heading {
    @apply outline-none;
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
