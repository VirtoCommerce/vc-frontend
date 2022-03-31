<template>
  <div
    class="flex items-center justify-between px-12 py-7 bg-[color:var(--color-search-bar-bg)] select-none"
    v-click-outside="() => searchDropdownVisible && hideSearchDropdown()"
  >
    <router-link to="/">
      <VcImage :src="$cfg.logo_inverted_image" class="h-12 mr-8" lazy />
    </router-link>

    <div class="flex flex-grow relative">
      <input
        v-model.trim="searchPhrase"
        :disabled="loading"
        maxlength="30"
        placeholder="Enter keyword, item, model or replacement part number"
        class="flex-grow mr-4 rounded h-10 px-4 font-medium text-sm outline-none disabled:bg-gray-200"
        @keyup.enter="search"
        @keyup.esc="searchDropdownVisible && hideSearchDropdown()"
        @input="searchDropdownVisible && hideSearchDropdown()"
      />

      <VcButton class="uppercase px-4 h-10" @click="search">Search</VcButton>

      <!-- Dropdown -->
      <transition name="slide-fade-top">
        <div
          v-if="searchDropdownVisible"
          class="absolute top-14 w-full flex flex-col gap-3 rounded bg-white shadow-lg overflow-hidden"
        >
          <!-- Results -->
          <template v-if="categories.length || products.length">
            <!-- Categories -->
            <section v-if="categories.length">
              <header class="px-5 py-2 text-xs text-gray-500 bg-gray-100">Categories</header>

              <div class="flex gap-5 px-5 py-3 text-sm">
                <ul v-for="(column, index) in categoriesColumns" :key="index" class="w-1/5">
                  <li v-for="category in column" :key="category.name">
                    <router-link
                      :to="{
                        name: 'Catalog',
                        params: { categorySeoUrls: category.seoInfo?.semanticUrl },
                      }"
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
              <header class="px-5 py-2 text-xs text-gray-500 bg-gray-100">Products</header>

              <div class="px-5 pt-5 pb-3 grid grid-cols-3 gap-5 xl:gap-7">
                <SearchBarProductCard
                  v-for="product in products"
                  :key="product.id"
                  :product="product"
                  @link-click="hideSearchBar"
                />
              </div>
            </section>

            <!-- Actions -->
            <section v-if="total" class="px-5 py-4 border-t border-gray-100">
              <VcButton
                :to="{ name: 'Search', query: { [QueryParamName.SearchPhrase]: searchPhrase } }"
                class="uppercase px-4"
                size="sm"
                @click="isApplied && hideSearchDropdown()"
              >
                View all {{ total }} results
              </VcButton>
            </section>
          </template>

          <!-- Not found -->
          <div v-else-if="!loading" class="my-16 text-center">
            <svg width="47" height="47" class="inline-block mr-5 text-primary">
              <use href="/static/images/search-not-found.svg#search-not-found" />
            </svg>

            <p class="inline-block">
              No results were found for your "<strong>{{ searchPhrase }}</strong
              >" query
            </p>
          </div>
        </div>
      </transition>
    </div>

    <button @click="hideSearchBar" class="h-10 px-2 ml-2 -mr-2 appearance-none">
      <i class="fas fa-times text-2xl text-white" />
    </button>
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
import { computed, ref, watchEffect } from "vue";
import { useRouteQueryParam } from "@core/composables";
import QueryParamName from "@core/query-param-name.enum";
import { Category } from "@core/api/graphql/types";
import SearchBarProductCard from "./_internal/search-bar-product-card.vue";
import { whenever } from "@vueuse/core";

// Number of categories column items in dropdown list
const CATEGORIES_ITEMS_PER_COLUMN = 4;

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

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);

const isApplied = computed<boolean>(() => searchPhraseInUrl.value === searchPhrase.value);

const categoriesColumns = computed<Array<Category[]>>(() => {
  const columnsCount: number = Math.ceil(categories.value.length / CATEGORIES_ITEMS_PER_COLUMN);

  return Array.from({ length: columnsCount }).map((_, index) => {
    const column: number = index + 1;
    return categories.value.slice((column - 1) * CATEGORIES_ITEMS_PER_COLUMN, column * CATEGORIES_ITEMS_PER_COLUMN);
  });
});

async function search() {
  if (loading.value || !searchPhrase.value || searchPhrase.value.length > 30) {
    return;
  }

  await searchResults({
    keyword: searchPhrase.value,
    products: {
      itemsPerPage: 9,
    },
    categories: {
      itemsPerPage: CATEGORIES_ITEMS_PER_COLUMN * 5, // five columns
    },
  });

  await showSearchDropdown();
}

watchEffect(() => (searchPhrase.value = searchPhraseInUrl.value ?? ""));
whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });
</script>
