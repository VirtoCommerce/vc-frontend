<template>
  <div ref="searchBarElement" class="relative flex grow items-stretch">
    <VcInput
      v-model="searchPhrase"
      type="search"
      :maxlength="MAX_LENGTH"
      class="w-full"
      :placeholder="$t('shared.layout.search_bar.enter_keyword_placeholder')"
      @keyup.enter="goToSearchResultsPage"
      @keyup.esc="hideSearchDropdown"
      @input="onSearchPhraseChanged"
      @focus="onSearchBarFocused"
    >
      <template #append>
        <button v-if="searchPhrase" type="button" class="vc-input__clear" @click.stop="reset">
          <VcIcon name="delete-2" size="xs" />
        </button>
        <BarcodeScanner v-else @scanned-code="onBarcodeScanned" />

        <VcButton
          :aria-label="$t('shared.layout.search_bar.search_button')"
          icon="search"
          :loading="loading"
          @click="goToSearchResultsPage"
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
        <!-- Results -->
        <template v-if="isExistResults">
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
                  analytics('selectItem', product, { search_term: trimmedSearchPhrase });
                "
              />
            </div>
          </section>

          <!-- Actions -->
          <section v-if="total" class="sticky bottom-0 mt-0.5 border-t border-neutral-100 bg-additional-50 px-5 py-3">
            <VcButton size="sm" @click="goToSearchResultsPage">
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
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCategoriesRoutes, useAnalytics, useRouteQueryParam, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { getFilterExpressionForCategorySubtree, getFilterExpressionForZeroPrice } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import SearchBarProductCard from "./_internal/search-bar-product-card.vue";
import BarcodeScanner from "./barcode-scanner.vue";
import type { GetSearchResultsParamsType } from "@/core/api/graphql/catalog";
import type { Category } from "@/core/api/graphql/types";
import type { StyleValue } from "vue";
import type { RouteLocationRaw } from "vue-router";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

const { themeContext } = useThemeContext();

const searchBarElement = ref<HTMLElement | null>(null);

// Number of categories column items in dropdown list
const CATEGORIES_ITEMS_PER_COLUMN = 4;

const SEARCH_BAR_DEBOUNCE_TIME = 300;

const MAX_LENGTH = themeContext.value?.settings?.search_max_chars || 999;
const MIN_LENGTH = themeContext.value?.settings?.search_min_chars || 0;

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

const searchDropdownElement = ref<HTMLElement | null>(null);

const searchPhrase = ref("");
const trimmedSearchPhrase = computed(() => {
  return searchPhrase.value.trim();
});

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

async function searchAndShowDropdownResults(): Promise<void> {
  const COLUMNS = 5;
  const { catalogId, currencyCode } = globals;
  const { search_product_phrase_suggestions_enabled, search_static_content_suggestions_enabled } =
    themeContext.value.settings;

  hideSearchDropdown();

  if (trimmedSearchPhrase.value.length > MAX_LENGTH || trimmedSearchPhrase.value.length < MIN_LENGTH) {
    return;
  }

  const { zero_price_product_enabled } = themeContext.value.settings;
  const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

  const filterExpression = catalog_empty_categories_enabled
    ? undefined
    : [
        getFilterExpressionForCategorySubtree({ catalogId }),
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
    analytics("viewItemList", products.value, {
      item_list_name: `Search phrase "${trimmedSearchPhrase.value}"`,
    });
  }
}

function getSearchRoute(phrase: string): RouteLocationRaw {
  return {
    name: "Search",
    query: {
      [QueryParamName.SearchPhrase]: phrase,
    },
  };
}

function goToSearchResultsPage() {
  if (trimmedSearchPhrase.value) {
    hideSearchDropdown();
    void router.push(getSearchRoute(trimmedSearchPhrase.value));
    analytics("search", trimmedSearchPhrase.value, products.value, total.value);
  }
}

function reset() {
  searchPhrase.value = "";
  hideSearchDropdown();
  void router.push({ name: ROUTES.CATALOG.NAME });
}

const searchProductsDebounced = useDebounceFn(searchAndShowDropdownResults, SEARCH_BAR_DEBOUNCE_TIME);

function onSearchPhraseChanged() {
  hideSearchDropdown();
  void searchProductsDebounced();
}

function onSearchBarFocused() {
  if (trimmedSearchPhrase.value) {
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
    goToSearchResultsPage();
  }
};
</script>
