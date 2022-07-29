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
            :available-in="availableInMobile || []"
            :loading="loading || facetsLoading"
            @search="
              onSearchStart($event);
              hideMobileSidebar();
            "
            @change="onMobileFilterChanged($event)"
            @openBranches="onOpenBranchesDialog"
          />

          <div class="sticky h-24 z-100 bottom-0 mt-4 -mx-5 px-5 py-5 shadow-t-md bg-white">
            <div class="flex space-x-4">
              <VcButton
                class="flex-1 uppercase"
                size="lg"
                is-outline
                :is-disabled="!isExistSelectedFacets && !isExistSelectedMobileFacets"
                @click="
                  resetFacetFilters();
                  hideMobileSidebar();
                "
              >
                {{ $t("common.buttons.reset") }}
              </VcButton>

              <VcButton
                class="flex-1 uppercase"
                size="lg"
                :is-disabled="!isMobileFilterDirty"
                @click="
                  onFilterChanged(mobileFilters);
                  hideMobileSidebar();
                "
              >
                {{ $t("common.buttons.apply") }}
              </VcButton>
            </div>
          </div>
        </VcPopupSidebar>

        <!-- Sidebar -->
        <div v-else class="flex flex-col gap-4 lg:gap-5 lg:w-1/4 xl:w-1/5 flex-shrink-0">
          <CategorySelector :selected-category="selectedCategory" :loading="loading"></CategorySelector>

          <ProductsFiltersSidebar
            :keyword="keywordQueryParam"
            :filters="{ facets, inStock: savedInStock }"
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
              <VcButton class="px-4 font-extrabold" size="md" @click="showMobileSidebar">
                <i class="fas fa-filter mr-1"></i> {{ $t("pages.catalog.filters_button") }}
              </VcButton>
            </div>

            <!-- View options -->
            <ViewMode v-model:mode="savedViewMode" class="hidden md:inline-flex mr-auto" />

            <div v-if="!isMobileSidebar" class="relative ml-6 ml-auto cursor-pointer" @click="onOpenBranchesDialog">
              <VcCheckbox :model-value="!!savedBranches.length" :disabled="loading">
                <div
                  v-html="$t('pages.catalog.branch_availability_filter_card.available_in', { n: savedBranches.length })"
                ></div>
              </VcCheckbox>
              <div class="absolute inset-0"></div>
            </div>

            <!-- Sorting -->
            <div class="flex items-center flex-grow ml-6 md:flex-grow-0 z-10">
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
          <div v-if="isExistSelectedFacets" class="flex flex-wrap gap-x-3 gap-y-2 pb-6">
            <VcChip
              class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
              size="sm"
              is-outline
              clickable
              closable
              @click="resetFacetFilters"
              @close="resetFacetFilters"
            >
              {{ $t("pages.catalog.reset_filters_button") }}
            </VcChip>

            <template v-for="facet in facets">
              <template v-for="filterItem in facet.values">
                <VcChip
                  v-if="filterItem.selected"
                  :key="facet.paramName + filterItem.value"
                  class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
                  size="sm"
                  closable
                  @close="
                    removeFacetFilterItem({
                      paramName: facet.paramName,
                      value: filterItem.value,
                    })
                  "
                >
                  {{ filterItem.label }}
                </VcChip>
              </template>
            </template>
          </div>

          <!-- Products -->
          <template v-if="products.length || loading">
            <DisplayProducts
              :loading="loading"
              :view-mode="isMobile ? 'grid' : savedViewMode"
              :items-per-page="itemsPerPage"
              :products="products"
              :class="
                savedViewMode === 'list' && !isMobile
                  ? 'space-y-5'
                  : 'grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 xl:gap-x-6 xl:gap-y-8'
              "
            >
              <template #cart-handler="{ item }">
                <VcButton
                  v-if="item.hasVariations"
                  :to="productsRoutes[item.id]"
                  :class="{ 'w-full': savedViewMode === 'list' }"
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
              isExistSelectedFacets || savedInStock || keywordQueryParam
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
                @click="resetFacetFiltersWithKeyword"
                v-if="isExistSelectedFacets || keywordQueryParam"
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
  onBeforeUnmount,
  onMounted,
  ref,
  shallowReactive,
  shallowRef,
  triggerRef,
  watch,
  WatchStopHandle,
} from "vue";
import {
  breakpointsTailwind,
  computedEager,
  eagerComputed,
  useBreakpoints,
  useLocalStorage,
  watchDebounced,
  whenever,
} from "@vueuse/core";
import {
  Breadcrumbs,
  CategorySelector,
  DisplayProducts,
  getFilterExpressionForInStock,
  getFilterExpressionFromFacets,
  getFilterExpressionForAvailableIn,
  IBreadcrumbsItem,
  ProductsFacet,
  ProductsFacetValue,
  ProductsFilters,
  ProductsFiltersSidebar,
  ProductsSearchParams,
  useCategories,
  useProducts,
  useProductsRoutes,
  ViewMode,
} from "@/shared/catalog";
import { BranchesDialog, FFC_LOCAL_STORAGE_NAME, FFC_TEMP_LOCAL_STORAGE_NAME } from "@/shared/fulfillmentCenters";
import { AddToCart } from "@/shared/cart";
import { useElementVisibility, usePageHead, useRouteQueryParam } from "@/core/composables";
import { DEFAULT_PAGE_SIZE, PRODUCT_SORTING_LIST } from "@/core/constants";
import QueryParamName from "@/core/query-param-name.enum";
import { useI18n } from "vue-i18n";
import _ from "lodash";
import { usePopup } from "@/shared/popup";

