<template>
  <div ref="searchBarElement" class="search-bar">
    <VcInput
      v-model="searchPhrase"
      type="search"
      :maxlength="MAX_LENGTH"
      class="search-bar__input"
      :clearable="!!searchPhrase"
      :placeholder="searchPlaceholder"
      @clear="reset"
      @keyup.enter="handleSearchAndSaveQuery"
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
          @click="handleSearchAndSaveQuery"
        />
      </template>
    </VcInput>

    <VcIcon hugeIcon name="Search01Icon" size="lg" color="primary" />

    <!-- Dropdown -->
    <transition name="slide-fade-top">
      <div
        v-if="searchDropdownVisible"
        ref="searchDropdownElement"
        class="search-bar__dropdown"
        :style="searchDropdownStyle"
        data-dropdown
        @focusout="handleFocusOut"
      >
        <!-- Results and history -->
        <!-- Search history and suggestions -->
        <template v-if="(searchHistoryQueries.length && !searchHistoryLoading) || (suggestions.length && !loading)">
          <header class="search-bar__head">
            {{ $t("shared.layout.search_bar.suggestions_and_history_label") }}
          </header>

          <ul class="search-bar__list">
            <VcMenuItem
              v-for="query in searchHistoryQueries"
              :key="query"
              role="menuitem"
              :label="query"
              tag="li"
              truncate
              nowrap
              color="secondary"
              @click="handleSearchHistoryClick(query)"
              @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
              @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
            >
              <template #prepend>
                <VcIcon name="history" size="md" />
              </template>

              <span v-html-safe="highlightSearchText(query, trimmedSearchPhrase)" class="[word-break:break-word]" />
            </VcMenuItem>

            <VcMenuItem
              v-for="suggestion in suggestions"
              :key="suggestion.text"
              :to="getSearchRoute(suggestion.text)"
              role="menuitem"
              tag="li"
              truncate
              color="secondary"
              @click="hideSearchDropdown"
              @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
              @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
            >
              <span v-html-safe="suggestion.label" class="[word-break:break-word]" />
            </VcMenuItem>
          </ul>
        </template>
        <!-- Search history and suggestions end -->

        <!-- Pages -->
        <template v-if="pages.length">
          <header class="search-bar__head">
            {{ $t("shared.layout.search_bar.pages_label") }}
          </header>

          <ul class="search-bar__grid">
            <VcMenuItem
              v-for="(page, index) in pages"
              :key="index"
              class="w-full"
              role="menuitem"
              :to="page.permalink"
              tag="li"
              size="xs"
              color="secondary"
              @click="hideSearchDropdown"
              @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
              @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
            >
              <span v-html-safe="page.name" class="[word-break:break-word]" />
            </VcMenuItem>
          </ul>
        </template>
        <!-- Pages end -->

        <!-- Categories -->
        <template v-if="categories.length">
          <header class="search-bar__head">
            {{ $t("shared.layout.search_bar.categories_label") }}
          </header>

          <ul v-for="(column, index) in categoriesColumns" :key="index" class="search-bar__grid">
            <VcMenuItem
              v-for="category in column"
              :key="category.name"
              :to="categoriesRoutes[category.id]"
              tag="li"
              role="menuitem"
              color="secondary"
              @click="hideSearchDropdown"
              @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
              @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
            >
              <span v-html-safe="category.name" class="[word-break:break-word]" />
            </VcMenuItem>
          </ul>
        </template>
        <!-- Categories end -->

        <!-- Products -->
        <template v-if="products.length">
          <header class="search-bar__head">
            {{ $t("shared.layout.search_bar.products_label") }}
          </header>

          <div class="search-bar__products">
            <SearchBarProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              @link-click="
                hideSearchDropdown();
                selectItemEvent(product);
              "
              @change-focus="focusPrevNextItem($event.direction, $event.event)"
            />
          </div>
        </template>
        <!-- Products end -->

        <!-- Actions -->
        <div v-if="total" class="search-bar__actions">
          <VcButton
            size="sm"
            tabindex="0"
            @click="handleSearchAndSaveQuery"
            @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
            @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
          >
            {{ $t("shared.layout.search_bar.view_all_results_button", { total }) }}
          </VcButton>
        </div>
        <!-- Results and history end -->

        <!-- Not found -->
        <template v-if="!searchInProgress && !isExistResults && trimmedSearchPhrase">
          <header class="search-bar__head">
            {{ $t("shared.layout.search_bar.search_label") }}
          </header>

          <div class="search-bar__not-found">
            <VcIcon name="search-not-found" size="md" />

            <i18n-t keypath="shared.layout.search_bar.no_results" tag="div">
              <template #keyword>
                <strong>{{ trimmedSearchPhrase }}</strong>
              </template>
            </i18n-t>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useDebounceFn, useElementBounding, whenever } from "@vueuse/core";
