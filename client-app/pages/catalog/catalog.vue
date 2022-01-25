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
          <div class="flex flex-col gap-4 lg:gap-5">
            <!-- Search results -->
            <Card title="Filter results by">
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
              <VcButton class="px-5 uppercase" size="sm" outline :disabled="loading" @click="onSearchStart"
                >Go</VcButton
              >
              </div>
            </Card>

            <!-- Previously purchased -->
            <Card title="Previously purchased">
              <Checkbox color="cyan-700">View previously purchased products</Checkbox>
            </Card>

            <!-- Branch availability -->
            <Card title="Branch availability">
              <p class="text-sm font-medium">
                <span class="text-cyan-700 font-semibold cursor-pointer hover:text-cyan-900">
                  Select a pickup branch
                </span>
                to see products in stock now.
              </p>
            </Card>

            <!-- Term Facets Filters -->
            <Card v-for="(termFacet, index) in termFacets" :key="index" :title="termFacet.label" is-collapsible>
              <Checkbox
                v-for="(facetTerm, itemIndex) in termFacet.terms"
                :key="itemIndex"
                v-model="selectedFacets[termFacet.name]"
                :value="facetTerm.term"
                :disabled="loading"
                class="mt-3 first:mt-0"
                color="cyan-700"
              >
                {{ facetTerm.label }} ({{ facetTerm.count }})
              </Checkbox>
            </Card>

            <!-- Range Facets Filters -->
            <Card v-for="(rangeFacet, index) in rangeFacets" :key="index" :title="rangeFacet.label" is-collapsible>
              <Checkbox
                v-for="(rangeObject, rangeIndex) in rangeFacet.ranges"
                :key="rangeIndex"
                v-model="selectedFacets[rangeFacet.name]"
                :value="getFilterValueFromRangeFacet(rangeObject)"
                :disabled="loading"
                color="cyan-700"
                class="mt-3 first:mt-0"
              >
                {{ rangeObject.label }} ({{ rangeObject.count }})
              </Checkbox>
            </Card>
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
            <div class="flex justify-start mb-6 mt-4">
              <!-- Mobile filters toggler -->
              <div class="lg:hidden mr-3">
                <VcButton class="px-4 font-extrabold" size="sm" @click="mobileSidebarVisible = true">
                  <i class="fas fa-filter mr-1"></i> Filters
                </VcButton>
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
                <span class="hidden lg:inline mr-2">Sort by:</span>
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
                    <VcButton v-if="item.variations?.length" :to="`/product/${item.id}`" class="uppercase mb-4">
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
                <ProductSkeletonList v-for="i in productSearchParams.itemsPerPage" :key="i"></ProductSkeletonList>
              </template>
              <template v-else>
                <ProductCardList v-for="item in products" :key="item.id" :product="item">
                  <template #cart-handler>
                    <VcButton v-if="item.variations?.length" :to="`/product/${item.id}`" class="uppercase mb-4 w-full">
                      Choose
                    </VcButton>
                    <AddToCart v-else :product="item"></AddToCart>
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
import { ref, reactive, onMounted, watch, unref, watchEffect, Ref, shallowRef } from "vue";
import { useBreakpoints, breakpointsTailwind, useUrlSearchParams, whenever } from "@vueuse/core";
import {
  Breadcrumbs,
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
import { Card, Checkbox, Button as VcButton } from "@/components";
import { AddToCart } from "@/shared/cart";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { useRoute } from "vue-router";
import _ from "lodash";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");
const isMobileSidebar = breakpoints.smaller("lg");
const mobileSidebarVisible = ref(false);
const sidebarElement = shallowRef<HTMLElement | null>(null);

const route = useRoute();
const params = useUrlSearchParams("history", { removeFalsyValues: true });
const {
  products,
  total,
  loading,
  pages,
  termFacets,
  rangeFacets,
  selectedFacets,
  filterStringFromSelectedFacets,
  getFilterValueFromRangeFacet,
  fetchProducts,
} = useProducts();
const { categoryTree, loadCategoriesTree } = useCategories();

const category: Ref<CategoryTree | undefined> = ref(undefined);
const keyword: Ref<string> = ref(`${params.keyword || ""}`);

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
  query: keyword.value,
  sort: `${sort.value.id}`,
});

watch(
  () => route.params.categoryKey,
  async (categoryKeyParam) => {
    const categoryKey = categoryKeyParam as string;
    getCurrentCategory(categoryKey);

    productSearchParams.page = 1;
    productSearchParams.query = "";
    keyword.value = "";

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

const getCurrentCategory = (categoryKey: string) => {
  const catTree = unref(categoryTree);
  const cat = searchCategory(catTree, categoryKey);
  category.value = cat;
};

const searchCategory = (categoryTree: CategoryTree, categoryKey: string): CategoryTree | undefined => {
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
};

function hideMobileSidebar() {
  if (!mobileSidebarVisible.value) return;

  mobileSidebarVisible.value = false;

  if (sidebarElement.value) {
    sidebarElement.value.scrollTop = 0;
  }
}

whenever(
  () => !isMobileSidebar.value,
  () => hideMobileSidebar()
);

watch(filterStringFromSelectedFacets, async (value: string) => {
  productSearchParams.filter = value;
  productSearchParams.page = 1;
  hideMobileSidebar();
  await loadProducts();
});

const BuildBreadcrumbs = () => {
  if (category.value) {
    breadcrumbsItems.value = [
      { url: "/", title: "Home" },
      { url: category.value.seoKeyword ?? "", title: category.value.label ?? "" },
    ];
  }
};

const breadcrumbsItems: Ref<IBreadcrumbsItem[]> = ref([{ url: "/", title: "Home" }]);

const viewMode = ref(`${params.viewMode || "grid"}`);

// Handle URL change on navigation update
watchEffect(() => {
  params.viewMode = viewMode.value;
  params.size = `${productSearchParams.itemsPerPage}` || "16";
  params.page = `${productSearchParams.page}` || "1";
  params.keyword = productSearchParams.query || "";

  if (productSearchParams.sort) {
    params.sort = `${productSearchParams.sort}`;
  }
});

const onSearchStart = async () => {
  if (keyword.value !== productSearchParams.query && keyword.value.length <= 30) {
    productSearchParams.query = keyword.value;
    productSearchParams.page = 1;
    hideMobileSidebar();
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
