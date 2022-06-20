<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner grow" :class="{ 'polygon-gray-bg': !products.length && !loading }">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs class="mb-2 md:mb-8" :items="breadcrumbs" />

      <div class="flex items-start lg:gap-6">
        <!-- Mobile sidebar back cover -->
        <VcPopupSidebar
          v-if="isMobileSidebar"
          :is-visible="mobileSidebarVisible"
          class="w-72 px-5 pt-12"
          @hide="hideMobileSidebar()"
        >
          <div class="relative">
            <button class="absolute -right-3 appearance-none px-3 py-1" @click="hideMobileSidebar()">
              <span class="text-2xl fa fa-times text-[color:var(--color-primary)]"></span>
            </button>
          </div>

          <div class="font-semibold text-2xl pt-1 mb-6">
            {{ $t("common.buttons.filters") }}
          </div>
          <ProductsFiltersSidebar
            :keyword="keywordQueryParam"
            :filters="mobileFilters"
            :loading="loading || facetsLoading"
            @search="
              onSearchStart($event);
              hideMobileSidebar();
            "
            @change="onMobileFilterChanged($event)"
          />
          <div class="sticky h-24 z-100 bottom-0 mt-4 -mx-5 px-5 py-5 shadow-t-md bg-white">
            <div class="flex space-x-4">
              <VcButton
                class="flex-1 uppercase"
                size="lg"
                is-outline
                :is-disabled="
                  !(isExistSelectedFacets || filters.inStock || isExistSelectedMobileFacets || mobileFilters.inStock)
                "
                @click="
                  resetFilters();
                  hideMobileSidebar();
                "
              >
                {{ $t("common.buttons.reset") }}
              </VcButton>
              <VcButton
                class="flex-1 uppercase"
                size="lg"
                :is-disabled="!isMobileFilterDirty"
                @click="applyMobileFiltersAndHideSidebar"
              >
                {{ $t("common.buttons.apply") }}
              </VcButton>
            </div>
          </div>
        </VcPopupSidebar>

        <!-- Sidebar -->
        <div v-else ref="sidebarElement" class="flex flex-col gap-4 lg:gap-5 lg:w-1/4 xl:w-1/5 flex-shrink-0">
          <CategorySelector :selected-category="selectedCategory" :loading="loading"></CategorySelector>

          <ProductsFiltersSidebar
            :keyword="keywordQueryParam"
            :filters="filters"
            :loading="loading"
            @search="onSearchStart($event)"
            @change="onFilterChanged($event)"
          />
        </div>

        <!-- Content -->
        <div class="lg:w-3/4 xl:w-4/5 flex-grow">
          <h2 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">{{ selectedCategory?.label }}</h2>

          <p class="py-3">
            <span class="font-extrabold">{{ $t("pages.catalog.products_found_message", [total]) }}</span>
          </p>

          <div ref="stickyMobileHeaderAnchor" class="-mb-2"></div>

          <div
            class="sticky lg:relative top-0 z-10 flex items-center h-14 mt-2 mb-3"
            :class="{
              'z-40 px-5 md:px-12 -mx-5 md:-mx-12 bg-[color:var(--color-header-bottom-bg)]':
                isVisibleStickyMobileHeader,
            }"
          >
            <!-- Mobile filters toggler -->
            <div class="lg:hidden mr-3">
              <VcButton
                class="px-4 font-extrabold"
                size="md"
                @click="showMobileSidebar"
                :is-disabled="loading || loadingMore"
              >
                <i class="fas fa-filter mr-1"></i> {{ $t("pages.catalog.filters_button") }}
              </VcButton>
            </div>

            <!-- View options -->
            <ViewMode v-model:mode="viewMode" class="hidden md:inline-flex mr-6" />

            <!-- Sorting -->
            <div class="flex items-center flex-grow md:flex-grow-0 z-10 ml-auto">
              <span class="hidden lg:block shrink-0 mr-2" v-t="'pages.catalog.sort_by_label'"></span>

              <VcSelect
                v-model="sortQueryParam"
                text-field="name"
                value-field="id"
                :is-disabled="loading"
                :items="PRODUCT_SORTING_LIST"
                class="w-full md:w-52 lg:w-64"
              />
            </div>
          </div>

          <!-- Filters chips -->
          <div v-if="isExistSelectedFacets || filters.inStock" class="flex flex-wrap gap-x-3 gap-y-2 pb-6">
            <VcChip
              class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
              size="sm"
              is-outline
              clickable
              closable
              @click="resetFilters"
              @close="resetFilters"
            >
              {{ $t("pages.catalog.reset_filters_button") }}
            </VcChip>

            <template v-for="facet in filters.facets">
              <template v-for="filterItem in facet.values">
                <VcChip
                  v-if="filterItem.selected"
                  :key="facet.paramName + filterItem.value"
                  class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
                  size="sm"
                  closable
                  @close="
                    removeFilterItem({
                      paramName: facet.paramName,
                      value: filterItem.value,
                    })
                  "
                >
                  {{ filterItem.label }}
                </VcChip>
              </template>
            </template>

            <template v-if="filters.inStock">
              <VcChip
                class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
                size="sm"
                closable
                @close="
                  filters.inStock = false;
                  applyFilters();
                "
              >
                {{ $t("pages.catalog.instock_filter_card.title") }}
              </VcChip>
            </template>
          </div>

          <!-- Products -->
          <template v-if="products.length || loading">
            <DisplayProducts
              :loading="loading"
              :view-mode="isMobile ? 'grid' : viewMode"
              :items-per-page="itemsPerPage"
              :products="products"
              :class="
                viewMode === 'list' && !isMobile
                  ? 'space-y-5'
                  : 'grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 xl:gap-x-6 xl:gap-y-8'
              "
            >
              <template #cart-handler="{ item }">
                <VcButton
                  v-if="item.hasVariations"
                  :to="productsRoutes[item.id]"
                  :class="{ 'w-full': viewMode === 'list' }"
                  class="uppercase mb-4"
                >
                  {{ $t("pages.catalog.choose_button") }}
                </VcButton>

                <AddToCart v-else :product="item" />
              </template>
            </DisplayProducts>

            <VcInfinityScrollLoader
              v-if="!loading"
              :loading="loadingMore"
              distance="400"
              class="mt-9 -mb-6"
              @visible="loadMoreProducts"
            />

            <VcScrollTopButton />
          </template>

          <!-- Empty view -->
          <VcEmptyView
            :text="
              isExistSelectedFacets || filters.inStock || keywordQueryParam !== ''
                ? $t('pages.catalog.no_products_filtered_message')
                : $t('pages.catalog.no_products_message')
            "
            class="h-96"
            v-else
          >
            <template #icon>
              <VcImage src="/static/images/common/stock.svg" :alt="$t('pages.catalog.products_icon')" />
            </template>
            <template #button>
              <VcButton
                class="px-6 uppercase"
                size="lg"
                @click="resetFiltersWithKeyword"
                v-if="isExistSelectedFacets || filters.inStock || keywordQueryParam !== ''"
              >
                <i class="fas fa-undo text-inherit -ml-0.5 mr-2.5"></i>
                {{ $t("pages.catalog.no_products_button") }}
              </VcButton>
            </template>
          </VcEmptyView>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  shallowRef,
  watch,
  onMounted,
  PropType,
  onBeforeUnmount,
  WatchStopHandle,
  toRef,
  shallowReactive,
} from "vue";
import { breakpointsTailwind, eagerComputed, useBreakpoints, whenever, useLocalStorage } from "@vueuse/core";
import {
  Breadcrumbs,
  IBreadcrumbsItem,
  DisplayProducts,
  toFilterExpression,
  useCategories,
  useProducts,
  ViewMode,
  ProductsSearchParams,
  ProductsFilters,
  useProductsRoutes,
  ProductsFacet,
  ProductsFacetValue,
  ProductsFiltersSidebar,
  CategorySelector,
} from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";
import { useElementVisibility, useRouteQueryParam } from "@core/composables";
import { DEFAULT_PAGE_SIZE, PRODUCT_SORTING_LIST } from "@core/constants";
import QueryParamName from "@core/query-param-name.enum";
import { useI18n } from "vue-i18n";
import _ from "lodash";

