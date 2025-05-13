<template>
  <VcContainer ref="categoryComponentAnchor" class="category" style="overflow-anchor: none">
    <!-- Breadcrumbs -->
    <VcBreadcrumbs v-if="!hideBreadcrumbs" class="category__breadcrumbs" :items="breadcrumbs" />

    <!-- Popup sidebar for mobile and horizontal desktop view -->
    <FiltersPopupSidebar
      v-if="!hideSidebar && (isMobile || isHorizontalFilters)"
      :is-exist-selected-facets="hasSelectedFacets"
      :is-popup-sidebar-filter-dirty="isFiltersDirty"
      :popup-sidebar-filters="filtersToShow"
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
          class="category__selector"
        />

        <ProductsFilters
          :keyword="keywordQueryParam"
          :filters="filtersToShow"
          :loading="fetchingProducts"
          class="category__product-filters"
          @change="applyFilters($event)"
        />
      </template>

      <VcTypography tag="h1" class="category__title">
        <i18n-t v-if="!categoryId && !isRoot && searchParams.keyword" keypath="pages.search.header" tag="span">
          <template #keyword>
            <strong>{{ searchParams.keyword }}</strong>
          </template>
        </i18n-t>

        <!-- Skeleton -->
        <span v-else-if="!currentCategory && loadingCategory" class="category__title-skeleton"> &nbsp; </span>

        <span v-else-if="title">
          {{ title }}
        </span>

        <span v-else>
          {{ currentCategory?.name }}
        </span>

        <sup v-if="!fetchingProducts && !hideTotal && !fixedProductsCount" class="category__products-count">
          <b>{{ $n(totalProductsCount, "decimal") }}</b>

          {{ $t("pages.catalog.products_found_message", totalProductsCount) }}
        </sup>
      </VcTypography>

      <div ref="stickyMobileHeaderAnchor" class="category__header-anchor"></div>

      <div
        :class="[
          'category__filters',
          {
            'category__filters--sticky': stickyMobileHeaderIsVisible,
          },
        ]"
      >
        <!-- Popup sidebar filters toggler -->
        <VcButton
          v-if="!hideSidebar"
          class="category__facets-button"
          icon="filter"
          size="sm"
          @click="showFiltersSidebar"
        />

        <!-- Sorting -->
        <div v-if="!hideSorting && !isHorizontalFilters" class="category__sort">
          <VcLabel class="category__sort-label">
            {{ $t("pages.catalog.sort_by_label") }}
          </VcLabel>

          <VcSelect
            v-model="sortQueryParam"
            text-field="name"
            value-field="id"
            :disabled="fetchingProducts"
            :items="translatedProductSortingList"
            class="category__sort-dropdown"
            size="sm"
            @change="resetCurrentPage"
          />
        </div>

        <!-- View options - horizontal view -->
        <ViewMode v-if="!hideViewModeSelector" v-model:mode="savedViewMode" class="category__view-mode" />

        <!-- In stock and branches -->
        <CategoryControls
          v-if="!hideControls && !isMobile && !isHorizontalFilters"
          v-model="localStorageInStock"
          :loading="fetchingProducts"
          :saved-branches="localStorageBranches"
          class="category__controls"
          @open-branches-modal="openBranchesModal"
          @apply-in-stock="resetCurrentPage"
        />
      </div>

      <!-- Horizontal filters -->
      <CategoryHorizontalFilters
        v-if="isHorizontalFilters && !isMobile"
        :facets-loading="fetchingFacets"
        :keyword-query-param="keywordQueryParam"
        :sort-query-param="sortQueryParam"
        :loading="fetchingProducts || fetchingFacets"
        :filters="filtersToShow"
        :hide-sorting="hideSorting"
        :hide-all-filters="hideSidebar"
        :facets-to-hide="facetsToHide"
        @reset-facet-filters="resetFacetFilters"
        @apply-filters="applyFilters"
        @show-popup-sidebar="showFiltersSidebar"
        @apply-sort="resetCurrentPage"
      />
      <!-- Filters chips -->
      <div
        v-if="
          hasSelectedFacets ||
          (catalogPaginationMode === CATALOG_PAGINATION_MODES.loadMore &&
            $route.query.page &&
            Number($route.query.page) > 1)
        "
        class="category__chips"
      >
        <template v-for="facet in productsFilters.facets">
          <template v-if="!facetsToHide?.includes(facet.paramName)">
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
        </template>

        <VcChip
          v-if="
            catalogPaginationMode === CATALOG_PAGINATION_MODES.loadMore &&
            $route.query.page &&
            Number($route.query.page) > 1
          "
          color="secondary"
          variant="outline"
          clickable
          @click="resetPage"
        >
          <span>{{ $t("common.buttons.reset_page") }}</span>

          <VcIcon name="reset" />
        </VcChip>

        <VcChip v-if="hasSelectedFacets" color="secondary" variant="outline" clickable @click="resetFacetFilters">
          <span>{{ $t("common.buttons.reset_filters") }}</span>

          <VcIcon name="reset" />
        </VcChip>
      </div>

      <div ref="categoryProductsAnchor" class="category__products-anchor"></div>

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
        :page-history="pageHistory"
        :products="products"
        :saved-view-mode="savedViewMode"
        :search-params="searchParams"
        :mode="catalogPaginationMode"
        class="category__products"
        @change-page="changeProductsPage"
        @reset-facet-filters="resetFacetFilters"
        @reset-filter-keyword="resetFilterKeyword"
        @select-product="selectProduct"
      />

      <div class="category__products-bottom">
        <VcButton v-if="showButtonToDefaultView" color="primary" :to="{ query: { view: 'default' } }">
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
import omit from "lodash/omit";
import { computed, ref, shallowRef, toRef, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
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
import { CATALOG_PAGINATION_MODES } from "@/shared/catalog/constants/catalog";
import { useSlugInfo } from "@/shared/common";
import { LOCAL_ID_PREFIX, useShipToLocation } from "@/shared/ship-to-location/composables";
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
  facetsToHide?: string[];
}

