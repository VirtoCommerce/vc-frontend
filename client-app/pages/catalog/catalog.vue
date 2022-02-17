<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs class="mb-2 md:mb-8" :items="breadcrumbsItems"></Breadcrumbs>

      <div class="flex items-start lg:gap-6">
        <!-- Mobile sidebar back cover -->
        <div
          :class="{ hidden: !mobileSidebarVisible }"
          class="fixed z-40 inset-0 w-full h-screen lg:hidden bg-gray-800 opacity-95"
          @click="hideMobileSidebar"
        />

        <!-- Sidebar -->
        <div
          ref="sidebarElement"
          :class="[
            { hidden: !mobileSidebarVisible },
            isMobileSidebar
              ? 'fixed z-50 inset-0 w-72 h-screen overflow-y-auto px-5 py-12 bg-white'
              : 'lg:flex lg:w-1/4 xl:w-1/5 flex-shrink-0',
          ]"
        >
          <div class="flex flex-col gap-4 lg:gap-5 overflow-hidden">
            <!-- Search results -->
            <VcCard title="Filter results by">
              <p class="text-sm pb-2">Search within these results</p>
              <div class="flex gap-3">
                <input
                  v-model="keyword"
                  class="border rounded text-sm leading-8 flex-1 w-full border-gray-300 h-8 px-2 outline-none focus:border-gray-400"
                  type="text"
                  maxlength="30"
                  :disabled="loading"
                  @keypress.enter="onSearchStart"
                />

                <VcButton
                  :is-disabled="loading || isAppliedKeyword"
                  class="px-5 uppercase"
                  outline
                  size="sm"
                  @click="onSearchStart"
                >
                  Go
                </VcButton>
              </div>
            </VcCard>

            <!-- Previously purchased -->
            <VcCard title="Previously purchased">
              <VcCheckbox color="cyan-700">View previously purchased products</VcCheckbox>
            </VcCard>

            <!-- Branch availability -->
            <VcCard title="Branch availability">
              <p class="text-sm font-medium">
                <span class="text-cyan-700 font-semibold cursor-pointer hover:text-cyan-900">
                  Select a pickup branch
                </span>
                to see products in stock now.
              </p>
            </VcCard>

            <!-- Facet Filters Skeletons -->
            <template v-if="loading && !filters.length">
              <VcCardSkeleton is-collapsible v-for="i in 6" :key="i">
                <!-- TODO: add checkbox skeleton -->
                <div class="flex items-center mt-3 first:mt-0" v-for="i in 5" :key="i">
                  <div class="w-5 h-5 bg-gray-100 inline-block"></div>
                  <div class="ml-2 text-sm bg-gray-100 w-11/12">&nbsp;</div>
                </div>
              </VcCardSkeleton>
            </template>

            <!-- Facet Filters -->
            <template v-else>
              <VcCard
                v-for="(filter, index) in filters"
                :key="`${filter.paramName}_${index}`"
                :title="filter.label"
                is-collapsible
              >
                <VcCheckbox
                  v-for="(item, itemIndex) in filter.values"
                  :key="`${item.value}_${index}_${itemIndex}`"
                  v-model="item.selected"
                  :value="item.value"
                  :disabled="loading"
                  class="mt-3 first:mt-0"
                  color="cyan-700"
                  @change="applyFilters"
                >
                  <div class="flex">
                    <span class="truncate">{{ item.label }}</span>
                    <span class="ml-1">({{ item.count }})</span>
                  </div>
                </VcCheckbox>
              </VcCard>
            </template>
          </div>
        </div>

        <div class="lg:w-3/4 xl:w-4/5 flex-grow">
          <div class="flex flex-col">
            <h2 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">{{ selectedCategory?.label }}</h2>
            <p class="py-3">
              <span class="font-extrabold">{{ total }} results found.</span>
              <span>&nbsp;</span>
              <span class="font-normal">
                {{ products.length }} displayed that include {{ products.length }} products.
              </span>
            </p>
            <div class="flex justify-start mb-6 mt-4">
              <!-- Mobile filters toggler -->
              <div class="lg:hidden mr-3">
                <VcButton class="px-4 font-extrabold" size="md" @click="mobileSidebarVisible = true">
                  <i class="fas fa-filter mr-1"></i> Filters
                </VcButton>
              </div>

              <!-- View options -->
              <ViewMode v-model:mode="viewMode" class="hidden md:inline-flex mr-6"></ViewMode>

              <!-- Page size -->
              <PageSize v-model:size="itemsPerPage" class="hidden md:flex" />

              <!-- Sorting -->
              <div class="relative ml-auto flex-grow md:flex-grow-0">
                <span class="hidden lg:inline mr-2">Sort by:</span>
                <Listbox v-model="sort">
                  <ListboxButton
                    class="w-full md:w-52 lg:w-64 h-9 pl-3 pr-16 text-base bg-white border rounded appearance-none outline-none border-gray-300"
                  >
                    <span class="block truncate text-left">{{ sort?.name }}</span>
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
                      <ListboxOption v-for="item in sortList" :key="item.id" v-slot="{ selected }" :value="item">
                        <li class="cursor-pointer select-none relative py-1 px-3">
                          <span :class="[selected ? 'text-yellow-500' : 'text-black', 'block truncate']">
                            {{ item.name }}
                          </span>
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
                <ProductSkeletonGrid v-for="i in searchParams.itemsPerPage" :key="i" />
              </template>
              <template v-else>
                <ProductCardGrid v-for="item in products" :key="item.id" :product="item">
                  <template #cart-handler>
                    <VcButton v-if="item.hasVariations" :to="`/${SeoUrl.Product}/${item.id}`" class="uppercase mb-4">
                      Choose
                    </VcButton>
                    <AddToCart v-else :product="item"></AddToCart>
                  </template>
                </ProductCardGrid>
              </template>
            </div>
          </template>

          <template v-else>
            <div class="space-y-5">
              <template v-if="loading">
                <ProductSkeletonList v-for="i in searchParams.itemsPerPage" :key="i" />
              </template>
              <template v-else>
                <ProductCardList v-for="item in products" :key="item.id" :product="item">
                  <template #cart-handler>
                    <VcButton
                      v-if="item.hasVariations"
                      :to="`/${SeoUrl.Product}/${item.id}`"
                      class="uppercase mb-4 w-full"
                    >
                      Choose
                    </VcButton>
                    <AddToCart v-else :product="item"></AddToCart>
                  </template>
                </ProductCardList>
              </template>
            </div>
          </template>

          <!-- VcPagination and options bottom block -->
          <div class="flex justify-center md:justify-between pt-11">
            <div>
              <VcPagination v-model:page="page" :pages="pages" />
            </div>

            <div class="flex">
              <!-- View options -->
              <ViewMode v-model:mode="viewMode" class="hidden md:inline-flex mr-6"></ViewMode>

              <!-- Page size -->
              <PageSize v-model:size="itemsPerPage" class="hidden md:flex" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch, onMounted, watchEffect, PropType } from "vue";