const { t } = useI18n();

const watchStopHandles: WatchStopHandle[] = [];

const props = defineProps({
  categoryId: {
    type: String,
    default: "",
  },

  categorySeoUrls: {
    type: [String, Array] as PropType<string | string[]>,
    default: "",
  },
});

const categoryId = toRef(props, "categoryId");

const breakpoints = useBreakpoints(breakpointsTailwind);
const { selectedCategory, selectCategoryByKey, loadCategoriesTree, selectRoot } = useCategories();
const {
  fetchProducts,
  fetchMoreProducts,
  getFacets,
  loading,
  loadingMore,
  facetsLoading,
  products,
  total,
  pages,
  filters,
  clearFilters,
} = useProducts({
  withFacets: true,
});

const productsRoutes = useProductsRoutes(products);

const FILTERS_RESET_TIMEOUT_IN_MS = 500;

const isMobile = breakpoints.smaller("md");
const isMobileSidebar = breakpoints.smaller("lg");
const mobileSidebarVisible = ref(false);
const sidebarElement = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const page = ref(1);
const itemsPerPage = ref(DEFAULT_PAGE_SIZE);
const mobileFilters = shallowReactive<ProductsFilters>({ facets: [], inStock: false });

const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor, { direction: "top" });

const viewMode = useLocalStorage<"grid" | "list">("viewMode", "grid");

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
});

