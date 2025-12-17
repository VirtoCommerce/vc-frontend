<template>
  <div
    v-if="visible && hasAnyContent"
    ref="dropdownElement"
    class="search-dropdown"
    data-dropdown
    @focusout="handleFocusOut"
  >
    <VcScrollbar class="search-dropdown__sidebar" :vertical="!isMobile">
      <!-- Search history and suggestions -->
      <div v-if="hasHistoryOrSuggestions" class="search-dropdown__suggestions">
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

      <!-- Pages -->
      <div v-if="hasPages" class="search-dropdown__suggestions">
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

      <!-- Categories -->
      <div v-if="hasCategories" class="search-dropdown__suggestions">
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
    </VcScrollbar>

    <VcScrollbar class="search-dropdown__content" :vertical="!isMobile">
      <!-- Products -->
      <div v-if="hasProducts" class="search-dropdown__suggestions">
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

      <!-- Not found -->
      <div v-if="hasNotFoundMessage" class="search-dropdown__suggestions">
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
    </VcScrollbar>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, useBreakpoints } from "@vueuse/core";
import { pickBy } from "lodash";
import { computed, onMounted, ref, toRefs, toValue, watch } from "vue";
import { useRouter } from "vue-router";
import { useCategoriesRoutes, useRouteQueryParam, useThemeContext, useAnalytics } from "@/core/composables";
import { useHistoricalEvents } from "@/core/composables/useHistoricalEvents";
import { BREAKPOINTS } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { ROUTES } from "@/router/routes/constants";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { highlightSearchText } from "@/shared/layout/utils";
import SearchBarProductCard from "./search-bar/_internal/search-bar-product-card.vue";
import type { GetSearchResultsParamsType } from "@/core/api/graphql/catalog";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  visible: boolean;
  searchPhrase: string;
  filterExpression?: string;
  isCategoryScope?: boolean;
}

interface IEmits {
  (e: "hide"): void;
  (e: "productSelect", product: Product): void;
  (e: "update:searchPhrase", value: string): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { visible } = toRefs(props);

const PRODUCTS_LIMIT = 7;
const CATEGORIES_LIMIT = 5;
const PAGES_LIMIT = 5;
const SUGGESTIONS_LIMIT = 5;

const router = useRouter();
const { themeContext } = useThemeContext();
const { saveSearchQuery, useGetSearchHistoryQuery } = useHistoricalEvents();
const { analytics } = useAnalytics();

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("md");

const dropdownElement = ref<HTMLElement | null>(null);
const searchInProgress = ref(false);

const SEARCH_BAR_DEBOUNCE_TIME = 200;

const { total, loading, pages, products, suggestions, categories, searchResults, maxSearchLength } = useSearchBar();

const categoriesRoutes = useCategoriesRoutes(categories);
const { result: searchHistory, load: loadSearchHistory, loading: searchHistoryLoading } = useGetSearchHistoryQuery();

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

  if (props.isCategoryScope) {
    return {
      path: router.currentRoute.value.path,
      query,
    } as RouteLocationRaw;
  }

  return {
    name: ROUTES.SEARCH.NAME,
    query,
  } as RouteLocationRaw;
}

const searchHistoryQueries = computed(() => searchHistory.value?.searchHistory?.queries ?? []);

const trimmedSearchPhrase = computed(() => props.searchPhrase.trim());

const hasHistoryOrSuggestions = computed(
  () =>
    (searchHistoryQueries.value.length && !searchHistoryLoading.value) || (suggestions.value.length && !loading.value),
);

const hasPages = computed(() => !!pages.value.length);

const hasCategories = computed(() => !!categories.value.length);

const hasProducts = computed(() => !!products.value.length);

const isExistResults = computed(
  () => !!(categories.value.length || products.value.length || suggestions.value.length || pages.value.length),
);

const hasNotFoundMessage = computed(
  () => !searchInProgress.value && !isExistResults.value && !!trimmedSearchPhrase.value,
);

const hasAnyContent = computed(
  () =>
    hasHistoryOrSuggestions.value ||
    hasPages.value ||
    hasCategories.value ||
    hasProducts.value ||
    hasNotFoundMessage.value,
);

const searchBarListProperties = computed(() => ({
  search_term: trimmedSearchPhrase.value,
  item_list_id: "search_bar",
  item_list_name: `Search phrase '${trimmedSearchPhrase.value}'`,
}));

async function searchAndShowDropdownResults(): Promise<void> {
  const { search_product_phrase_suggestions_enabled, search_static_content_suggestions_enabled } =
    themeContext.value.settings;

  if (trimmedSearchPhrase.value.length > maxSearchLength.value || trimmedSearchPhrase.value.length === 0) {
    return;
  }

  const params: GetSearchResultsParamsType = {
    keyword: trimmedSearchPhrase.value,
    filter: props.filterExpression,
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
  emit("update:searchPhrase", query);
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

async function handleSearch() {
  await saveSearchQuery(trimmedSearchPhrase.value);

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
    void onSearchPhraseChanged();
  },
);

watch(visible, (isVisible, wasVisible) => {
  if (isVisible && !wasVisible) {
    void onSearchPhraseChanged();
  }
});

onMounted(() => {
  void loadSearchHistory();

  if (trimmedSearchPhrase.value) {
    void onSearchPhraseChanged();
  }
});

defineExpose({
  dropdownElement,
  handleSearch,
});
</script>

<style lang="scss">
.search-dropdown {
  @apply pt-1 px-3.5 pb-3.5;

  @media (min-width: theme("screens.md")) {
    @apply flex gap-2.5 pb-3 max-h-[inherit] min-h-44;
  }

  @media (min-width: theme("screens.lg")) {
    @apply pt-4 ps-5 pe-2.5 pb-5 rounded-[--vc-radius] shadow-lg bg-additional-50;
  }

  &__sidebar {
    @media (min-width: theme("screens.md")) {
      @apply flex-shrink-0 w-[12rem] max-h-full pe-2.5;
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-[15.875rem];
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
      @apply flex-1 mt-0 max-h-full pe-2.5;
    }

    &:empty {
      @apply hidden;
    }
  }

  &__products {
    @apply mt-4;

    @media (width < theme("screens.sm")) {
      @apply space-y-5;
    }

    @media (min-width: theme("screens.sm")) {
      @apply grid grid-cols-2 gap-5;
    }
  }

  &__view-all {
    @apply flex justify-center items-center min-h-16 border border-dashed border-secondary-200 rounded-[--vc-radius];
  }

  &__not-found {
    --vc-icon-color: theme("colors.primary.500");

    @apply flex items-center gap-1.5 mt-3 text-sm text-neutral-500;
  }

  &__text {
    word-break: break-word;
  }
}
</style>
