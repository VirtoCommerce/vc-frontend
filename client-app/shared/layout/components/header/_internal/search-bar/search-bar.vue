<template>
  <div ref="searchBarElement" class="search-bar">
    <VcInput
      v-model="searchPhrase"
      type="search"
      :maxlength="maxSearchLength"
      class="search-bar__input"
      :clearable="!!searchPhrase"
      :placeholder="searchPlaceholder"
      test-id-input="global-search-query-input"
      @clear="reset"
      @keyup.esc="hideSearchDropdown"
      @keyup.arrow-down="focusFirstItem"
      @keydown.enter="searchDropdownRef?.handleSearch()"
      @input="onSearchPhraseChanged"
      @focus="onSearchBarFocused"
    >
      <template #prepend>
        <VcButton
          v-if="preparingScope"
          class="search-bar__button"
          color="secondary"
          append-icon="delete-2"
          size="xs"
          variant="solid-light"
          disabled
          loading
          min-width="5rem"
          :aria-label="$t('shared.layout.search_bar.scope_loading_label')"
        />

        <VcButton
          v-for="item in searchScopeData.searchScope"
          :key="item.id"
          class="search-bar__button"
          color="secondary"
          append-icon="delete-2"
          size="xs"
          variant="solid-light"
          :aria-label="$t('shared.layout.search_bar.scope_remove_label', { label: item.label })"
          :data-search-scope="item.label"
          @click.stop="onScopeItemClick(item.id)"
        >
          {{ item.label }}
        </VcButton>
      </template>

      <template #append>
        <BarcodeScanner
          v-if="!searchPhrase"
          :aria-label="$t('shared.layout.search_bar.barcode_detector.title')"
          @scanned-code="onBarcodeScanned"
        />

        <VcButton
          :aria-label="$t('shared.layout.search_bar.search_button')"
          icon="search"
          icon-size="1.25rem"
          :loading="loading"
          data-test-id="global-search-apply-button"
          @click="searchDropdownRef?.handleSearch()"
        />
      </template>
    </VcInput>

    <transition name="slide-fade-top">
      <SearchDropdown
        ref="searchDropdownRef"
        :visible="searchDropdownVisible"
        class="search-bar__dropdown"
        :style="searchDropdownStyle"
        :search-phrase="searchPhrase"
        :filter-expression="filterExpression"
        :categories-filter-expression="categoriesFilterExpression"
        :is-category-scope="isCategoryScope"
        data-test-id="global-search-suggestions-dropdown"
        @hide="hideSearchDropdown"
        @product-select="handleProductSelect"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useElementBounding, useLocalStorage } from "@vueuse/core";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouteQueryParam, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IN_STOCK_PRODUCTS_LOCAL_STORAGE } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import {
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStockVariations,
  getFilterExpressionForZeroPrice,
  toCSV,
} from "@/core/utilities";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import SearchDropdown from "../search-dropdown.vue";
import BarcodeScanner from "./barcode-scanner.vue";
import type { StyleValue } from "vue";

const searchBarElement = useTemplateRef("searchBarElement");
const searchDropdownRef = useTemplateRef<InstanceType<typeof SearchDropdown>>("searchDropdownRef");

const { searchDropdownVisible, loading, hideSearchDropdown, showSearchDropdown, clearSearchResults, maxSearchLength } =
  useSearchBar();

const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);

const searchPhrase = ref("");

const { bottom } = useElementBounding(searchBarElement);

const searchDropdownStyle = computed<StyleValue | undefined>(() => {
  return { maxHeight: bottom.value ? `calc(100vh - ${bottom.value + 40}px)` : "auto" };
});

onClickOutside(searchBarElement, hideSearchDropdown);

const { searchScopeData, removeScopeItemById, isCategoryScope, preparingScope, searchScopeFilterExpression } =
  useSearchScore();

const { themeContext } = useThemeContext();
const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { t } = useI18n();

const localStorageInStock = useLocalStorage<boolean>(IN_STOCK_PRODUCTS_LOCAL_STORAGE, true);

const filterExpression = computed(() => {
  const scopeExpression =
    searchScopeFilterExpression.value || getFilterExpressionForCategorySubtree({ catalogId: globals.catalogId });
  const { zero_price_product_enabled } = themeContext.value.settings;
  const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

  return catalog_empty_categories_enabled
    ? undefined
    : [
        scopeExpression,
        getFilterExpressionForZeroPrice(!!zero_price_product_enabled, globals.currencyCode),
        getFilterExpressionForInStockVariations(localStorageInStock.value),
      ]
        .filter(Boolean)
        .join(" ");
});

const categoriesFilterExpression = computed(() => {
  const scopeExpression =
    searchScopeFilterExpression.value || getFilterExpressionForCategorySubtree({ catalogId: globals.catalogId });
  const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

  if (catalog_empty_categories_enabled) {
    return undefined;
  }

  return scopeExpression;
});

const searchPlaceholder = computed(() => {
  return isCategoryScope.value
    ? t("shared.layout.search_bar.enter_keyword_placeholder_category", { category: getCategoriesNames() })
    : t("shared.layout.search_bar.enter_keyword_placeholder");
});

function getCategoriesNames() {
  return toCSV(searchScopeData.value.searchScope.filter((item) => item.type === "category").map((el) => el.label));
}

function onScopeItemClick(itemId: string | number) {
  removeScopeItemById(itemId);
}

function reset() {
  searchPhrase.value = "";
  hideSearchDropdown();
}

function onSearchPhraseChanged() {
  if (searchPhrase.value.trim()) {
    showSearchDropdown();
  }
}

function onSearchBarFocused() {
  showSearchDropdown();
}

function focusFirstItem() {
  if (!searchDropdownVisible.value) {
    return;
  }

  const item = document.querySelector(".search-bar__dropdown [tabindex='0']") as HTMLElement;

  if (item) {
    item.focus();
  }
}

function handleProductSelect() {
  hideSearchDropdown();
}

function onBarcodeScanned(value: string) {
  if (value) {
    searchPhrase.value = value;
    searchDropdownRef.value?.handleSearch();
  }
}

watch(isCategoryScope, (isCategory) => {
  if (!isCategory && searchPhrase.value && !searchPhraseInUrl.value) {
    searchPhrase.value = "";
    clearSearchResults();
  }
});

watch(searchPhraseInUrl, (newValue) => {
  searchPhrase.value = newValue ?? "";
  if (!searchPhrase.value.trim()) {
    clearSearchResults();
  }
});

onMounted(() => {
  if (searchPhraseInUrl.value) {
    searchPhrase.value = searchPhraseInUrl.value;
  }
});
</script>

<style lang="scss">
.search-bar {
  @apply relative flex grow items-stretch;

  &__input {
    @apply w-full;
  }

  &__button {
    @apply ms-1;
  }

  &__dropdown {
    @apply z-20 absolute left-0 top-[3.45rem] w-full min-w-[860px] max-w-[100vw];
  }
}
</style>
