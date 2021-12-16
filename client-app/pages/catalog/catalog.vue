<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="breadcrumbsItems"></Breadcrumbs>

      <div class="flex items-start lg:gap-6">
        <!-- Filters -->
        <div class="hidden lg:flex flex-col gap-5 flex-shrink-0 lg:w-1/4 xl:w-1/5">
          <!-- Search results -->
          <FiltersBlock title="Filter results by">
            <p class="text-sm pb-2">Search within these results</p>
            <div class="flex gap-3">
              <input
                v-model="keyword"
                class="border rounded text-sm leading-8 flex-1 w-full border-gray-300 h-8 px-2 outline-none focus:border-gray-400"
                type="text"
                :disabled="loading"
                @keypress.enter="onSearchStart"
              />
              <button
                class="rounded uppercase px-5 border-2 font-roboto-condensed font-bold text-sm"
                :class="[loading ? 'text-gray-300 border-gray-300' : 'text-yellow-500 border-yellow-500']"
                :disabled="loading"
                @click="onSearchStart"
              >
                Go
              </button>
            </div>
          </FiltersBlock>

          <!-- Previously purchased -->
          <FiltersBlock title="Previously purchased">
            <label class="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-cyan-700 checked:border-transparent focus:outline-none cursor-pointer"
              />
              <span class="ml-2 font-medium">View previously purchased products</span>
            </label>
          </FiltersBlock>

          <!-- Branch availability -->
          <FiltersBlock title="Branch availability">
            <p class="text-sm font-medium">
              <span class="text-cyan-700 font-semibold cursor-pointer hover:text-cyan-900">Select a pickup branch</span>
              to see products in stock now.
            </p>
          </FiltersBlock>
        </div>

        <!-- Mobile filters -->
        <div v-if="mobileFiltersVisible" class="fixed inset-0 bg-gray-800 opacity-95 z-40 w-full h-screen"></div>
        <div
          v-if="mobileFiltersVisible"
          ref="mobileFiltersSidebar"
          class="fixed inset-0 bg-white w-72 z-50 h-screen px-5 pt-12"
        >
          <div class="flex flex-col gap-5">
            <!-- Search results -->
            <FiltersBlock title="Filter results by">
              <p class="text-sm pb-2">Search within these results</p>
              <div class="flex gap-3">
                <input type="text" class="border rounded text-sm flex-1 w-full border-gray-300 p-2.5" />
                <button
                  class="rounded uppercase px-3 border-2 border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                >
                  Go
                </button>
              </div>
            </FiltersBlock>

            <!-- Previously purchased -->
            <FiltersBlock title="Previously purchased">
              <label class="flex items-center text-sm">
                <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                <span class="ml-2">View previously purchased products</span>
              </label>
            </FiltersBlock>

            <!-- Branch availability -->
            <FiltersBlock title="Branch availability">
              <p class="text-sm">
                <span class="text-cyan-700">Select a pickup branch</span> to see products in stock now.
              </p>
            </FiltersBlock>
          </div>
        </div>

        <div class="lg:w-3/4 xl:w-4/5 flex-grow">
          <div class="flex flex-col">
            <h2 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">{{ category?.label }}</h2>
            <p class="py-3">
              <span class="font-extrabold">{{ total }} results found.</span>
              <span>&nbsp;</span>
              <span class="font-normal">
                {{ products.length }} displayed that include {{ products.length }} products.
              </span>
            </p>
            <div class="flex items-end gap-4 mb-6 mt-4">
              <!-- Mobile filters toggler -->
              <div class="lg:hidden">
                <button
                  type="button"
                  class="rounded bg-yellow-500 text-sm font-extrabold px-4 py-2 text-white"
                  @click="mobileFiltersVisible = true"
                >
                  <i class="fas fa-filter mr-1"></i>
                  Filters
                </button>
              </div>

              <!-- View options -->
              <ViewMode v-model:mode="viewMode" class="hidden md:inline-flex mr-6"></ViewMode>

              <!-- Page size -->
              <PageSize
                v-model:size="productSearchParams.itemsPerPage"
                class="hidden md:flex"
                @update:size="loadProducts"
              ></PageSize>

              <!-- Sorting -->
              <div class="relative ml-auto flex-grow md:flex-grow-0">
                <Listbox v-model="sort">
                  <ListboxButton
                    class="w-full md:w-52 lg:w-64 h-9 pl-3 pr-16 text-base bg-white border rounded appearance-none outline-none border-gray-300"
                  >
                    <span class="block truncate text-left">{{ sort.name }}</span>
                    <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <i class="text-gray-700 fas fa-chevron-down"></i>
                    </span>
                  </ListboxButton>
                  <transition
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <ListboxOptions
                      class="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded shadow-lg max-h-60 ring-1 ring-black ring-opacity-5"
                    >
                      <ListboxOption v-for="item in sortOptions" :key="item.id" v-slot="{ selected }" :value="item">
                        <li class="cursor-pointer select-none relative py-1 px-3">
                          <span :class="[selected ? 'text-yellow-500' : 'text-black', 'block truncate']">{{
                            item.name
                          }}</span>
                        </li>
                      </ListboxOption>
                    </ListboxOptions>
                  </transition>
                </Listbox>
              </div>
            </div>
          </div>

          <template v-if="viewMode === 'grid'">
            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8">
              <template v-if="loading">
                <ProductSkeletonGrid v-for="i in productSearchParams.itemsPerPage" :key="i"></ProductSkeletonGrid>
              </template>
              <template v-else>
                <ProductCardGrid v-for="item in products" :key="item.id" :product="item">
                  <template #cart-handler>
                    <AddToCart :product="item"></AddToCart>
                  </template>
                </ProductCardGrid>
              </template>
            </div>
          </template>
          <template v-else>
            <div class="space-y-5">
              <template v-if="loading">
                <ProductSkeletonList v-for="i in productSearchParams.itemsPerPage" :key="i"></ProductSkeletonList>
              </template>
              <template v-else>
                <ProductCardList v-for="item in products" :key="item.id" :product="item">
                  <template #cart-handler>
                    <AddToCart :product="item"></AddToCart>
                  </template>
                </ProductCardList>
              </template>
            </div>
          </template>

          <!-- Pagination and options bottom block -->
          <div class="flex justify-center md:justify-between pt-11">
            <div>
              <Pagination
                v-model:page="productSearchParams.page"
                :pages="pages"
                @update:page="loadProducts"
              ></Pagination>
            </div>
            <div class="flex">
              <!-- View options -->
              <ViewMode v-model:mode="viewMode" class="hidden md:inline-flex mr-6"></ViewMode>

              <!-- Page size -->
              <PageSize
                v-model:size="productSearchParams.itemsPerPage"
                class="hidden md:flex"
                @update:size="loadProducts"
              ></PageSize>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, unref, watchEffect, Ref } from "vue";