const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
  defaultValue: "",
});

const filterQueryParam = useRouteQueryParam<string>(QueryParamName.Filter, {
  defaultValue: "",
});

const isVisibleStickyMobileHeader = computed<boolean>(
  () => !stickyMobileHeaderAnchorIsVisible.value && isMobileSidebar.value
);

const categorySeoUrl = computed<string>(() =>
  typeof props.categorySeoUrls === "string"
    ? props.categorySeoUrls
    : props.categorySeoUrls?.[props.categorySeoUrls?.length - 1] ?? ""
);

const searchParams = computed<ProductsSearchParams>(() => ({
  categoryId: selectedCategory.value?.id,
  itemsPerPage: itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: keywordQueryParam.value,
  filter: filterQueryParam.value,
}));

const isExistSelectedFacets = eagerComputed<boolean>(() =>
  filters.facets.some((facet) => facet.values.some((value) => value.selected))
);

const breadcrumbs = computed<IBreadcrumbsItem[]>(() => {
  const items: IBreadcrumbsItem[] = [{ url: "/", title: t("common.links.home") }];

  if (!selectedCategory.value) {
    return items;
  }

  if (selectedCategory.value.breadcrumbs!.length) {
    selectedCategory.value.breadcrumbs!.forEach((breadcrumb) => {
      items.push({
        title: breadcrumb.title,
        url: `/${breadcrumb.seoPath}`,
      });
    });
  } else {
    items.push({ title: selectedCategory.value.label! });
  }

  return items;
});

function onSearchStart(newKeyword: string) {
  const searchText = newKeyword;

  if (searchText !== keywordQueryParam.value && searchText.length <= 30) {
    keywordQueryParam.value = searchText;
  }
}

function onFilterChanged(newFilters: ProductsFilters) {
  // checking for optimization
  if (newFilters.inStock != filters.inStock) {
    filters.inStock = newFilters.inStock;
  } else {
    filters.facets = _.cloneDeep(newFilters.facets);
  }

  if (!isMobileSidebar.value) {
    applyFilters();
  }
}

function applyFilters() {
  filterQueryParam.value = toFilterExpression(filters);
}

