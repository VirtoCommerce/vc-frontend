<template>
  <div ref="searchBarElement" class="relative flex grow items-stretch">
    <VcInput
      v-model="searchPhrase"
      type="search"
      :maxlength="MAX_LENGTH"
      class="w-full"
      :clearable="!!searchPhrase"
      :placeholder="searchPlaceholder"
      @clear="reset"
      @keyup.enter="handleSearchAndSaveQuery"
      @keyup.esc="hideSearchDropdown"
      @input="onSearchPhraseChanged"
      @focus="onSearchBarFocused"
    >
      <template #prepend>
        <VcButton
          v-if="preparingScope"
          class="ml-1 w-20"
          color="secondary"
          append-icon="delete-2"
          size="xs"
          variant="solid-light"
          disabled
          loading
          :aria-label="$t('shared.layout.search_bar.scope_loading_label')"
        />

        <VcButton
          v-for="item in searchScope"
          :key="item.id"
          class="ml-1"
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
        <BarcodeScanner v-if="!searchPhrase" @scanned-code="onBarcodeScanned" />

        <VcButton
          :aria-label="$t('shared.layout.search_bar.search_button')"
          icon="search"
          icon-size="1.25rem"
          :loading="loading"
          @click="handleSearchAndSaveQuery"
        />
      </template>
    </VcInput>

    <!-- Dropdown -->
    <transition name="slide-fade-top">
      <div
        v-if="searchDropdownVisible"
        ref="searchDropdownElement"
        class="absolute left-1/2 top-[3.45rem] z-20 flex w-full min-w-[640px] max-w-[100vw] -translate-x-1/2 flex-col overflow-y-auto rounded bg-additional-50 shadow-lg"
        :style="searchDropdownStyle"
        @focusout="handleFocusOut"
      >
        <!-- Results and history -->
        <!-- Search history and suggestions -->
        <section v-if="(searchHistoryQueries.length && !searchHistoryLoading) || (suggestions.length && !loading)">
          <header class="bg-neutral-100 px-5 py-2 text-xs font-bold text-neutral-600">
            {{ $t("shared.layout.search_bar.suggestions_and_history_label") }}
          </header>

          <ul class="px-2 py-3">
            <VcMenuItem
              v-for="query in searchHistoryQueries"
              :key="query"
              class="w-full"
              :label="query"
              tag="li"
              truncate
              nowrap
              @click="handleSearchHistoryClick(query)"
            >
              <template #prepend>
                <VcIcon name="history" size="md" class="fill-secondary-500" />
              </template>

              <span v-html-safe="highlightSearchText(query, trimmedSearchPhrase)" class="truncate" />
            </VcMenuItem>

            <VcMenuItem
              v-for="suggestion in suggestions"
              :key="suggestion.text"
              :to="getSearchRoute(suggestion.text)"
              tag="li"
              @click="hideSearchDropdown"
            >
              <span v-html-safe="suggestion.label" class="truncate" />
            </VcMenuItem>
          </ul>
        </section>
        <!-- Search history and suggestions end -->

        <!-- Pages -->
        <section v-if="pages.length">
          <header class="bg-neutral-100 px-5 py-2 text-xs font-bold text-neutral-600">
            {{ $t("shared.layout.search_bar.pages_label") }}
          </header>

          <ul class="grid grid-cols-4 gap-2 px-2 py-3">
            <VcMenuItem
              v-for="(page, index) in pages"
              :key="index"
              class="w-full"
              :to="page.permalink"
              tag="li"
              size="xs"
              @click="hideSearchDropdown"
            >
              <span v-html-safe="page.name" />
            </VcMenuItem>
          </ul>
        </section>
        <!-- Pages end -->

        <!-- Categories -->
        <section v-if="categories.length">
          <header class="bg-neutral-100 px-5 py-2 text-xs font-bold text-neutral-600">
            {{ $t("shared.layout.search_bar.categories_label") }}
          </header>

          <ul v-for="(column, index) in categoriesColumns" :key="index" class="grid grid-cols-4 gap-2 px-2 py-3">
            <VcMenuItem
              v-for="category in column"
              :key="category.name"
              :to="categoriesRoutes[category.id]"
              tag="li"
              @click="hideSearchDropdown"
            >
              <span v-html-safe="category.name" />
            </VcMenuItem>
          </ul>
        </section>
        <!-- Categories end -->

        <!-- Products -->
        <section v-if="products.length" class="pb-4">
          <header class="bg-neutral-100 px-5 py-2 text-xs font-bold text-neutral-600">
            {{ $t("shared.layout.search_bar.products_label") }}
          </header>

          <div class="grid grid-cols-2 gap-y-0.5 p-3">
            <SearchBarProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              @link-click="
                hideSearchDropdown();
                selectItemEvent(product);
              "
            />
          </div>
        </section>
        <!-- Products end -->

        <!-- Actions -->
        <section v-if="total" class="sticky bottom-0 mt-0.5 border-t border-neutral-100 bg-additional-50 px-5 py-3">
          <VcButton size="sm" @click="handleSearchAndSaveQuery">
            {{ $t("shared.layout.search_bar.view_all_results_button", { total }) }}
          </VcButton>
        </section>
        <!-- Results and history end -->

        <!-- Not found -->
        <div v-if="!searchInProgress && !isExistResults && trimmedSearchPhrase">
          <header class="bg-neutral-100 px-5 py-2 text-xs font-bold text-neutral-600">
            {{ $t("shared.layout.search_bar.search_label") }}
          </header>

          <div class="flex items-center gap-1.5 px-4 py-6 text-sm text-neutral-500">
            <VcIcon name="search-not-found" size="md" class="shrink-0 fill-secondary-500" />

            <i18n-t class="inline-block" keypath="shared.layout.search_bar.no_results" tag="p">
              <template #keyword>
                <strong>{{ trimmedSearchPhrase }}</strong>
              </template>
            </i18n-t>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useDebounceFn, useElementBounding, whenever } from "@vueuse/core";
