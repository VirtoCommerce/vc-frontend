<template>
  <div ref="searchBarElement" class="relative flex grow items-stretch">
    <VcInput
      v-model.trim="searchPhrase"
      :maxlength="MAX_LENGTH"
      class="w-full"
      :placeholder="$t('shared.layout.search_bar.enter_keyword_placeholder')"
      @keyup.enter="goToSearchResultsPage"
      @keyup.esc="hideSearchDropdown"
      @input="onSearchPhraseChanged"
    >
      <template #append>
        <button v-if="searchPhrase" type="button" class="flex h-full items-center px-3" @click="reset">
          <VcIcon name="delete-2" size="xs" class="text-[color:var(--color-primary)]" />
        </button>

        <VcButton icon="search" @click="goToSearchResultsPage" />
      </template>
    </VcInput>

    <!-- Dropdown -->
    <transition name="slide-fade-top">
      <div
        v-if="searchDropdownVisible"
        class="absolute left-0 top-[3.45rem] z-20 flex w-full flex-col gap-1 overflow-y-auto rounded bg-white shadow-lg"
        :style="searchDropdownStyle"
      >
        <!-- Results -->
        <template v-if="isExistResults">
          <!-- Suggestions -->
          <section v-if="suggestions.length">
            <header class="bg-gray-100 px-5 py-2 text-xs text-gray-500">
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
                    <VcIcon name="search-circle" size="xs" class="shrink-0 text-[--color-neutral-300]" />
                    <span class="truncate" v-html="suggestion.label" />
                  </router-link>
                </li>
              </ul>
            </div>
          </section>

          <!-- Pages -->
          <section v-if="pages.length">
            <header class="bg-gray-100 px-5 py-2 text-xs text-gray-500">
              {{ $t("shared.layout.search_bar.pages_label") }}
            </header>

            <div class="flex gap-5 px-5 pb-3 pt-2.5 text-sm">
              <ul>
                <li v-for="page in pages" :key="page.relativeUrl">
                  <router-link :to="page.relativeUrl!" class="block py-1" @click="hideSearchDropdown">
                    <span v-html="page.name" />
                  </router-link>
                </li>
              </ul>
            </div>
          </section>

          <!-- Categories -->
          <section v-if="categories.length">
            <header class="bg-gray-100 px-5 py-2 text-xs text-gray-500">
              {{ $t("shared.layout.search_bar.categories_label") }}
            </header>

            <div class="flex gap-5 px-5 pb-3 pt-2.5 text-sm">
              <ul v-for="(column, index) in categoriesColumns" :key="index">
                <li v-for="category in column" :key="category.name">
                  <router-link :to="categoriesRoutes[category.id]" class="block py-1" @click="hideSearchDropdown">
                    <span v-html="category.name" />
                  </router-link>
                </li>
              </ul>
            </div>
          </section>

          <!-- Products -->
          <section v-if="products.length" class="pb-4">
            <header class="bg-gray-100 px-5 py-2 text-xs text-gray-500">
              {{ $t("shared.layout.search_bar.products_label") }}
            </header>

            <div class="grid grid-cols-2 gap-5 px-5 pb-3 pt-[1.3rem] xl:gap-[1.9rem]">
              <SearchBarProductCard
                v-for="product in products"
                :key="product.id"
                :product="product"
                @link-click="
                  hideSearchDropdown();
                  ga.selectItem(product);
                "
              />
            </div>
          </section>

          <!-- Actions -->
          <section v-if="total" class="sticky bottom-0 mt-0.5 border-t border-gray-100 bg-white px-5 py-3">
            <VcButton
              :to="{ name: 'Search', query: { [QueryParamName.SearchPhrase]: searchPhrase } }"
              size="sm"
              @click="hideSearchDropdown()"
            >
              {{ $t("shared.layout.search_bar.view_all_results_button", { total }) }}
            </VcButton>
          </section>
        </template>

        <!-- Not found -->
        <div v-else-if="!loading" class="my-16 text-center">
          <VcIcon name="search-not-found" class="mr-5 inline-block !h-12 !w-12 text-[color:var(--color-primary)]" />

          <i18n-t class="inline-block" keypath="shared.layout.search_bar.no_results" tag="p">
            <template #keyword>
              <strong>{{ searchPhrase }}</strong>
            </template>
          </i18n-t>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useDebounceFn, useElementBounding, whenever } from "@vueuse/core";