import { pickBy } from "lodash";
import { computed, onMounted, ref, toValue, watch } from "vue";
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
  clearSearchResults,
} = useSearchBar();

const { analytics } = useAnalytics();
const router = useRouter();

const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const categoriesRoutes = useCategoriesRoutes(categories);
const { result: searchHistory, load: loadSearchHistory, loading: searchHistoryLoading } = useGetSearchHistoryQuery();

const searchHistoryQueries = computed(() => searchHistory.value?.searchHistory?.queries ?? []);

const searchDropdownElement = ref<HTMLElement | null>(null);

const suppressNextShowDropdown = ref(false);

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

const { searchScopeData, searchScopeFilterExpression, removeScopeItemById, isCategoryScope, preparingScope } =
  useSearchScore();

const { t } = useI18n();

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

  if (!suppressNextShowDropdown.value) {
    showSearchDropdown();
  }

  suppressNextShowDropdown.value = false;

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
  suppressNextShowDropdown.value = true;

  goToSearchResultsPage();
}

function handleSearchHistoryClick(query: string) {
  searchPhrase.value = query;
  goToSearchResultsPage();
}

function goToSearchResultsPage() {
  hideSearchDropdown();
  const ifAlreadySearch = !!router.currentRoute.value.query[QueryParamName.SearchPhrase];

  if (ifAlreadySearch) {
    void router.replace(getSearchRoute(trimmedSearchPhrase.value));
  } else {
    void router.push(getSearchRoute(trimmedSearchPhrase.value));
  }

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

function focusFirstItem() {
  if (!searchDropdownVisible.value) {
    return;
  }

  const item = document.querySelector(".search-bar__dropdown [tabindex='0']") as HTMLElement;

  if (item) {
    item.focus();
  }
}

function focusPrevNextItem(direction: "UP" | "DOWN", event: KeyboardEvent) {
  event.preventDefault();
  const current = event.target as HTMLElement;
  const dropdown = current.closest("[data-dropdown]");

  if (!dropdown) {
    return;
  }

  const items = Array.from(dropdown.querySelectorAll<HTMLElement>('[tabindex="0"]'));

  const index = items.indexOf(current);

  if (index === -1) {
    return;
  }

  const step = direction === "DOWN" ? 1 : -1;
  const nextIndex = (index + step + items.length) % items.length;
  const nextEl = items[nextIndex];

  if (nextEl) {
    nextEl.focus();
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

watch(
  () => searchScopeData.value.queryScope,
  (value) => {
    if (value !== searchPhrase.value) {
      searchPhrase.value = value;
      clearSearchResults();
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
    @apply absolute left-0 top-[3.45rem] z-20 flex w-full min-w-[640px] max-w-[100vw] flex-col overflow-y-auto rounded bg-additional-50 shadow-lg;
  }

  &__head {
    @apply bg-neutral-100 px-5 py-2 text-xs font-bold text-neutral-600;
  }

  &__list {
    @apply px-2 py-3;
  }

  &__grid {
    @apply grid grid-cols-4 gap-2 px-2 py-3;
  }

  &__products {
    @apply grid grid-cols-2 gap-y-0.5 p-3;
  }

  &__actions {
    @apply sticky bottom-0 mt-4 border-t border-neutral-100 bg-additional-50 px-5 py-3;
  }

  &__not-found {
    --vc-icon-color: theme("colors.primary.500");

    @apply flex items-center gap-1.5 px-4 py-6 text-sm text-neutral-500;
  }
}
</style>
