<template>
  <div ref="searchBarElement" class="search-bar">
    <VcInput
      v-model="searchPhrase"
      type="search"
      maxlength="999"
      class="search-bar__input"
      :clearable="!!searchPhrase"
      :placeholder="searchPlaceholder"
      @clear="reset"
      @keyup.esc="hideSearchDropdown"
      @keyup.arrow-down="focusFirstItem"
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
          @click="searchDropdownRef?.handleSearch()"
        />
      </template>
    </VcInput>

    <transition name="slide-fade-top">
      <SearchDropdown
        v-if="searchDropdownVisible"
        ref="searchDropdownRef"
        class="search-bar__dropdown"
        :style="searchDropdownStyle"
        :search-phrase="searchPhrase"
        :filter-expression="filterExpression"
        :is-category-scope="isCategoryScope"
        @hide="hideSearchDropdown"
        @product-select="handleProductSelect"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useElementBounding, whenever } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouteQueryParam, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { getFilterExpressionForCategorySubtree, getFilterExpressionForZeroPrice, toCSV } from "@/core/utilities";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import SearchDropdown from "../_internal/search-dropdown.vue";
import BarcodeScanner from "./barcode-scanner.vue";
import type { StyleValue } from "vue";

const searchBarElement = ref<HTMLElement | null>(null);
const searchDropdownRef = ref<{ handleSearch: () => void } | null>(null);

const { searchBarVisible, searchDropdownVisible, loading, hideSearchDropdown, showSearchDropdown, clearSearchResults } =
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

const filterExpression = computed(() => {
  const scopeExpression =
    searchScopeFilterExpression.value || getFilterExpressionForCategorySubtree({ catalogId: globals.catalogId });
  const { zero_price_product_enabled } = themeContext.value.settings;
  const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

  return catalog_empty_categories_enabled
    ? undefined
    : [scopeExpression, getFilterExpressionForZeroPrice(!!zero_price_product_enabled, globals.currencyCode)]
        .filter(Boolean)
        .join(" ");
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

whenever(
  searchBarVisible,
  () => {
    searchPhrase.value = searchPhraseInUrl.value ?? "";
    if (!searchPhrase.value.trim()) {
      clearSearchResults();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (searchPhraseInUrl.value) {
    searchPhrase.value = searchPhraseInUrl.value;
  }
});

const onBarcodeScanned = (value: string) => {
  if (value) {
    searchPhrase.value = value;
  }
};

watch(
  () => searchScopeData.value.queryScope,
  (value) => {
    if (value !== searchPhrase.value) {
      searchPhrase.value = value;
    }
  },
  { deep: true },
);
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