import { computed, inject, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useCategoriesRoutes, useGoogleAnalytics, useRouteQueryParam, useThemeContext } from "@/core/composables";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import globals from "@/core/globals";
import { configInjectionKey } from "@/core/injection-keys";
import { getFilterExpressionForCategorySubtree } from "@/core/utilities";
import { useSearchBar } from "../../composables";
import SearchBarProductCard from "./_internal/search-bar-product-card.vue";
import type { GetSearchResultsParamsType } from "@/xapi/graphql/catalog";
import type { Category } from "@/xapi/types";
import type { StyleValue } from "vue";
import type { RouteLocationRaw } from "vue-router";

const searchBarElement = ref<HTMLElement | null>(null);

// Number of categories column items in dropdown list
const CATEGORIES_ITEMS_PER_COLUMN = 4;

const SEARCH_BAR_DEBOUNCE_TIME = 300;

const config = inject(configInjectionKey);

const MAX_LENGTH = config?.search_max_chars || 999;
const MIN_LENGTH = config?.search_min_chars || 0;

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

const ga = useGoogleAnalytics();
const router = useRouter();
const { themeContext } = useThemeContext();

const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const categoriesRoutes = useCategoriesRoutes(categories);

const searchPhrase = ref("");

const isApplied = computed<boolean>(() => searchPhraseInUrl.value === searchPhrase.value);

const { bottom } = useElementBounding(searchBarElement);

const searchDropdownStyle = computed<StyleValue | undefined>(() => {
  return { maxHeight: bottom.value ? `calc(100vh - ${bottom.value + 40}px)` : "auto" };
});

onClickOutside(searchBarElement, () => hideSearchDropdown());

const categoriesColumns = computed<Array<Category[]>>(() => {
  const columnsCount: number = Math.ceil(categories.value.length / CATEGORIES_ITEMS_PER_COLUMN);

  return Array.from({ length: columnsCount }).map((_, index) => {
    const column: number = index + 1;
    return categories.value.slice((column - 1) * CATEGORIES_ITEMS_PER_COLUMN, column * CATEGORIES_ITEMS_PER_COLUMN);
  });
});

const isExistResults = computed(
  () => categories.value.length || products.value.length || suggestions.value.length || pages.value.length
);

async function searchAndShowDropdownResults() {
  const COLUMNS = 5;
  const { catalogId } = globals;
  const { product_search_phrase_suggestions_enabled, search_by_static_content_enabled } = themeContext.value.settings;

  hideSearchDropdown();

  if (
    loading.value ||
    searchPhrase.value === "" ||
    searchPhrase.value.trim().length > MAX_LENGTH ||
    searchPhrase.value.trim().length < MIN_LENGTH
  ) {
    return;
  }

  const params: GetSearchResultsParamsType = {
    keyword: searchPhrase.value,
    filter: getFilterExpressionForCategorySubtree({ catalogId }),
    categories: {
      itemsPerPage: CATEGORIES_ITEMS_PER_COLUMN * COLUMNS,
    },
    products: {
      itemsPerPage: 6,
    },
  };

  if (product_search_phrase_suggestions_enabled) {
    params.productSuggestions = { suggestionsSize: 4 };
  }

  if (search_by_static_content_enabled) {
    params.pages = { itemsPerPage: DEFAULT_PAGE_SIZE };
  }

  await searchResults(params);

  if (!isApplied.value) {
    showSearchDropdown();
  }

  /**
   * Send Google Analytics event for products.
   */
  if (products.value.length) {
    ga.viewItemList(products.value, {
      item_list_name: `Search phrase "${searchPhrase.value}"`,
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
  if (searchPhrase.value.trim()) {
    hideSearchDropdown();
    const route = getSearchRoute(searchPhrase.value);
    router.push(route);
  }
}

function reset() {
  searchPhrase.value = "";
  hideSearchDropdown();
}

const searchProductsDebounced = useDebounceFn(() => {
  if (!isApplied.value) {
    searchAndShowDropdownResults();
  }
}, SEARCH_BAR_DEBOUNCE_TIME);

function onSearchPhraseChanged() {
  hideSearchDropdown();
  searchProductsDebounced();
}

watchEffect(() => (searchPhrase.value = searchPhraseInUrl.value ?? ""));
whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });
</script>
