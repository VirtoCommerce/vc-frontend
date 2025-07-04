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
      @keyup.enter="handleSearch()"
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
          @click="handleSearch()"
        />
      </template>
    </VcInput>

    <!-- Dropdown -->
    <transition name="slide-fade-top">
      <div
        v-if="searchDropdownVisible"
        ref="searchDropdownElement"
        class="absolute left-1/2 top-[3.45rem] z-20 flex w-full min-w-[640px] max-w-[100vw] -translate-x-1/2 flex-col gap-1 overflow-y-auto rounded bg-additional-50 shadow-lg"
        :style="searchDropdownStyle"
        @focusout="handleFocusOut"
      >
        <!-- Results and history -->
        <template v-if="isExistResults || searchHistoryQueries.length || searchHistoryLoading">
          <!-- Search history -->
          <section v-if="searchHistoryQueries.length || searchHistoryLoading">
            <header class="bg-neutral-100 px-5 py-2 text-xs text-neutral">
              {{ $t("shared.layout.search_bar.search_history_label") }}
            </header>

            <ul class="px-2 py-3">
              <VcMenuItem v-if="searchHistoryLoading" tag="li" disabled>
                <div class="flex items-center gap-1.5">
                  <VcIcon name="history" size="md" class="shrink-0 fill-secondary-500" />
                  <div class="h-3 w-20 animate-pulse bg-neutral-200"></div>
                </div>
              </VcMenuItem>

              <VcMenuItem
                v-for="query in searchHistoryQueries"
                v-else
                :key="query"
                class="w-full"
                :label="query"
                tag="li"
                truncate
                nowrap
                max-lines="1"
                @click="handleSearchHistoryClick(query)"
              >
                <span class="flex items-center gap-1.5">
                  <VcIcon name="history" size="md" class="shrink-0 fill-secondary-500" />
                  <span v-html-safe="query" />
                </span>
              </VcMenuItem>

              <div
                v-if="searchHistoryQueries.length === 0 && !searchHistoryLoading"
                class="px-2 py-3 text-sm text-neutral-400"
              >
                {{ $t("shared.layout.search_bar.no_search_history") }}
              </div>
            </ul>
          </section>

          <!-- Suggestions -->
          <section v-if="suggestions.length">
            <header class="bg-neutral-100 px-5 py-2 text-xs text-neutral">
              {{ $t("shared.layout.search_bar.suggestions_label") }}
            </header>

            <div class="flex gap-5 px-5 pb-3 pt-2.5 text-sm">
              <ul class="min-w-0">
                <li v-for="suggestion in suggestions" :key="suggestion.text">
                  <router-link
                    :to="getSearchRoute(suggestion.text)"
                    class="flex items-center gap-2 py-1"
                    @click="hideSearchDropdown"
                  >
                    <VcIcon name="search-circle" size="xs" class="shrink-0 fill-neutral-300" />
                    <span v-html-safe="suggestion.label" class="truncate" />
                  </router-link>
                </li>
              </ul>
            </div>
          </section>

          <!-- Pages -->
          <section v-if="pages.length">
            <header class="bg-neutral-100 px-5 py-2 text-xs text-neutral">
              {{ $t("shared.layout.search_bar.pages_label") }}
            </header>

            <div class="flex gap-5 px-5 pb-3 pt-2.5 text-sm">
              <ul>
                <li v-for="(page, index) in pages" :key="index">
                  <router-link :to="page.permalink!" class="block py-1" @click="hideSearchDropdown">
                    <span v-html-safe="page.name" />
                  </router-link>
                </li>
              </ul>
            </div>
          </section>

          <!-- Categories -->
          <section v-if="categories.length">
            <header class="bg-neutral-100 px-5 py-2 text-xs text-neutral">
              {{ $t("shared.layout.search_bar.categories_label") }}
            </header>

            <div class="flex gap-5 px-5 pb-3 pt-2.5 text-sm">
              <ul v-for="(column, index) in categoriesColumns" :key="index">
                <li v-for="category in column" :key="category.name">
                  <router-link :to="categoriesRoutes[category.id]" class="block py-1" @click="hideSearchDropdown">
                    <span v-html-safe="category.name" />
                  </router-link>
                </li>
              </ul>
            </div>
          </section>

          <!-- Products -->
          <section v-if="products.length" class="pb-4">
            <header class="bg-neutral-100 px-5 py-2 text-xs text-neutral">
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

          <!-- Actions -->
          <section v-if="total" class="sticky bottom-0 mt-0.5 border-t border-neutral-100 bg-additional-50 px-5 py-3">
            <VcButton size="sm" @click="handleSearch()">
              {{ $t("shared.layout.search_bar.view_all_results_button", { total }) }}
            </VcButton>
          </section>
        </template>

        <!-- Not found -->
        <div v-else-if="!loading" class="my-16 text-center">
          <VcIcon name="search-not-found" class="mr-5 inline-block !h-12 !w-12 fill-primary" />

          <i18n-t class="inline-block" keypath="shared.layout.search_bar.no_results" tag="p">
            <template #keyword>
              <strong>{{ trimmedSearchPhrase }}</strong>
            </template>
          </i18n-t>
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
const {
  result: searchHistory,
  load: loadSearchHistory,
  loading: searchHistoryLoading,
} = useGetSearchHistoryQuery({
  storeId: "B2B-store",
  maxCount: 10,
});

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

function handleSearch(saveQuery = true) {
  if (saveQuery) {
    void saveSearchQuery(trimmedSearchPhrase.value);
  }

  goToSearchResultsPage();
}

function handleSearchHistoryClick(query: string) {
  searchPhrase.value = query;
  handleSearch(false);
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

function onSearchPhraseChanged() {
  void searchProductsDebounced();
}

function onSearchBarFocused() {
  console.log("onSearchBarFocused");
  void loadSearchHistory();

  if (trimmedSearchPhrase.value) {
    void searchProductsDebounced();
  } else {
    showSearchDropdown();
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
    handleSearch(false);
  }
};
</script>
