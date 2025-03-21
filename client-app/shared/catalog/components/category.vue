<template>
  <VcContainer
    ref="categoryComponentAnchor"
    :class="{
      'polygon-neutral-bg': !products.length && !fetchingProducts,
    }"
  >
    <!-- Breadcrumbs -->
    <VcBreadcrumbs v-if="!hideBreadcrumbs" class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <!-- Popup sidebar for mobile and horizontal desktop view -->
    <FiltersPopupSidebar
      v-if="!hideSidebar && (isMobile || isHorizontalFilters)"
      :is-exist-selected-facets="hasSelectedFacets"
      :is-popup-sidebar-filter-dirty="isFiltersDirty"
      :popup-sidebar-filters="productsFilters"
      :facets-loading="fetchingFacets"
      :is-mobile="isMobile"
      :is-visible="isFiltersSidebarVisible"
      :keyword-query-param="keywordQueryParam"
      :sort-query-param="sortQueryParam"
      :loading="fetchingProducts"
      :hide-controls="hideControls"
      @hide-popup-sidebar="hideFiltersSidebar"
      @reset-facet-filters="resetFacetFilters"
      @open-branches-modal="openBranchesModal"
      @update-popup-sidebar-filters="updateFiltersSidebar"
      @apply-filters="applyFilters"
    />

    <VcLayout sticky-sidebar>
      <template v-if="!hideSidebar && !isMobile && !isHorizontalFilters" #sidebar>
        <CategorySelector
          v-if="categoryId || isRoot"
          :category="currentCategory"
          :loading="!currentCategory && loadingCategory"
          class="mb-4 lg:mb-5"
        />

        <ProductsFilters
          :keyword="keywordQueryParam"
          :filters="productsFilters"
          :loading="fetchingProducts"
          @change="applyFilters($event)"
        />
      </template>

      <div class="flex">
        <VcTypography tag="h1">
          <i18n-t v-if="!categoryId && !isRoot" keypath="pages.search.header" tag="span">
            <template #keyword>
              <strong>{{ searchParams.keyword }}</strong>
            </template>
          </i18n-t>

          <!-- Skeleton -->
          <span v-else-if="!currentCategory && loadingCategory" class="inline-block w-48 bg-neutral-200 md:w-64">
            &nbsp;
          </span>

          <span v-else-if="title">
            {{ title }}
          </span>

          <span v-else>
            {{ currentCategory?.name }}
          </span>

          <sup
            v-if="!fetchingProducts && !hideTotal && !fixedProductsCount"
            class="-top-1 ml-2 whitespace-nowrap text-sm font-normal normal-case text-neutral lg:top-[-0.5em] lg:text-base"
          >
            <b class="font-black">{{ $n(totalProductsCount, "decimal") }}</b>
            {{ $t("pages.catalog.products_found_message", totalProductsCount) }}
          </sup>
        </VcTypography>

        <!-- View options - horizontal view -->
        <ViewMode
          v-if="!hideViewModeSelector && isHorizontalFilters"
          v-model:mode="savedViewMode"
          class="ml-auto flex"
        />
      </div>

      <div ref="stickyMobileHeaderAnchor" class="-mt-px"></div>

      <div
        class="sticky top-0 z-10 my-1.5 flex h-14 items-center empty:h-2 lg:relative lg:mb-3.5 lg:mt-3 lg:h-auto lg:flex-wrap lg:justify-end"
        :class="{
          'z-40 -mx-5 bg-additional-50 px-5 md:-mx-12 md:px-12': stickyMobileHeaderIsVisible,
        }"
      >
        <!-- Popup sidebar filters toggler -->
        <VcButton
          v-if="!hideSidebar"
          class="mr-2.5 flex-none md:!hidden"
          icon="filter"
          size="sm"
          @click="showFiltersSidebar"
        />

        <!-- View options -->
        <ViewMode
          v-if="!hideViewModeSelector && !isHorizontalFilters"
          v-model:mode="savedViewMode"
          class="ml-3 inline-flex max-lg:order-3 lg:ml-0 lg:mr-auto"
        />

        <!-- In stock and branches -->
        <CategoryControls
          v-if="!hideControls && !isMobile && !isHorizontalFilters"
          v-model="localStorageInStock"
          :loading="fetchingProducts"
          :saved-branches="localStorageBranches"
          class="max-lg:order-4"
          @open-branches-modal="openBranchesModal"
          @apply-in-stock="resetCurrentPage"
        />

        <!-- Sorting -->
        <div
          v-if="!hideSorting && !isHorizontalFilters"
          class="z-10 ml-auto flex grow items-center max-lg:order-2 lg:ml-4 lg:grow-0 xl:ml-8"
        >
          <span class="mr-2 hidden shrink-0 text-sm font-bold text-neutral-900 lg:block">
            {{ $t("pages.catalog.sort_by_label") }}
          </span>

          <VcSelect
            v-model="sortQueryParam"
            text-field="name"
            value-field="id"
            :disabled="fetchingProducts"
            :items="PRODUCT_SORTING_LIST"
            class="w-0 grow lg:w-48"
            size="sm"
            @change="resetCurrentPage"
          />
        </div>
      </div>

      <!-- Horizontal filters -->
      <CategoryHorizontalFilters
        v-if="isHorizontalFilters && !isMobile"
        :facets-loading="fetchingFacets"
        :keyword-query-param="keywordQueryParam"
        :sort-query-param="sortQueryParam"
        :loading="fetchingProducts || fetchingFacets"
        :filters="productsFilters"
        :hide-sorting="hideSorting"
        :hide-all-filters="hideSidebar"
        @reset-facet-filters="resetFacetFilters"
        @apply-filters="applyFilters"
        @show-popup-sidebar="showFiltersSidebar"
        @apply-sort="resetCurrentPage"
      />

      <!-- Filters chips -->
      <div v-if="hasSelectedFacets" class="flex flex-wrap gap-x-3 gap-y-2 pb-6">
        <template v-for="facet in productsFilters.facets">
          <template v-for="filterItem in facet.values">
            <VcChip
              v-if="filterItem.selected"
              :key="facet.paramName + filterItem.value"
              color="secondary"
              closable
              truncate
              @close="
                removeFacetFilter({
                  paramName: facet.paramName,
                  value: filterItem.value,
                })
              "
            >
              {{ filterItem.label }}
            </VcChip>
          </template>
        </template>

        <VcChip color="secondary" variant="outline" clickable @click="resetFacetFilters">
          <span>{{ $t("common.buttons.reset_filters") }}</span>

          <VcIcon name="reset" />
        </VcChip>
      </div>

      <div ref="categoryProductsAnchor"></div>
      <!-- Products -->
      <CategoryProducts
        :card-type="cardType"
        :columns-amount-desktop="columnsAmountDesktop"
        :columns-amount-tablet="columnsAmountTablet"
        :fetching-more-products="fetchingMoreProducts"
        :fetching-products="fetchingProducts"
        :fixed-products-count="fixedProductsCount"
        :has-active-filters="hasSelectedFacets || localStorageInStock || !!localStorageBranches.length"
        :has-selected-facets="hasSelectedFacets"
        :items-per-page="itemsPerPage"
        :pages-count="pagesCount"
        :page-number="currentPage"
        :products="products"
        :saved-view-mode="savedViewMode"
        :search-params="searchParams"
        @change-page="changeProductsPage"
        @reset-facet-filters="resetFacetFilters"
        @reset-filter-keyword="resetFilterKeyword"
        @select-product="selectProduct"
      />

      <div class="text-center">
        <VcButton v-if="showButtonToDefaultView" class="my-8" color="primary" :to="{ query: { view: 'default' } }">
          {{ $t("pages.catalog.show_all_results") }}
        </VcButton>
      </div>
    </VcLayout>
  </VcContainer>
