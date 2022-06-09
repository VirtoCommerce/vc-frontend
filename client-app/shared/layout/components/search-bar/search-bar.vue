<template>
  <div class="flex flex-grow items-stretch relative">
    <input
      v-model.trim="searchPhrase"
      :placeholder="$t('shared.layout.search_bar.enter_keyword_placeholder')"
      maxlength="30"
      class="flex-grow px-4 h-[2.625rem] font-medium text-sm outline-none disabled:bg-gray-200 border rounded-l text-[0.95rem]"
      @keyup.enter="search"
      @keyup.esc="searchDropdownVisible && hideSearchDropdown()"
      @input="searchProductsDebounced"
    />

    <VcButton class="!rounded-l-none !rounded-r w-[2.75rem] !h-[2.625rem]" @click="search">
      <i class="fas fa-search text-[color:var(--color-white)] cursor-pointer" />
    </VcButton>

    <!-- Dropdown -->
    <transition name="slide-fade-top">
      <div
        v-if="searchDropdownVisible"
        class="absolute top-[3.7rem] z-20 w-full flex flex-col gap-3 rounded bg-white shadow-lg overflow-hidden w-[43rem] xl:w-[48rem] min-w-full"
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
                  <router-link
                    :to="categoriesRoutes[category.id]"
                    v-html="category.name"
                    class="py-1 block"
                    @click="hideSearchBar"
                  />
                </li>
              </ul>
            </div>
          </section>

          <!-- Products -->
          <section v-if="products.length">
            <header class="px-5 py-2 text-xs text-gray-500 bg-gray-100">
              {{ $t("shared.layout.search_bar.products_label") }}
            </header>

            <div class="px-5 pt-[1.3rem] pb-3 grid grid-cols-2 gap-5 xl:gap-[1.9rem]">
              <SearchBarProductCard
                v-for="product in products"
                :key="product.id"
                :product="product"
                @link-click="hideSearchBar"
              />
            </div>
          </section>

          <!-- Actions -->
          <section v-if="total" class="px-5 py-3 border-t border-gray-100">
            <VcButton
              :to="{ name: 'Search', query: { [QueryParamName.SearchPhrase]: searchPhrase } }"
              class="uppercase px-4"
              size="sm"
              @click="isApplied && hideSearchDropdown()"
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

          <p class="inline-block" v-html="$t('shared.layout.search_bar.no_results', { searchPhrase })" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { clickOutside } from "@core/directives";

export default {
  directives: {
    clickOutside, // VueUse (v7.5.5) onClickOutside doesn't work in Safari
  },
};
</script>

<script setup lang="ts">
import { VcButton, VcImage } from "@/components";
import { useSearchBar } from "@/shared/layout";
import { computed, inject, ref, watchEffect } from "vue";
import { configInjectionKey } from "@core/injection-keys";
import { useRouteQueryParam } from "@core/composables";
import QueryParamName from "@core/query-param-name.enum";
import { Category } from "@core/api/graphql/types";
import SearchBarProductCard from "./_internal/search-bar-product-card.vue";
import { useDebounceFn, whenever } from "@vueuse/core";
import { useCategoriesRoutes } from "@/shared/catalog";

// Number of categories column items in dropdown list
const CATEGORIES_ITEMS_PER_COLUMN = 4;

const SEARCH_BAR_DEBOUNCE_TIME = 500;

const config = inject(configInjectionKey);

const {
  total,
  loading,
  products,
  categories,
  searchBarVisible,
  searchDropdownVisible,
  hideSearchBar,
  hideSearchDropdown,
  showSearchDropdown,
  searchResults,
} = useSearchBar();

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

async function search() {
  const MAX_LENGTH = 30;
  const MIN_LENGTH = config?.search_min_chars || 0;
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
      itemsPerPage: 9,
    },
    categories: {
      itemsPerPage: CATEGORIES_ITEMS_PER_COLUMN * COLUMNS,
    },
  });

  await showSearchDropdown();
}

const searchProductsDebounced = useDebounceFn(() => {
  search();
}, SEARCH_BAR_DEBOUNCE_TIME);

watchEffect(() => (searchPhrase.value = searchPhraseInUrl.value ?? ""));
whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });
</script>
