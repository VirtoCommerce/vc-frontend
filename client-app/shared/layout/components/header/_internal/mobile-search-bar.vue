<template>
  <div class="mobile-search-bar">
    <transition name="fade">
      <button
        v-if="visible"
        type="button"
        class="mobile-search-bar__backdrop"
        :aria-label="$t('common.labels.close')"
        @click="hideSearchBar"
      />
    </transition>

    <transition name="slide-down">
      <div v-if="visible" ref="contentElement" class="mobile-search-bar__content">
        <div ref="wrapperElement" class="mobile-search-bar__wrapper">
          <VcInput
            v-model="searchPhrase"
            type="search"
            :maxlength="maxSearchLength"
            :placeholder="$t('shared.layout.header.mobile.search_bar.input_placeholder')"
            class="mobile-search-bar__input"
            :clearable="!!searchPhrase"
            @clear="reset"
            @keydown.enter="searchDropdownRef?.handleSearch()"
          >
            <template #append>
              <BarcodeScanner v-if="!searchPhrase" @scanned-code="onBarcodeScanned" />

              <VcButton class="mobile-search-bar__button" icon="search" @click="searchDropdownRef?.handleSearch()" />
            </template>
          </VcInput>

          <button type="button" class="mobile-search-bar__close" @click="hideSearchBar">
            {{ $t("common.buttons.cancel") }}
          </button>
        </div>

        <VcScrollbar class="mobile-search-bar__dropdown" :vertical="isMobile">
          <SearchDropdown
            ref="searchDropdownRef"
            :search-phrase="searchPhrase"
            :filter-expression="filterExpression"
            @hide="handleSearchDropdownHide"
            @product-select="handleSearchDropdownHide"
          />
        </VcScrollbar>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useElementBounding, useBreakpoints, useLocalStorage, whenever } from "@vueuse/core";
import { computed, ref, toRef } from "vue";
import { useRouteQueryParam, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BREAKPOINTS, IN_STOCK_PRODUCTS_LOCAL_STORAGE } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { getFilterExpressionForInStockVariations, getFilterExpressionForZeroPrice } from "@/core/utilities";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import BarcodeScanner from "./search-bar/barcode-scanner.vue";
import SearchDropdown from "./search-dropdown.vue";

interface IProps {
  visible: boolean;
}

const props = defineProps<IProps>();

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);

const { hideSearchBar, hideSearchDropdown, clearSearchResults, maxSearchLength } = useSearchBar();

const { themeContext } = useThemeContext();
const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("md");

const searchDropdownRef = ref<{ handleSearch: () => void } | null>(null);

const localStorageInStock = useLocalStorage<boolean>(IN_STOCK_PRODUCTS_LOCAL_STORAGE, true);

/**
 * Note: Unlike desktop search-bar, mobile version does NOT include catalog filter
 * (getFilterExpressionForCategorySubtree) because mobile search bar has no scope selector UI.
 * Mobile always searches across all catalogs.
 */
const filterExpression = computed(() => {
  const { zero_price_product_enabled } = themeContext.value.settings;
  const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

  if (catalog_empty_categories_enabled) {
    return undefined;
  }

  const expressions = [
    getFilterExpressionForZeroPrice(!!zero_price_product_enabled, globals.currencyCode),
    getFilterExpressionForInStockVariations(localStorageInStock.value),
  ].filter(Boolean);

  return expressions.length > 0 ? expressions.join(" ") : undefined;
});
const contentElement = ref<HTMLElement | null>(null);
const wrapperElement = ref<HTMLElement | null>(null);

const { top: contentTop } = useElementBounding(contentElement);
const { height: wrapperHeight } = useElementBounding(wrapperElement);

const dropdownMaxHeight = computed(() => {
  const dropdownTop = contentTop.value + wrapperHeight.value;
  return dropdownTop > 0 ? `calc(100dvh - ${dropdownTop}px)` : "auto";
});

function reset() {
  searchPhrase.value = "";
  hideSearchDropdown();
}

function onBarcodeScanned(value: string) {
  if (value) {
    searchPhrase.value = value;
  }
}

function handleSearchDropdownHide() {
  hideSearchDropdown();
}

whenever(
  toRef(props, "visible"),
  () => {
    searchPhrase.value = searchPhraseInUrl.value ?? "";
    if (!searchPhrase.value.trim()) {
      clearSearchResults();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.mobile-search-bar {
  &__backdrop {
    @apply fixed inset-0 z-10 cursor-pointer;

    background-color: rgba(194, 195, 195, 0.6);

    @media (min-width: theme("screens.lg")) {
      @apply hidden;
    }
  }

  &__content {
    @apply absolute left-0 right-0 z-10 bg-[--mobile-search-bar-bg];
  }

  &__wrapper {
    @apply flex select-none items-center p-3.5;
  }

  &__input {
    @apply me-2.5 grow;
  }

  &__close {
    @apply appearance-none text-[--link-color] text-sm;
  }

  &__dropdown {
    max-height: v-bind(dropdownMaxHeight);
  }

  // Transitions styles
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-down-enter-active {
    transition: transform 0.3s ease;
    transition-delay: 0.1s;
  }

  .slide-down-leave-active {
    transition: transform 0.3s ease;
  }

  .slide-down-enter-from {
    transform: translateY(-100%);
  }

  .slide-down-leave-to {
    transform: translateY(-100%);
  }
}
</style>
