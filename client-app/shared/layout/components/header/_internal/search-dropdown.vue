<template>
  <div ref="dropdownElement" class="search-dropdown" data-dropdown @focusout="handleFocusOut">
    <div class="search-dropdown__sidebar">
      <!-- Search history and suggestions -->
      <transition name="fade-slide">
        <div
          v-if="(searchHistoryQueries.length && !searchHistoryLoading) || (suggestions.length && !loading)"
          class="search-dropdown__suggestions"
        >
          <header class="search-dropdown__head">
            {{ $t("shared.layout.search_bar.suggestions_and_history_label") }}
          </header>

          <ul class="search-dropdown__list">
            <button
              v-for="query in searchHistoryQueries"
              :key="query"
              type="button"
              class="search-dropdown__item"
              tabindex="0"
              @click="handleSearchHistoryClick(query)"
              @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
              @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
            >
              <VcIcon name="history" size="xs" />

              <span v-html-safe="highlightSearchText(query, searchPhrase)" class="search-dropdown__text" />
            </button>

            <VcLink
              v-for="suggestion in suggestions"
              :key="suggestion.text"
              class="search-dropdown__item"
              :to="getSearchRoute(suggestion.text)"
              @click="handleSuggestionClick"
              @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
              @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
            >
              <VcIcon name="search" size="xs" />

              <span v-html-safe="suggestion.label" class="search-dropdown__text" />
            </VcLink>
          </ul>
        </div>
      </transition>

      <!-- Pages -->
      <transition name="fade-slide">
        <div v-if="pages.length" class="search-dropdown__suggestions">
          <header class="search-dropdown__head">
            {{ $t("shared.layout.search_bar.pages_label") }}
          </header>

          <ul class="search-dropdown__list">
            <VcLink
              v-for="(page, index) in pages"
              :key="index"
              class="search-dropdown__item"
              :to="page.permalink"
              @click="$emit('hide')"
              @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
              @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
            >
              <span v-html-safe="page.name" class="search-dropdown__text" />
            </VcLink>
          </ul>
        </div>
      </transition>

      <!-- Categories -->
      <transition name="fade-slide">
        <div v-if="categories.length" class="search-dropdown__suggestions">
          <header class="search-dropdown__head">
            {{ $t("shared.layout.search_bar.categories_label") }}
          </header>

          <ul class="search-dropdown__list">
            <VcLink
              v-for="category in categories"
              :key="category.name"
              class="search-dropdown__item"
              :to="categoriesRoutes[category.id]"
              @click="$emit('hide')"
              @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
              @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
            >
              <span v-html-safe="category.name" class="search-dropdown__text" />
            </VcLink>
          </ul>
        </div>
      </transition>
    </div>

    <div class="search-dropdown__content">
      <!-- Products -->
      <transition name="fade-slide">
        <div v-if="products.length" class="search-dropdown__suggestions">
          <header class="search-dropdown__head">
            {{ $t("shared.layout.search_bar.products_label") }}
          </header>

          <div class="search-dropdown__products">
            <SearchBarProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              @link-click="selectItemEvent(product)"
              @changeFocus="focusPrevNextItem($event.direction, $event.event)"
            />

            <div v-if="total > PRODUCTS_LIMIT" class="search-dropdown__view-all">
              <VcButton
                size="sm"
                tabindex="0"
                color="secondary"
                variant="solid-light"
                append-icon="chevron-right"
                @click="handleSearch"
                @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
                @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
              >
                {{ $t("shared.layout.search_bar.view_all_results_button", { total }) }}
              </VcButton>
            </div>
          </div>
        </div>
      </transition>

      <!-- Not found -->
      <div v-if="!searchInProgress && !isExistResults && searchPhrase" class="search-dropdown__suggestions">
        <header class="search-dropdown__head">
          {{ $t("shared.layout.search_bar.search_label") }}
        </header>

        <div class="search-dropdown__not-found">
          <VcIcon name="search-not-found" size="sm" />

          <i18n-t keypath="shared.layout.search_bar.no_results" tag="div">
            <template #keyword>
              <strong>{{ searchPhrase }}</strong>
            </template>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { pickBy } from "lodash";
import { computed, ref, toValue, watch } from "vue";
import { useRouter } from "vue-router";
import { useCategoriesRoutes, useRouteQueryParam, useThemeContext, useAnalytics } from "@/core/composables";
import { useHistoricalEvents } from "@/core/composables/useHistoricalEvents";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { getFilterExpressionForCategorySubtree, getFilterExpressionForZeroPrice, Logger } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import { highlightSearchText } from "@/shared/layout/utils";
import SearchBarProductCard from "../search-bar/_internal/search-bar-product-card.vue";
import type { GetSearchResultsParamsType } from "@/core/api/graphql/catalog";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  searchPhrase: string;
}

interface IEmits {
  (e: "hide"): void;
  (e: "productSelect", product: Product): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const PRODUCTS_LIMIT = 6;
const CATEGORIES_LIMIT = 5;
const PAGES_LIMIT = 5;
const SUGGESTIONS_LIMIT = 5;

const router = useRouter();
const { themeContext } = useThemeContext();
const { saveSearchQuery, useGetSearchHistoryQuery } = useHistoricalEvents();
const { analytics } = useAnalytics();

const dropdownElement = ref<HTMLElement | null>(null);
const searchInProgress = ref(false);

const SEARCH_BAR_DEBOUNCE_TIME = 200;
const MAX_LENGTH = themeContext.value?.settings?.search_max_chars || 999;

const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const { total, loading, pages, products, suggestions, categories, searchResults, clearSearchResults } = useSearchBar();

const { isCategoryScope, searchScopeFilterExpression, searchScopeData } = useSearchScore();

const categoriesRoutes = useCategoriesRoutes(categories);
const { result: searchHistory, load: loadSearchHistory, loading: searchHistoryLoading } = useGetSearchHistoryQuery();

const searchHistoryQueries = computed(() => searchHistory.value?.searchHistory?.queries ?? []);

const trimmedSearchPhrase = computed(() => props.searchPhrase.trim());

const isExistResults = computed(
  () => !!(categories.value.length || products.value.length || suggestions.value.length || pages.value.length),
);

const searchBarListProperties = computed(() => ({
  search_term: trimmedSearchPhrase.value,
  item_list_id: "search_bar",
  item_list_name: `Search phrase '${trimmedSearchPhrase.value}'`,
}));

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
    const categoryRoute: RouteLocationRaw = {
      path: router.currentRoute.value.path,
      query,
    };