function removeFilterItem(payload: Pick<ProductsFacet, "paramName"> & Pick<ProductsFacetValue, "value">) {
  const filter = filters.facets.find((item) => item.paramName === payload.paramName);
  const filterItem = filter?.values.find((item) => item.value === payload.value);

  if (filterItem) {
    filterItem.selected = false;
    applyFilters();
  }
}

function resetFilters() {
  clearFilters();

  applyFilters();
}

function resetFiltersWithKeyword() {
  keywordQueryParam.value = "";
  setTimeout(() => {
    resetFilters();
  }, FILTERS_RESET_TIMEOUT_IN_MS);
}

async function loadProducts() {
  page.value = 1;
  await fetchProducts(searchParams.value);
}

async function loadMoreProducts() {
  if (page.value === pages.value) {
    return;
  }

  const nextPage = page.value + 1;

  page.value = nextPage;

  await fetchMoreProducts({
    ...searchParams.value,
    page: nextPage,
  });
}

function onChangeCurrentCategory(key: string, value: string) {
  clearFilters();
  selectCategoryByKey(key, value);
}

onMounted(async () => {
  await loadCategoriesTree();
  
  if (!categoryId.value && !categorySeoUrl.value) {
    selectRoot();
  } else if (categoryId.value) {
    selectCategoryByKey("id", categoryId.value);
    watch(categoryId, (value) => onChangeCurrentCategory("id", value));
  } else {
    selectCategoryByKey("seoUrl", categorySeoUrl.value);
    watch(categorySeoUrl, (value) => onChangeCurrentCategory("seoUrl", value));
  }

  await loadProducts();

  // Todo: Use in place products loading instead of trigger by watching a computed property searchParams https://virtocommerce.atlassian.net/browse/ST-2255
  // Start change tracking after initial data load
  watchStopHandles.push(
    /**
     * You must force the watch to stop before unmounting the component
     * because the computed value being watched includes the global reactive object.
     * In this case, it is the "current route" inside the "useRouteQueryParam" function.
     *
     * Related links:
     * https://github.com/vuejs/core/issues/2291
     */
    watch(
      computed(() => JSON.stringify(searchParams.value)),
      loadProducts,
      {
        flush: "post",
      }
    )
  );
});

onBeforeUnmount(() => {
  watchStopHandles.forEach((watchStopHandle) => watchStopHandle());
});

//#region Mobile filters logic

const isExistSelectedMobileFacets = eagerComputed<boolean>(() =>
  mobileFilters.facets.some((facet) => facet.values.some((value) => value.selected))
);

const isMobileFilterDirty = eagerComputed<boolean>(() => JSON.stringify(mobileFilters) !== JSON.stringify(filters));

async function onMobileFilterChanged(newFilters: ProductsFilters) {
  const searchParamsForFacets = _.cloneDeep(searchParams.value);
  searchParamsForFacets.filter = toFilterExpression(newFilters);
  const newFacets = await getFacets(searchParamsForFacets);
  mobileFilters.facets = newFacets;
  mobileFilters.inStock = newFilters.inStock;
}

function showMobileSidebar() {
  mobileFilters.facets = _.cloneDeep<ProductsFacet[]>(filters.facets);
  mobileFilters.inStock = filters.inStock;

  mobileSidebarVisible.value = true;
}

function applyMobileFiltersAndHideSidebar() {
  if (JSON.stringify(mobileFilters.facets) !== JSON.stringify(filters.facets)) {
    filters.facets = mobileFilters.facets;
  }

  if (mobileFilters.inStock !== filters.inStock) {
    filters.inStock = mobileFilters.inStock;
  }

  hideMobileSidebar();
  applyFilters();
}

function hideMobileSidebar() {
  mobileSidebarVisible.value = false;

  if (sidebarElement.value) {
    sidebarElement.value.scrollTop = 0;
  }
}

whenever(() => !isMobileSidebar.value, hideMobileSidebar);
//#endregion Mobile filters logic
</script>
