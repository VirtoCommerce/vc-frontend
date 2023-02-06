<template>
  <div class="flex flex-grow items-stretch relative" v-click-outside="hideSearchDropdown">
    <VcInput
      v-model="searchPhrase"
      :maxlength="MAX_LENGTH"
      class="flex-grow text-sm"
      input-class="!pl-4 !pr-8 font-medium disabled:bg-gray-200 !rounded-r-none text-[0.95rem]"
      :placeholder="$t('shared.layout.search_bar.enter_keyword_placeholder')"
      @keyup.enter="goToSearchResultsPage"
      @keyup.esc="searchDropdownVisible && hideSearchDropdown()"
      @input="onSearchPhraseChanged()"
    />

    <button v-if="searchPhrase" class="absolute right-[3.8rem] top-[0.95rem]" @click="reset">
      <svg class="text-[color:var(--color-primary)]" height="14" width="14">
        <use href="/static/images/delete.svg#main" />
      </svg>
    </button>

    <VcButton class="!rounded-l-none !rounded-r w-[2.75rem]" size="lg" @click="goToSearchResultsPage">
      <i class="fas fa-search text-[color:var(--color-white)] cursor-pointer" />
    </VcButton>

    <!-- Dropdown -->
    <transition name="slide-fade-top">
      <div
        v-if="searchDropdownVisible"
        class="absolute top-[3.45rem] -left-[10rem] z-20 w-full flex flex-col gap-3 rounded bg-white shadow-lg overflow-hidden"
        style="min-width: calc(100% + 10rem)"
      >
        <!-- Results -->
        <template v-if="categories.length || products.length">
          <!-- Categories -->
          <section v-if="categories.length">
            <header class="px-5 py-2 text-xs text-gray-500 bg-gray-100">
              {{ $t("shared.layout.search_bar.categories_label") }}
            </header>

            <div class="flex gap-5 px-5 pt-2.5 pb-3 text-sm">
              <ul v-for="(column, index) in categoriesColumns" :key="index" class="">
                <li v-for="category in column" :key="category.name">
                  <router-link :to="categoriesRoutes[category.id]" class="py-1 block" @click="hideSearchDropdown">
                    <span v-html="category.name" />
                  </router-link>
                </li>
              </ul>
            </div>
          </section>

          <!-- Products -->
          <section v-if="products.length" class="pb-4">
            <header class="px-5 py-2 text-xs text-gray-500 bg-gray-100">
              {{ $t("shared.layout.search_bar.products_label") }}
            </header>

            <div class="px-5 pt-[1.3rem] pb-3 grid grid-cols-2 gap-5 xl:gap-[1.9rem]">
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
          <section v-if="total" class="mt-0.5 px-5 py-3 border-t border-gray-100">
            <VcButton
              :to="{ name: 'Search', query: { [QueryParamName.SearchPhrase]: searchPhrase } }"
              class="uppercase px-4"
              size="sm"
              @click="hideSearchDropdown()"
            >
              {{ $t("shared.layout.search_bar.view_all_results_button", { total }) }}
            </VcButton>
          </section>
        </template>

        <!-- Not found -->
        <div v-else-if="!loading" class="my-16 text-center">
          <svg width="47" height="47" class="inline-block mr-5 text-primary">
            <use href="/static/images/search-not-found.svg#search-not-found" />
          </svg>

          <i18n-t class="inline-block" keypath="shared.layout.search_bar.no_results" tag="p">
            <template v-slot:keyword>
              <strong>{{ searchPhrase }}</strong>
            </template>
          </i18n-t>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { clickOutside } from "@/core/directives";

export default {
  directives: {
    clickOutside, // VueUse (v7.5.5) onClickOutside doesn't work in Safari
  },
};
</script>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useSearchBar } from "@/shared/layout";
import { computed, inject, ref, watchEffect } from "vue";
import { configInjectionKey, QueryParamName } from "@/core/constants";
import { useCategoriesRoutes, useGoogleAnalytics, useRouteQueryParam } from "@/core/composables";
import { Category } from "@/xapi/types";
import { useDebounceFn, whenever } from "@vueuse/core";
import SearchBarProductCard from "./_internal/search-bar-product-card.vue";
import VcInput from "@/ui-kit/components/atoms/input/vc-input.vue";

// Number of categories column items in dropdown list
const CATEGORIES_ITEMS_PER_COLUMN = 4;

const SEARCH_BAR_DEBOUNCE_TIME = 500;

const config = inject(configInjectionKey);

const MAX_LENGTH = config?.search_max_chars || 999;
const MIN_LENGTH = config?.search_min_chars || 0;

const {
  total,
  loading,
  products,
  categories,
  searchBarVisible,
  searchDropdownVisible,
  hideSearchDropdown,
  showSearchDropdown,
  searchResults,
} = useSearchBar();

const ga = useGoogleAnalytics();
const router = useRouter();

const { queryParam: searchPhraseInUrl } = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const categoriesRoutes = useCategoriesRoutes(categories);

const searchPhrase = ref("");

const isApplied = computed<boolean>(() => searchPhraseInUrl.value === searchPhrase.value);

const categoriesColumns = computed<Array<Category[]>>(() => {
  const columnsCount: number = Math.ceil(categories.value.length / CATEGORIES_ITEMS_PER_COLUMN);

  return Array.from({ length: columnsCount }).map((_, index) => {
    const column: number = index + 1;
    return categories.value.slice((column - 1) * CATEGORIES_ITEMS_PER_COLUMN, column * CATEGORIES_ITEMS_PER_COLUMN);
  });
});

async function searchAndShowDropdownResults() {
  const COLUMNS = 5;

  if (searchDropdownVisible.value) {
    await hideSearchDropdown();
  }

  if (
    loading.value ||
    searchPhrase.value === "" ||
    searchPhrase.value.length > MAX_LENGTH ||
    searchPhrase.value.length < MIN_LENGTH
  ) {
    return;
  }

  await searchResults({
    keyword: searchPhrase.value,
    products: {
      itemsPerPage: 6,
    },
    categories: {
      itemsPerPage: CATEGORIES_ITEMS_PER_COLUMN * COLUMNS,
    },
  });

  if (!isApplied.value) {
    await showSearchDropdown();
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

async function goToSearchResultsPage() {
  await hideSearchDropdown();
  router.push({
    name: "Search",
    query: {
      [QueryParamName.SearchPhrase]: searchPhrase.value,
    },
  });
}

async function reset() {
  searchPhrase.value = "";
  await hideSearchDropdown();
}

const searchProductsDebounced = useDebounceFn(async () => {
  if (!isApplied.value) {
    await searchAndShowDropdownResults();
  }
}, SEARCH_BAR_DEBOUNCE_TIME);

const onSearchPhraseChanged = () => {
  hideSearchDropdown();
  searchProductsDebounced();
};

watchEffect(() => (searchPhrase.value = searchPhraseInUrl.value ?? ""));
whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });
</script>