</template>

<script setup lang="ts">
import {
  computedEager,
  useBreakpoints,
  useElementVisibility,
  useLocalStorage,
  watchDebounced,
  whenever,
} from "@vueuse/core";
import { computed, ref, shallowRef, toRef, toRefs, watch } from "vue";
import { useRoute } from "vue-router";
import { useBreadcrumbs, useAnalytics, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BREAKPOINTS, DEFAULT_PAGE_SIZE, PRODUCT_SORTING_LIST } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { globals } from "@/core/globals";
import {
  buildBreadcrumbs,
  getFilterExpression,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStock,
  getFilterExpressionForZeroPrice,
  getFilterExpressionFromFacets,
} from "@/core/utilities";
import { useCategorySeo } from "@/shared/catalog/composables/useCategorySeo";
import { useSlugInfo } from "@/shared/common";
import { useCategory, useProducts } from "../composables";
import CategorySelector from "./category-selector.vue";
import ProductsFilters from "./products-filters.vue";
import ViewMode from "./view-mode.vue";
import type { Product } from "@/core/api/graphql/types";
import type { FiltersDisplayOrderType, ProductsFiltersType, ProductsSearchParamsType } from "@/shared/catalog";
import CategoryControls from "@/shared/catalog/components/category/category-controls.vue";
import CategoryHorizontalFilters from "@/shared/catalog/components/category/category-horizontal-filters.vue";
import CategoryProducts from "@/shared/catalog/components/category/category-products.vue";
import FiltersPopupSidebar from "@/shared/catalog/components/category/filters-popup-sidebar.vue";