import { breakpointsTailwind, debouncedWatch, useBreakpoints, whenever } from "@vueuse/core";
import {
  Breadcrumbs,
  IBreadcrumbsItem,
  PageSize,
  ProductCardGrid,
  ProductCardList,
  ProductSkeletonGrid,
  ProductSkeletonList,
  toFilterExpression,
  useCategories,
  useProducts,
  useProductsSearchParams,
  ViewMode,
} from "@/shared/catalog";
import { VcButton, VcCard, VcCardSkeleton, VcCheckbox, VcPagination } from "@/components";
import { AddToCart } from "@/shared/cart";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/vue";
import { useRouteQueryParam } from "@core/composables";
import { defaultPageSize, pageSizes } from "@core/constants";
import SeoUrl from "@core/seo-routes.enum";

const props = defineProps({ categorySeoUrls: [String, Array] as PropType<string | string[]> });

const sortList = [
  { id: "priority-descending;name-ascending", name: "Featured" },
  { id: "name-ascending", name: "Alphabetically, A-Z" },
  { id: "name-descending", name: "Alphabetically, Z-A" },
  { id: "price-ascending", name: "Price, low to high" },
  { id: "price-descending", name: "Price, high to low" },
  { id: "createddate-descending", name: "Date, new to old" },
  { id: "createddate-ascending", name: "Date, old to new" },
];