const FILTERS_RESET_TIMEOUT_IN_MS = 500;
const watchStopHandles: WatchStopHandle[] = [];

const props = defineProps({
  categoryId: {
    type: String,
    default: "",
  },
});

const { openPopup } = usePopup();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { t } = useI18n();
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
  facets,
} = useProducts({
  withFacets: true,
});

usePageHead({
  title: computed(() => selectedCategory.value?.seoInfo?.pageTitle || selectedCategory.value?.label),
  meta: {
    keywords: computed(() => selectedCategory.value?.seoInfo?.metaKeywords),
    description: computed(() => selectedCategory.value?.seoInfo?.metaDescription),
  },
});

const productsRoutes = useProductsRoutes(products);
const savedViewMode = useLocalStorage<"grid" | "list">("viewMode", "grid");
const savedInStock = useLocalStorage<boolean>("viewInStockProducts", true);
const savedBranches = useLocalStorage<string[]>(FFC_LOCAL_STORAGE_NAME, []);
const availableInMobile = useLocalStorage<string[]>(FFC_TEMP_LOCAL_STORAGE_NAME, []);

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
});

const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
  defaultValue: "",
});

const facetsQueryParam = useRouteQueryParam<string>(QueryParamName.Facets, {
  defaultValue: "",
});

const isMobile = breakpoints.smaller("md");
const isMobileSidebar = breakpoints.smaller("lg");

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor, { direction: "top" });

const page = ref(1);
const itemsPerPage = ref(DEFAULT_PAGE_SIZE);
const mobileSidebarVisible = ref(false);
const mobileFilters = shallowReactive<ProductsFilters>({
  facets: [],
  inStock: savedInStock.value,
});
const showBranchesPopup = ref(false);

// region Computed properties

const isVisibleStickyMobileHeader = computed<boolean>(
  () => !stickyMobileHeaderAnchorIsVisible.value && isMobileSidebar.value
);

const searchParams = computedEager<ProductsSearchParams>(() => ({
  categoryId: props.categoryId,
  itemsPerPage: itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: keywordQueryParam.value,
  filter: [
    facetsQueryParam.value,
    getFilterExpressionForInStock(savedInStock),
    getFilterExpressionForAvailableIn(savedBranches),
  ]
    .filter(Boolean)
    .join(" "),
}));

const isExistSelectedFacets = eagerComputed<boolean>(() =>
  facets.value.some((facet) => facet.values.some((value) => value.selected))
);

const isExistSelectedMobileFacets = eagerComputed<boolean>(() =>
  mobileFilters.facets.some((facet) => facet.values.some((value) => value.selected))
);