const props = defineProps<IProps>();

const viewModes = ["grid", "list"] as const;
type ViewModeType = (typeof viewModes)[number];

interface IProps {
  isRoot?: boolean;
  categoryId?: string;
  title?: string;
  hideTotal?: boolean;
  hideBreadcrumbs?: boolean;
  hideSidebar?: boolean;
  hideControls?: boolean;
  hideSorting?: boolean;
  viewMode?: ViewModeType;
  filtersOrientation?: "vertical" | "horizontal";
  cardType?: "full" | "short";
  columnsAmountDesktop?: string;
  columnsAmountTablet?: string;
  keyword?: string;
  filter?: string;
  fixedProductsCount?: number;
  allowSetMeta?: boolean;
  showButtonToDefaultView?: boolean;
  filtersDisplayOrder?: FiltersDisplayOrderType;
}

const { allowSetMeta } = toRefs(props);
const filtersDisplayOrder = toRef(props, "filtersDisplayOrder");

const { catalogId, currencyCode } = globals;

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("md");

const { themeContext } = useThemeContext();
const {
  getFacets,
  facetsQueryParam,
  fetchingMoreProducts,
  fetchingProducts,
  fetchingFacets,
  hasSelectedFacets,
  isFiltersDirty,
  isFiltersSidebarVisible,
  keywordQueryParam,
  localStorageBranches,
  localStorageInStock,
  pagesCount,
  products,
  productsFilters,
  searchQueryParam,
  sortQueryParam,
  totalProductsCount,

  applyFilters: _applyFilters,
  fetchProducts: _fetchProducts,
  fetchMoreProducts,
  hideFiltersSidebar,
  openBranchesModal,
  removeFacetFilter,
  resetFacetFilters,
  resetFilterKeyword,
  showFiltersSidebar,
  updateProductsFilters,

  currentPage,
  updateCurrentPage,
  resetCurrentPage,
} = useProducts({
  filtersDisplayOrder,
  useQueryParams: true,
  withFacets: true,
});
const { loading: loadingCategory, category: currentCategory, fetchCategory } = useCategory();
const { analytics } = useAnalytics();

const savedViewMode = useLocalStorage<ViewModeType>("viewMode", "grid");

const itemsPerPage = ref(DEFAULT_PAGE_SIZE);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

const isHorizontalFilters = computed(() => !isMobile.value && props.filtersOrientation === "horizontal");
const hideViewModeSelector = computed(() => {
  return props.viewMode && viewModes.includes(props.viewMode);
});

const categoryComponentAnchor = shallowRef<HTMLElement | null>(null);
const categoryComponentAnchorIsVisible = useElementVisibility(categoryComponentAnchor);

const route = useRoute();
const { objectType, slugInfo } = useSlugInfo(route.path.slice(1));

useCategorySeo({ category: currentCategory, allowSetMeta, categoryComponentAnchorIsVisible });