const { allowSetMeta } = toRefs(props);
const filtersDisplayOrder = toRef(props, "filtersDisplayOrder");
const facetsToHide = toRef(props, "facetsToHide");

const { catalogId, currencyCode } = globals;

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("md");

const catalogPaginationMode = computed(
  () => themeContext.value?.settings?.catalog_pagination_mode ?? CATALOG_PAGINATION_MODES.infiniteScroll,
);

const filtersToShow = computed(() => {
  if (!facetsToHide.value?.length) {
    return productsFilters.value;
  }

  return {
    ...productsFilters.value,
    facets: productsFilters.value.facets.filter((facet) => !facetsToHide.value?.includes(facet.paramName)),
  };
});

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
  pageHistory,
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
  catalogPaginationMode: catalogPaginationMode.value,
  facetsToHide: facetsToHide.value,
});
const { loading: loadingCategory, category: currentCategory, fetchCategory } = useCategory();
const { analytics } = useAnalytics();

const { selectedAddress } = useShipToLocation();

const savedViewMode = useLocalStorage<ViewModeType>("viewMode", "grid");

const itemsPerPage = ref(DEFAULT_PAGE_SIZE);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

const isHorizontalFilters = computed(() => !isMobile.value && props.filtersOrientation === "horizontal");
const hideViewModeSelector = computed(() => {
  return props.viewMode && viewModes.includes(props.viewMode);
});

const categoryListProperties = computed(() => ({
  item_list_id: `category_${currentCategory.value?.slug}_page_${currentPage.value}`,
  item_list_name: `Category "${currentCategory.value?.name}" (page ${currentPage.value})`,
  related_id: currentCategory.value?.id,
  related_type: "category",
}));

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

const { t } = useI18n();

function getTranslatedProductSortingList() {
  return PRODUCT_SORTING_LIST.map((item) => ({
    ...item,
    name: t(item.name),
  }));
}

const translatedProductSortingList = computed(() => getTranslatedProductSortingList());

function getSelectedAddressArgs(): {
  selectedAddressId: string | undefined;
  selectedAddress: string | undefined;
} {
  const selectedAddressIdValue = selectedAddress.value?.id?.startsWith(LOCAL_ID_PREFIX)
    ? undefined
    : selectedAddress.value?.id;
  const selectedAddressValue = selectedAddressIdValue
    ? undefined
    : JSON.stringify(omit(selectedAddress.value, ["id", "isDefault", "isFavorite"]));
  return {
    selectedAddressId: selectedAddressIdValue,
    selectedAddress: selectedAddressValue,
  };
}

const searchParams = computedEager<ProductsSearchParamsType>(() => ({
  ...getSelectedAddressArgs(),
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
  analytics("viewItemList", products.value, categoryListProperties.value);

  if (searchQueryParam.value) {
    trackViewSearchResults();
  }
}

async function fetchProducts(): Promise<void> {
  await _fetchProducts(searchParams.value);

  /**
   * Send Google Analytics event for products.
   */
  analytics("viewItemList", products.value, categoryListProperties.value);

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
  analytics("selectItem", product, categoryListProperties.value);
}

function resetPage() {
  void resetCurrentPage();
  void fetchProducts();
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

<style lang="scss">
.category {
  &__breadcrumbs {
    @apply mb-2.5;

    @media (min-width: theme("screens.md")) {
      @apply mb-4;
    }
  }

  &__selector {
    @apply mb-4;

    @media (min-width: theme("screens.md")) {
      @apply mb-5;
    }
  }

  &__title {
    --vc-typography-text-transform: none;
  }

  &__title-skeleton {
    @apply inline-block w-48 bg-neutral-200 md:w-64;
  }

  &__products-count {
    @apply -top-1 ml-2 whitespace-nowrap text-sm font-normal normal-case text-neutral lg:top-[-0.5em] lg:text-base;
  }

  &__filters {
    @apply flex items-center gap-3 my-3 empty:h-2;

    @media (min-width: theme("screens.md")) {
      @apply mb-3.5 mt-3 flex-wrap justify-end;
    }

    @media (min-width: theme("screens.xl")) {
      @apply gap-x-6;
    }

    &--sticky {
      @apply z-40 sticky top-[2.1rem] -mx-6 bg-additional-50 px-5 py-3 shadow-lg;
    }
  }

  &__facets-button {
    @media (min-width: theme("screens.md")) {
      @apply hidden;
    }
  }

  &__sort {
    @apply flex gap-2 items-center;

    @media (width < theme("screens.md")) {
      @apply grow;
    }

    @media (min-width: theme("screens.lg")) {
      @apply order-last;
    }
  }

  &__sort-label {
    @apply me-2 shrink-0;

    @media (width < theme("screens.md")) {
      @apply hidden;
    }
  }

  &__sort-dropdown {
    @apply w-full;
  }

  &__view-mode {
    @apply order-last;

    @media (min-width: theme("screens.md")) {
      @apply order-first me-auto;
    }
  }

  &__controls {
    @media (width < theme("screens.lg")) and (min-width: theme("screens.md")) {
      @apply order-last w-full;
    }
  }

  &__chips {
    @apply flex mb-3 flex-wrap gap-2;
  }

  &__products-bottom {
    @apply my-8 text-center;
  }
}
</style>