const breakpoints = useBreakpoints(breakpointsTailwind);
const { selectedCategory, selectCategoryBySeoUrl, loadCategoriesTree } = useCategories();
const { fetchProducts, loading, products, total, pages, filters } = useProducts({ withFilters: true });
const { searchParams, updateSearchParams } = useProductsSearchParams({
  defaultSortBy: sortList[0].id,
  sortList: sortList.map((item) => item.id),
  defaultItemsPerPage: defaultPageSize,
  itemsPerPageList: [...pageSizes, /* for mobile */ 8],
});

const isMobile = breakpoints.smaller("md");
const isMobileSidebar = breakpoints.smaller("lg");
const mobileSidebarVisible = ref(false);
const sidebarElement = shallowRef<HTMLElement | null>(null);
const keyword = ref("");

const viewMode = useRouteQueryParam<"grid" | "list">("viewMode", {
  defaultValue: "grid",
  validator: (value) => (isMobile.value ? false : ["grid", "list"].includes(value)),
});

const categorySeoUrl = computed<string>(() => props.categorySeoUrls?.[props.categorySeoUrls?.length - 1] ?? "");

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

const sort = computed<typeof sortList[0]>({
  get: () => sortList.find((item) => item.id === searchParams.value.sort)!,
  set(value) {
    updateSearchParams({
      sort: value.id,
      page: 1,
    });
  },
});

const isAppliedKeyword = computed<boolean>(() => keyword.value === searchParams.value.keyword);

const breadcrumbsItems = computed<IBreadcrumbsItem[]>(() => {
  const items: IBreadcrumbsItem[] = [{ url: "/", title: "Home" }];

  if (selectedCategory.value) {
    items.push({
      title: selectedCategory.value.label!,
    });
  }

  return items;
});

function hideMobileSidebar() {
  mobileSidebarVisible.value = false;

  if (sidebarElement.value) {
    sidebarElement.value.scrollTop = 0;
  }
}

function onSearchStart() {
  const searchText = keyword.value;

  if (searchText !== searchParams.value.keyword && searchText.length <= 30) {
    hideMobileSidebar();
    updateSearchParams({
      keyword: searchText,
      page: 1,
    });
  }
}

function applyFilters() {
  hideMobileSidebar();
  updateSearchParams({
    filter: toFilterExpression(filters),
    page: 1,
  });
}

async function loadProducts() {
  await fetchProducts({
    ...searchParams.value,
    categoryId: selectedCategory.value?.id,
  });
}

onMounted(async () => {
  await loadCategoriesTree(""); // TODO: use active category key instead of id
  selectCategoryBySeoUrl(categorySeoUrl.value);

  if (!isMobile.value && searchParams.value.itemsPerPage < defaultPageSize) {
    await updateSearchParams({
      itemsPerPage: defaultPageSize,
      page: 1,
    });
  } else {
    await loadProducts();
  }
});

watchEffect(() => (keyword.value = searchParams.value.keyword ?? ""));
whenever(() => !isMobileSidebar.value, hideMobileSidebar);
watch(categorySeoUrl, selectCategoryBySeoUrl);

debouncedWatch(() => `${categorySeoUrl.value} ${JSON.stringify(searchParams.value)}`, loadProducts, {
  flush: "post",
  debounce: 200,
});

// Handle window resize to fix parameters on mobile view
watch(isMobile, (mobileView) => {
  updateSearchParams({
    itemsPerPage: mobileView ? 8 : defaultPageSize,
    page: 1,
  });
});
</script>