import { onClickOutside, useBreakpoints, breakpointsTailwind, useUrlSearchParams } from "@vueuse/core";
import {
  Breadcrumbs,
  FiltersBlock,
  Pagination,
  PageSize,
  ProductCardGrid,
  ProductCardList,
  ProductSkeletonGrid,
  ProductSkeletonList,
  ViewMode,
  useProducts,
  CategoryTree,
  ProductsSearchParams,
  useCategories,
  IBreadcrumbsItem,
} from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { useRoute } from "vue-router";
import _ from "lodash";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const route = useRoute();
const params = useUrlSearchParams("history");

const { products, total, loading, fetchProducts, pages } = useProducts();
const { categoryTree, loadCategoriesTree } = useCategories();
const category: Ref<CategoryTree | undefined> = ref(undefined);

const sortOptions = [
  { id: "priority-descending;name-ascending", name: "Featured" },
  { id: "name-ascending", name: "Alphabetically, A-Z" },
  { id: "name-descending", name: "Alphabetically, Z-A" },
  { id: "price-ascending", name: "Price, low to high" },
  { id: "price-descending", name: "Price, high to low" },
  { id: "createddate-descending", name: "Date, new to old" },
  { id: "createddate-ascending", name: "Date, old to new" },
];
const sort = ref(sortOptions.find((item) => item.id === params.sort) || sortOptions[0]);

watch(sort, async () => {
  productSearchParams.sort = sort.value.id;
  await loadProducts();
});

const productSearchParams = reactive<ProductsSearchParams>({
  itemsPerPage: +(params.size ?? 16),
  page: +(params.page ?? 1),
  term: "",
  sort: `${sort.value.id}`,
});

watch(
  () => route.params.categoryKey,
  async (categoryKeyParam) => {
    const categoryKey = categoryKeyParam as string;
    getCurrentCategory(categoryKey);
    productSearchParams.page = 1;
    await loadProducts();
  }
);

watch(
  () => category.value,
  () => BuildBreadcrumbs()
);

onMounted(async () => {
  // TODO: use active category key instead of id
  await loadCategoriesTree("");
  const categoryKey = route.params.categoryKey as string;
  getCurrentCategory(categoryKey);
  await loadProducts();
});

const loadProducts = async () => {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });

  productSearchParams.categoryId = category.value?.id;
  await fetchProducts(productSearchParams);
};

function getCurrentCategory(categoryKey: string) {
  const catTree = unref(categoryTree);
  const cat = searchCategory(catTree, categoryKey);
  category.value = cat;
}

function searchCategory(categoryTree: CategoryTree, categoryKey: string): CategoryTree | undefined {
  let category = _.find(categoryTree.items, (x) => x.seoKeyword === categoryKey);

  if (!category && categoryTree.items) {
    for (let cat of categoryTree.items) {
      category = searchCategory(cat, categoryKey);

      if (category) {
        return category;
      }
    }
  }

  return category;
}

const mobileFiltersVisible = ref(false);
const mobileFiltersSidebar = ref(null);

onClickOutside(mobileFiltersSidebar, () => {
  mobileFiltersVisible.value = false;
});

function BuildBreadcrumbs() {
  if (category.value) {
    breadcrumbsItems.value = [
      { url: "/", title: "Home" },
      { url: category.value.seoKeyword ?? "", title: category.value.label ?? "" },
    ];
  }
}

const breadcrumbsItems: Ref<IBreadcrumbsItem[]> = ref([{ url: "/", title: "Home" }]);

const viewMode = ref(`${params.viewMode || "grid"}`);
const keyword = ref("");

// Handle URL change on navigation update
watchEffect(() => {
  params.viewMode = viewMode.value;
  params.size = `${productSearchParams.itemsPerPage}` || "16";
  params.page = `${productSearchParams.page}` || "1";
  if (productSearchParams.sort) {
    params.sort = `${productSearchParams.sort}`;
  }
});

const onSearchStart = async () => {
  if (keyword.value !== productSearchParams.term) {
    productSearchParams.term = unref(keyword.value);
    await loadProducts();
  }
};

// Handle window resise to fix parameters on mobile view
watch(isMobile, async () => {
  if (isMobile.value) {
    viewMode.value = "grid";
    if (productSearchParams.itemsPerPage !== 8) {
      productSearchParams.itemsPerPage = 8;
      await loadProducts();
    }
  } else {
    if (productSearchParams.itemsPerPage === 8) {
      productSearchParams.itemsPerPage = 16;
      await loadProducts();
    }
  }
});
</script>

<style scoped></style>