const isMobileFilterDirty = eagerComputed<boolean>(
  () =>
    JSON.stringify(mobileFilters) !== JSON.stringify({ facets: facets.value, inStock: savedInStock.value }) ||
    JSON.stringify(savedBranches.value) !== JSON.stringify(availableInMobile.value)
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

// endregion Computed properties

// region Methods

function showMobileSidebar() {
  mobileFilters.facets = _.cloneDeep(facets.value);
  mobileFilters.inStock = savedInStock.value;
  mobileSidebarVisible.value = true;
}

function hideMobileSidebar() {
  availableInMobile.value = savedBranches.value;
  mobileSidebarVisible.value = false;
}

function onSearchStart(newKeyword: string) {
  const searchText = newKeyword;

  if (searchText !== keywordQueryParam.value && searchText.length <= 30) {
    keywordQueryParam.value = searchText;
  }
}

function onFilterChanged(newFilters: ProductsFilters) {
  facetsQueryParam.value = getFilterExpressionFromFacets(newFilters.facets);
  savedInStock.value = newFilters.inStock;
  savedBranches.value = availableInMobile.value;
}

async function onMobileFilterChanged(newFilters: ProductsFilters) {
  const searchParamsForFacets: ProductsSearchParams = {
    ...searchParams.value,
    filter: [
      getFilterExpressionFromFacets(newFilters.facets), //
      getFilterExpressionForInStock(newFilters.inStock),
      getFilterExpressionForAvailableIn(savedBranches),
    ]
      .filter(Boolean)
      .join(" "),
  };

  mobileFilters.facets = await getFacets(searchParamsForFacets);
  mobileFilters.inStock = newFilters.inStock;
}

function removeFacetFilterItem(payload: Pick<ProductsFacet, "paramName"> & Pick<ProductsFacetValue, "value">) {
  const facet = facets.value.find((item) => item.paramName === payload.paramName);
  const facetValue = facet?.values.find((item) => item.value === payload.value);

  if (facetValue) {
    facetValue.selected = false;
    facetsQueryParam.value = getFilterExpressionFromFacets(facets);

    // Instant update of the filter chips
    triggerRef(facets);
  }
}

function resetFacetFilters() {
  facetsQueryParam.value = "";

  // Instant update of the filter chips
  facets.value.forEach((filter) => filter.values.forEach((filterItem) => (filterItem.selected = false)));
  triggerRef(facets);
}

function resetFacetFiltersWithKeyword() {
  keywordQueryParam.value = "";
  // FIXME: `setTimeout` is a hack to apply the value of `useRouteQueryParam` in parallel
  setTimeout(resetFacetFilters, FILTERS_RESET_TIMEOUT_IN_MS);
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

function selectCategory(id?: string) {
  if (id) {
    selectCategoryByKey("id", id);
  } else {
    selectRoot();
  }
}

function onOpenBranchesDialog() {
  if (isMobileSidebar) {
    mobileSidebarVisible.value = false;
  }
  openPopup({
    component: BranchesDialog,
    props: {
      onClose() {
        showBranchesPopup.value = false;
        availableInMobile.value = JSON.parse(localStorage.getItem(FFC_TEMP_LOCAL_STORAGE_NAME));

        if (isMobileSidebar.value) {
          showMobileSidebar();
        } else {
          savedBranches.value = availableInMobile.value;
        }
      },
    },
  });
}

// endregion Methods

// region Lifecycle Hooks

onMounted(async () => {
  await loadCategoriesTree();
  selectCategory(props.categoryId);
  await loadProducts();
  availableInMobile.value = savedBranches.value;

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
    // TODO: (ST-2255) Use in place products loading instead of trigger by watching a computed property `searchParams`
    watchDebounced(
      computed(() => JSON.stringify(searchParams.value)),
      loadProducts,
      {
        flush: "post",
        debounce: 20,
      }
    ),
    watch(
      () => props.categoryId,
      (value) => selectCategory(value)
    )
  );
});

onBeforeUnmount(() => {
  watchStopHandles.forEach((watchStopHandle) => watchStopHandle());
});

// endregion Lifecycle Hooks

whenever(() => !isMobileSidebar.value, hideMobileSidebar);
</script>