import { pickBy } from "lodash";
import { computed, onMounted, ref, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useCategoriesRoutes, useAnalytics, useRouteQueryParam, useThemeContext } from "@/core/composables";
import { useHistoricalEvents } from "@/core/composables/useHistoricalEvents";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { getFilterExpressionForCategorySubtree, getFilterExpressionForZeroPrice, toCSV } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import { highlightSearchText } from "@/shared/layout/utils";
import SearchBarProductCard from "./_internal/search-bar-product-card.vue";
import BarcodeScanner from "./barcode-scanner.vue";
import type { GetSearchResultsParamsType } from "@/core/api/graphql/catalog";
import type { Category, Product } from "@/core/api/graphql/types";
import type { StyleValue } from "vue";
import type { RouteLocationRaw } from "vue-router";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

const { themeContext } = useThemeContext();
const { saveSearchQuery, useGetSearchHistoryQuery } = useHistoricalEvents();

const searchBarElement = ref<HTMLElement | null>(null);
const searchInProgress = ref(false);

// Number of categories column items in dropdown list
const CATEGORIES_ITEMS_PER_COLUMN = 4;

const SEARCH_BAR_DEBOUNCE_TIME = 200;

const MAX_LENGTH = themeContext.value?.settings?.search_max_chars || 999;

const {
  total,
  loading,
  pages,
  products,
  suggestions,
  categories,
  searchBarVisible,
  searchDropdownVisible,
  hideSearchDropdown,
  showSearchDropdown,
  searchResults,
} = useSearchBar();

const { analytics } = useAnalytics();
const router = useRouter();

const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const categoriesRoutes = useCategoriesRoutes(categories);
const { result: searchHistory, load: loadSearchHistory, loading: searchHistoryLoading } = useGetSearchHistoryQuery();

const searchHistoryQueries = computed(() => searchHistory.value?.searchHistory?.queries ?? []);

const searchDropdownElement = ref<HTMLElement | null>(null);

const searchPhrase = ref("");
const trimmedSearchPhrase = computed(() => {
  return searchPhrase.value.trim();
});

const searchBarListProperties = computed(() => ({
  search_term: trimmedSearchPhrase,
  item_list_id: "search_bar",
  item_list_name: `Search phrase '${trimmedSearchPhrase.value}'`,
}));

const { bottom } = useElementBounding(searchBarElement);

const searchDropdownStyle = computed<StyleValue | undefined>(() => {
  return { maxHeight: bottom.value ? `calc(100vh - ${bottom.value + 40}px)` : "auto" };
});

onClickOutside(searchBarElement, hideSearchDropdown);

const categoriesColumns = computed<Array<Category[]>>(() => {
  const columnsCount: number = Math.ceil(categories.value.length / CATEGORIES_ITEMS_PER_COLUMN);

  return Array.from({ length: columnsCount }).map((_, index) => {
    const column: number = index + 1;
    return categories.value.slice((column - 1) * CATEGORIES_ITEMS_PER_COLUMN, column * CATEGORIES_ITEMS_PER_COLUMN);
  });
});

const isExistResults = computed(
  () => categories.value.length || products.value.length || suggestions.value.length || pages.value.length,
);

const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const { searchScope, searchScopeFilterExpression, removeScopeItemById, isCategoryScope, preparingScope } =
  useSearchScore();