const breadcrumbs = useBreadcrumbs(() =>
  buildBreadcrumbs(
    objectType.value === "Catalog" && !!slugInfo.value?.entityInfo
      ? [
          {
            itemId: slugInfo.value.entityInfo.id,
            semanticUrl: slugInfo.value.entityInfo.semanticUrl,
            title: slugInfo.value.entityInfo.pageTitle ?? slugInfo.value.entityInfo.semanticUrl,
            typeName: objectType.value,
          },
        ]
      : currentCategory.value?.breadcrumbs,
  ),
);
const categoryProductsAnchor = shallowRef<HTMLElement | null>(null);

const searchParams = computedEager<ProductsSearchParamsType>(() => ({
  categoryId: props.categoryId,
  itemsPerPage: props.fixedProductsCount || itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: props.keyword || (!props.categoryId && !props.isRoot ? searchQueryParam.value : keywordQueryParam.value),
  filter: [
    props.filter,
    facetsQueryParam.value,
    getFilterExpressionForInStock(localStorageInStock.value),
    getFilterExpressionForAvailableIn(localStorageBranches.value),
  ]
    .filter(Boolean)
    .join(" "),
}));

const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

function applyFilters(newFilters: ProductsFiltersType): void {
  _applyFilters(newFilters);
}

async function updateFiltersSidebar(newFilters: ProductsFiltersType): Promise<void> {
  const searchParamsForFacets: ProductsSearchParamsType = {
    ...searchParams.value,
    filter: [
      props.filter,
      getFilterExpressionFromFacets(newFilters.facets),
      getFilterExpressionForInStock(newFilters.inStock),
      getFilterExpressionForAvailableIn(newFilters.branches),
    ]
      .filter(Boolean)
      .join(" "),
  };

  updateProductsFilters({
    branches: newFilters.branches,
    inStock: newFilters.inStock,
    facets: await getFacets(searchParamsForFacets),
  });
}

async function changeProductsPage(pageNumber: number): Promise<void> {
  if (pageNumber > pagesCount.value) {
    return;
  }

  updateCurrentPage(pageNumber);

  await fetchMoreProducts({
    ...searchParams.value,
    page: currentPage.value,
  });

  /**
   * Send Google Analytics event for products on next page.
   */
  analytics("viewItemList", products.value, {
    item_list_id: `${currentCategory.value?.slug}_page_${currentPage.value}`,
    item_list_name: `${currentCategory.value?.name} (page ${currentPage.value})`,
  });

  if (searchQueryParam.value) {
    trackViewSearchResults();
  }
}

async function fetchProducts(): Promise<void> {
  await _fetchProducts(searchParams.value);

  /**
   * Send Google Analytics event for products.
   */
  analytics("viewItemList", products.value, {
    item_list_id: currentCategory.value?.slug,
    item_list_name: currentCategory.value?.name,
  });

  if (searchQueryParam.value) {
    trackViewSearchResults();
  }
}

function trackViewSearchResults(): void {
  analytics("viewSearchResults", searchQueryParam.value, {
    visible_items: products.value.map((product) => ({ code: product.code })),
    results_count: totalProductsCount.value,
    results_page: currentPage.value,
  });
}

function selectProduct(product: Product): void {
  analytics("selectItem", product);
}

whenever(() => !isMobile.value, hideFiltersSidebar);

watch(
  () => props.categoryId,
  (categoryId) => {
    if (categoryId || props.isRoot) {
      const { zero_price_product_enabled } = themeContext.value.settings;
      const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

      const productFilter = catalog_empty_categories_enabled
        ? undefined
        : getFilterExpression([
            getFilterExpressionForCategorySubtree({ catalogId, categoryId }),
            getFilterExpressionForZeroPrice(!!zero_price_product_enabled, currencyCode),
            getFilterExpressionForInStock(true),
          ]);

      void fetchCategory({
        categoryId,
        maxLevel: 1,
        onlyActive: true,
        productFilter,
      });
    }
  },
  { immediate: true },
);

watch(props, ({ viewMode }) => {
  if (viewMode && viewModes.includes(viewMode)) {
    savedViewMode.value = viewMode;
  }
});

watchDebounced(
  computed(() => JSON.stringify(searchParams.value)),
  () => {
    if (categoryProductsAnchor.value) {
      categoryProductsAnchor.value.scrollIntoView({ block: "center" });
    }
    void fetchProducts();
  },
  {
    debounce: 20,
    flush: "post",
    immediate: true,
  },
);
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
