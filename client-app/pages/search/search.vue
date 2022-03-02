<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner grow">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <div class="flex items-start lg:gap-6">
        <!-- Content -->
        <div class="lg:w-3/4 xl:w-4/5 flex-grow">
          <template v-if="products.length || loading">
            <div class="flex flex-col">
              <h1 class="text-2xl md:mt-2 md:mb-4">
                Your search for "<strong>{{ searchParams.keyword }}</strong
                >" revealed the following
              </h1>

              <div class="flex justify-start mb-6 mt-4">
                <!-- View options -->
                <ViewMode v-model:mode="viewMode" class="hidden md:inline-flex mr-6" />

                <!-- Page size -->
                <PageSize v-model:size="itemsPerPage" class="hidden md:flex" />

                <!-- Sorting -->
                <div class="flex items-center flex-grow md:flex-grow-0 ml-auto">
                  <span class="shrink-0 mr-2">Sort by:</span>

                  <VcSelect
                    v-model="sort"
                    text-field="name"
                    :is-disabled="loading"
                    :items="productSortingList"
                    class="w-full md:w-52 lg:w-64"
                  />
                </div>
              </div>
            </div>

            <!-- Products -->
            <DisplayProducts
              :loading="loading"
              :view-mode="viewMode"
              :items-per-page="itemsPerPage"
              :products="products"
              :class="
                viewMode === 'list'
                  ? 'space-y-5'
                  : 'grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 lg:gap-x-6 lg:gap-y-8'
              "
            >
              <template #cart-handler="{ item }">
                <VcButton
                  v-if="item.hasVariations"
                  :to="{ name: 'Product', params: { productId: item.id } }"
                  :class="{ 'w-full': viewMode === 'list' }"
                  class="uppercase mb-4"
                >
                  Choose
                </VcButton>

                <AddToCart v-else :product="item"></AddToCart>
              </template>
            </DisplayProducts>

            <!-- VcPagination and options bottom block -->
            <div class="flex justify-center md:justify-between pt-11">
              <VcPagination v-model:page="page" :pages="pages" />

              <div class="flex">
                <!-- View options -->
                <ViewMode v-model:mode="viewMode" class="hidden md:inline-flex mr-6" />

                <!-- Page size -->
                <PageSize v-model:size="itemsPerPage" class="hidden md:flex" />
              </div>
            </div>
          </template>

          <!-- Not found -->
          <div v-else class="my-16 text-center">
            <svg width="47" height="47" class="inline-block mb-4 md:mb-0 md:mr-5 text-primary">
              <use href="/static/images/search-not-found.svg#search-not-found" />
            </svg>

            <p class="md:inline-block">
              No results were found for your "<strong>{{ searchParams.keyword }}</strong
              >" query
            </p>

            <div class="md:hidden mt-10">
              <VcButton to="/" size="md" class="w-40 uppercase">Home page</VcButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from "vue";
import { breakpointsTailwind, debouncedWatch, useBreakpoints } from "@vueuse/core";
import { PageSize, DisplayProducts, useProducts, useProductsSearchParams, ViewMode } from "@/shared/catalog";
import { VcButton, VcPagination, VcSelect } from "@/components";
import { AddToCart } from "@/shared/cart";
import { useRouteQueryParam } from "@core/composables";
import { defaultMobilePageSize, defaultPageSize, pageSizes, productSortingList } from "@core/constants";

const breakpoints = useBreakpoints(breakpointsTailwind);
const { fetchProducts, loading, products, pages } = useProducts();
const { searchParams, updateSearchParams } = useProductsSearchParams({
  defaultSortBy: productSortingList[0].id,
  sortList: productSortingList.map((item) => item.id),
  defaultItemsPerPage: defaultPageSize,
  itemsPerPageList: [...pageSizes, /* for mobile */ defaultMobilePageSize],
});

const isMobile = breakpoints.smaller("md");

const viewMode = useRouteQueryParam<"grid" | "list">("viewMode", {
  defaultValue: "grid",
  validator: (value) => (isMobile.value ? false : ["grid", "list"].includes(value)),
});

const page = computed<number>({
  get: () => searchParams.value.page,
  set(value) {
    updateSearchParams({
      page: value,
    });
  },
});

const itemsPerPage = computed<number>({
  get: () => searchParams.value.itemsPerPage,
  set(value) {
    updateSearchParams({
      itemsPerPage: value,
      page: 1,
    });
  },
});

const sort = computed<typeof productSortingList[0]>({
  get: () => productSortingList.find((item) => item.id === searchParams.value.sort)!,
  set(value) {
    updateSearchParams({
      sort: value.id,
      page: 1,
    });
  },
});

async function loadProducts() {
  await fetchProducts(searchParams.value);
}

onMounted(async () => {
  // Check the number of items on the page
  if (isMobile.value && itemsPerPage.value !== defaultMobilePageSize) {
    await updateSearchParams(
      {
        itemsPerPage: defaultMobilePageSize,
        page: 1,
      },
      "replace"
    );
  } else if (!isMobile.value && !pageSizes.includes(itemsPerPage.value)) {
    await updateSearchParams(
      {
        itemsPerPage: defaultPageSize,
        page: 1,
      },
      "replace"
    );
  } else {
    await loadProducts();
  }

  // Handle window resize to fix parameters on mobile view
  watch(isMobile, (mobileView) => {
    updateSearchParams(
      {
        itemsPerPage: mobileView ? defaultMobilePageSize : defaultPageSize,
        page: 1,
      },
      "replace"
    );
  });
});

debouncedWatch(() => JSON.stringify(searchParams.value), loadProducts, {
  flush: "post",
  debounce: 200,
});
</script>