const { t } = useI18n();

const searchPlaceholder = computed(() => {
  return isCategoryScope.value
    ? t("shared.layout.search_bar.enter_keyword_placeholder_category", { category: getCategoriesNames() })
    : t("shared.layout.search_bar.enter_keyword_placeholder");
});

function getCategoriesNames() {
  return toCSV(searchScope.value.filter((item) => item.type === "category").map((el) => el.label));
}

function onScopeItemClick(itemId: string | number) {
  removeScopeItemById(itemId);
}

async function searchAndShowDropdownResults(): Promise<void> {
  const COLUMNS = 5;
  const { catalogId, currencyCode } = globals;
  const { search_product_phrase_suggestions_enabled, search_static_content_suggestions_enabled } =
    themeContext.value.settings;

  if (!loading.value) {
    hideSearchDropdown();
  }

  if (trimmedSearchPhrase.value.length > MAX_LENGTH) {
    return;
  }

  const { zero_price_product_enabled } = themeContext.value.settings;
  const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

  const filterExpression = catalog_empty_categories_enabled
    ? undefined
    : [
        searchScopeFilterExpression.value || getFilterExpressionForCategorySubtree({ catalogId }),
        getFilterExpressionForZeroPrice(!!zero_price_product_enabled, currencyCode),
      ]
        .filter(Boolean)
        .join(" ");

  const params: GetSearchResultsParamsType = {
    keyword: trimmedSearchPhrase.value,
    filter: filterExpression,
    categories: {
      itemsPerPage: CATEGORIES_ITEMS_PER_COLUMN * COLUMNS,
    },
    products: {
      itemsPerPage: 6,
    },
  };

  if (search_product_phrase_suggestions_enabled) {
    params.productSuggestions = { suggestionsSize: 4 };
  }

  if (search_static_content_suggestions_enabled) {
    params.pages = { itemsPerPage: DEFAULT_PAGE_SIZE };
  }

  await searchResults(params);

  showSearchDropdown();

  /**
   * Send Google Analytics event for products.
   */
  if (products.value.length) {
    analytics("viewItemList", products.value, searchBarListProperties.value);
  }
}

function selectItemEvent(product: Product) {
  analytics("selectItem", product, searchBarListProperties.value);
}

const facetsParam = useRouteQueryParam<string>(QueryParamName.Facets);
const sortParam = useRouteQueryParam<string>(QueryParamName.Sort);

function getSearchRoute(phrase: string): RouteLocationRaw {
  const query = pickBy(
    {
      [QueryParamName.SearchPhrase]: phrase,
      [QueryParamName.Facets]: toValue(facetsParam),
      [QueryParamName.Sort]: toValue(sortParam),
    },
    (value) => !!value,
  );

  if (isCategoryScope.value) {
    return {
      path: router.currentRoute.value.path,
      query,
    };
  } else {
    return {
      name: ROUTES.SEARCH.NAME,
      query,
    };
  }
}

function handleSearchAndSaveQuery() {
  void saveSearchQuery(trimmedSearchPhrase.value);

  goToSearchResultsPage();
}

function handleSearchHistoryClick(query: string) {
  searchPhrase.value = query;
  goToSearchResultsPage();
}

function goToSearchResultsPage() {
  hideSearchDropdown();
  void router.push(getSearchRoute(trimmedSearchPhrase.value));

  if (trimmedSearchPhrase.value) {
    analytics("search", trimmedSearchPhrase.value, products.value, total.value);
  }
}

function reset() {
  searchPhrase.value = "";
  hideSearchDropdown();
}

const searchProductsDebounced = useDebounceFn(searchAndShowDropdownResults, SEARCH_BAR_DEBOUNCE_TIME);

async function onSearchPhraseChanged() {
  searchInProgress.value = true;
  await searchProductsDebounced();
  searchInProgress.value = false;
}

async function getSearchHistory() {
  await loadSearchHistory();
  showSearchDropdown();
}

function onSearchBarFocused() {
  void getSearchHistory();

  if (trimmedSearchPhrase.value) {
    void searchAndShowDropdownResults();
  }
}

const handleFocusOut = (event: FocusEvent) => {
  // if focus moved outside of the dropdown, close the dropdown
  if (!searchDropdownElement.value?.contains(event.relatedTarget as Node)) {
    hideSearchDropdown();
  }
};

whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });

onMounted(() => {
  if (searchPhraseInUrl.value) {
    searchPhrase.value = searchPhraseInUrl.value;
  }
});

const onBarcodeScanned = (value: string) => {
  if (value) {
    searchPhrase.value = value;
    goToSearchResultsPage();
  }
};
</script>