    return categoryRoute;
  }

  const searchRoute: RouteLocationRaw = {
    name: ROUTES.SEARCH.NAME,
    query,
  };

  return searchRoute;
}

async function searchAndShowDropdownResults(): Promise<void> {
  const { catalogId, currencyCode } = globals;
  const { search_product_phrase_suggestions_enabled, search_static_content_suggestions_enabled } =
    themeContext.value.settings;

  if (trimmedSearchPhrase.value.length > MAX_LENGTH || trimmedSearchPhrase.value.length === 0) {
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
      itemsPerPage: CATEGORIES_LIMIT,
    },
    products: {
      itemsPerPage: PRODUCTS_LIMIT,
    },
  };

  if (search_product_phrase_suggestions_enabled) {
    params.productSuggestions = { suggestionsSize: SUGGESTIONS_LIMIT };
  }

  if (search_static_content_suggestions_enabled) {
    params.pages = { itemsPerPage: PAGES_LIMIT };
  }

  await searchResults(params);

  if (products.value.length) {
    analytics("viewItemList", products.value, searchBarListProperties.value);
  }
}

const searchProductsDebounced = useDebounceFn(searchAndShowDropdownResults, SEARCH_BAR_DEBOUNCE_TIME);

async function onSearchPhraseChanged() {
  if (trimmedSearchPhrase.value) {
    searchInProgress.value = true;
    await searchProductsDebounced();
    searchInProgress.value = false;
  } else {
    await loadSearchHistory();
  }
}

function handleSearchHistoryClick(query: string) {
  goToSearchResultsPage(query);
}

function handleSuggestionClick() {
  emit("hide");
}

function goToSearchResultsPage(phrase?: string) {
  const searchQuery = phrase || trimmedSearchPhrase.value;

  emit("hide");

  const ifAlreadySearch = !!router.currentRoute.value.query[QueryParamName.SearchPhrase];

  if (ifAlreadySearch) {
    void router.replace(getSearchRoute(searchQuery));
  } else {
    void router.push(getSearchRoute(searchQuery));
  }

  if (searchQuery) {
    analytics("search", searchQuery, products.value, total.value);
  }
}

function handleSearch() {
  void saveSearchQuery(trimmedSearchPhrase.value);

  goToSearchResultsPage();
}

function selectItemEvent(product: Product) {
  analytics("selectItem", product, searchBarListProperties.value);
  emit("productSelect", product);
  emit("hide");
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

function handleFocusOut(event: FocusEvent) {
  if (!dropdownElement.value?.contains(event.relatedTarget as Node)) {
    emit("hide");
  }
}

watch(
  () => props.searchPhrase,
  () => {
    onSearchPhraseChanged().catch((error: unknown) => {
      Logger.error(`${useSearchBar.name}.onSearchPhraseChanged`, error);
    });
  },
);

watch(
  () => searchScopeData.value.queryScope,
  (value) => {
    if (value !== props.searchPhrase) {
      clearSearchResults();
    }
  },
  { deep: true },
);

const loadPromise = loadSearchHistory();

if (loadPromise) {
  loadPromise.catch((error: unknown) => {
    Logger.error(`${useSearchBar.name}.loadSearchHistory`, error);
  });
}

defineExpose({
  dropdownElement,
  handleSearch,
});
</script>

<style lang="scss">
.search-dropdown {
  @apply pt-1;

  @media (min-width: theme("screens.md")) {
    @apply flex gap-5 py-4 px-5 rounded-[--vc-radius] shadow-lg bg-additional-50;
  }

  &__sidebar {
    @media (min-width: theme("screens.md")) {
      @apply flex-shrink-0 w-[15.875rem];
    }
  }

  &__suggestions {
    @apply mt-0.5;

    &:not(:first-child) {
      @apply mt-4;
    }
  }

  &__head {
    @apply text-xs font-bold text-neutral-600 uppercase;
  }

  &__list {
    @apply flex flex-col mt-1.5 border rounded-[--vc-radius] bg-neutral-50 px-2 py-2;
  }

  &__item {
    --vc-icon-color: theme("colors.secondary.700");

    @apply flex items-center gap-1 py-[0.325rem] px-2 text-sm text-[--link-color];

    &:hover {
      @apply text-[--link-hover-color];
    }
  }

  &__content {
    @apply mt-4;

    @media (min-width: theme("screens.md")) {
      @apply flex-1 mt-0;
    }
  }

  &__products {
    @apply flex flex-col gap-5 mt-4;
  }

  &__view-all {
    @apply flex justify-center items-center h-[5.5rem] border border-dashed border-secondary-200 rounded-[--vc-radius];
  }

  &__not-found {
    --vc-icon-color: theme("colors.primary.500");

    @apply flex items-center gap-1.5 mt-3 text-sm text-neutral-500;
  }

  &__text {
    word-break: break-word;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
