<template>
  <div v-click-outside="hideSearchDropdown" class="relative flex grow items-stretch">
    <VcInput
      v-model.trim="searchPhrase"
      :maxlength="MAX_LENGTH"
      class="w-full"
      :placeholder="$t('shared.layout.search_bar.enter_keyword_placeholder')"
      @keyup.enter="goToSearchResultsPage"
      @keyup.esc="searchDropdownVisible && hideSearchDropdown()"
      @input="onSearchPhraseChanged()"
    >
      <template #append>
        <button v-if="searchPhrase" type="button" class="h-full px-3" @click="reset">
          <VcIcon name="delete-2" size="xs" class="text-[color:var(--color-primary)]" />
        </button>

        <VcButton class="h-full w-[2.75rem] !rounded-[inherit]" size="lg" @click="goToSearchResultsPage">
          <VcIcon name="search" size="md" class="text-[color:var(--color-white)]" />
        </VcButton>
      </template>
    </VcInput>

    <!-- Dropdown -->
    <transition name="slide-fade-top">
      <div
        v-if="searchDropdownVisible"
        class="absolute top-[3.45rem] left-[-10rem] z-20 flex w-full flex-col gap-3 overflow-hidden rounded bg-white shadow-lg"
        style="min-width: calc(100% + 10rem)"
      >
        <!-- Results -->
        <template v-if="categories.length || products.length">
          <!-- Categories -->
          <section v-if="categories.length">
            <header class="bg-gray-100 px-5 py-2 text-xs text-gray-500">
              {{ $t("shared.layout.search_bar.categories_label") }}
            </header>

            <div class="flex gap-5 px-5 pt-2.5 pb-3 text-sm">
              <ul v-for="(column, index) in categoriesColumns" :key="index" class="">
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

            <div class="grid grid-cols-2 gap-5 px-5 pt-[1.3rem] pb-3 xl:gap-[1.9rem]">
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
          <section v-if="total" class="mt-0.5 border-t border-gray-100 px-5 py-3">
            <VcButton
              :to="{ name: 'Search', query: { [QueryParamName.SearchPhrase]: searchPhrase } }"
              class="px-4 uppercase"
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

<script lang="ts">
import { clickOutside } from "@/core/directives";

export default {
  directives: {
    clickOutside, // TODO: Use directive from VueUse (https://vueuse.org/core/onClickOutside/#directive-usage)
  },
};
</script>

<script setup lang="ts">
import { useDebounceFn, whenever } from "@vueuse/core";
import { computed, inject, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useCategoriesRoutes, useGoogleAnalytics, useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { configInjectionKey } from "@/core/injection-keys";
import { useSearchBar } from "@/shared/layout";
import SearchBarProductCard from "./_internal/search-bar-product-card.vue";
import type { Category } from "@/xapi/types";

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

const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
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
    searchPhrase.value.trim().length > MAX_LENGTH ||
    searchPhrase.value.trim().length < MIN_LENGTH
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
  if (searchPhrase.value.trim()) {
    await hideSearchDropdown();
    router.push({
      name: "Search",
      query: {
        [QueryParamName.SearchPhrase]: searchPhrase.value,
      },
    });
  }
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
