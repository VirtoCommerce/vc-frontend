<template>
  <div ref="categoryComponentAnchor" class="category">
    <Error404 v-if="isCategoryNotFound" />

    <template v-else>
      <!-- Popup sidebar for mobile and horizontal desktop view -->
      <FiltersPopupSidebar
        v-if="!hideSidebar && (isMobile || isHorizontalFilters)"
        :is-exist-selected-facets="hasSelectedFacets"
        :popup-sidebar-filters="filtersToShow"
        :facets-loading="fetchingFacets"
        :is-mobile="isMobile"
        :is-visible="isFiltersSidebarVisible"
        :keyword-query-param="keywordQueryParam"
        :loading="fetchingProducts"
        :hide-controls="hideControls"
        @hide-popup-sidebar="hideFiltersSidebar"
        @reset-facet-filters="resetFacetFilters"
        @apply-filters="applyFilters"
      />

      <VcLayout sticky-sidebar>
        <template v-if="!hideSidebar && !isMobile && !isHorizontalFilters" #sidebar>
          <CategorySelector
            v-if="categoryId || isRoot"
            :category="currentCategory"
            :loading="!currentCategory && loadingCategory"
            class="category__selector"
            :category-facets="categoryFacets"
          />

          <ProductsFilters
            :keyword="keywordQueryParam"
            :filters="filtersToShow"
            :loading="fetchingProducts"
            class="category__product-filters"
            @change:filters="applyFiltersOnly($event)"
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

          <span v-else-if="currentCategory && searchQueryParam">
            {{ $t("pages.catalog.search_in_category", { keyword: searchQueryParam, category: currentCategory.name }) }}
          </span>

          <span v-else>
            {{ currentCategory?.name }}
          </span>

          <sup v-if="!fetchingProducts && !hideTotal && !fixedProductsCount" class="category__products-count">
            <b class="me-1">{{ $n(totalProductsCount, "decimal") }}</b>

            <template v-if="currentCategory && searchQueryParam">
              {{ $t("pages.catalog.products_found_message_search", totalProductsCount) }}
            </template>

            <template v-else>
              {{ $t("pages.catalog.products_found_message", totalProductsCount) }}
            </template>
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
            :aria-label="$t('common.accessibility.open_filters')"
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
          <ViewMode
            v-if="!hideViewModeSelector"
            v-model:mode="savedViewMode"
            class="category__view-mode"
            data-test-id="category-page.view-switcher"
          />

          <!-- In stock and branches -->
          <CategoryControls
            v-if="!hideControls && !isMobile && !isHorizontalFilters"
            v-model="localStorageInStock"
            v-model:purchased-before="localStoragePurchasedBefore"
            :loading="fetchingProducts"
            :saved-branches="localStorageBranches"
            class="category__controls"
            @open-branches-modal="openBranchesModal"
            @apply-in-stock="resetCurrentPage"
            @apply-purchased-before="resetCurrentPage"
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
          @reset-facet-filters="resetFacetFilters"
          @change:filters="applyFiltersOnly($event)"
          @show-popup-sidebar="showFiltersSidebar"
          @apply-sort="resetCurrentPage"
        />
        <ActiveFilterChips
          v-if="hasSelectedFacets || isResetPageButtonShown"
          :filters="productsFilters.filters"
          :facets-to-hide="normalizedFacetsToHide"
          @apply-filters="applyFiltersOnly"
        >
          <template #actions>
            <VcChip v-if="hasSelectedFacets" color="secondary" variant="outline" clickable @click="resetFacetFilters">
              <span>{{ $t("common.buttons.reset_filters") }}</span>

              <VcIcon name="reset" />
            </VcChip>

            <VcChip v-if="isResetPageButtonShown" color="secondary" variant="outline" clickable @click="resetPage">
              <span>{{ $t("common.buttons.reset_page") }}</span>

              <VcIcon name="reset" />
            </VcChip>
          </template>
        </ActiveFilterChips>

        <div ref="categoryProductsAnchor" class="category__products-anchor"></div>

        <CategoryProducts
          :card-type="cardType"
          :columns-amount-desktop="columnsAmountDesktop"
          :columns-amount-tablet="columnsAmountTablet"
          :fetching-more-products="fetchingMoreProducts"
          :fetching-products="fetchingProducts"
          :fixed-products-count="fixedProductsCount"
          :has-active-filters="
            hasSelectedFacets || localStorageInStock || localStoragePurchasedBefore || !!localStorageBranches.length
          "
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
          @reset-filter-keyword="resetFilterKeyword"
          @select-product="selectProduct"
        />

        <div class="category__products-bottom">
          <VcButton v-if="showButtonToDefaultView" color="primary" :to="{ query: { view: 'default' } }">
            {{ $t("pages.catalog.show_all_results") }}
          </VcButton>
        </div>
      </VcLayout>
    </template>
  </div>
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
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, shallowRef, toRef, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useAnalytics, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BREAKPOINTS, DEFAULT_PAGE_SIZE, PRODUCT_SORTING_LIST } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { globals } from "@/core/globals";
import {
  getFilterExpression,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStockVariations,
  getFilterExpressionForPurchasedBefore,
  getFilterExpressionForZeroPrice,
} from "@/core/utilities";
import { useCategorySeo } from "@/shared/catalog/composables/useCategorySeo";
import { CATALOG_PAGINATION_MODES } from "@/shared/catalog/constants/catalog";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar.ts";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore.ts";
import { LOCAL_ID_PREFIX, useShipToLocation } from "@/shared/ship-to-location/composables";
import { useCategory, useProducts } from "../composables";
import CategorySelector from "./category-selector.vue";
import ProductsFilters from "./products-filters.vue";
import ViewMode from "./view-mode.vue";
import type { Product } from "@/core/api/graphql/types";
import type { FiltersDisplayOrderType, ProductsFiltersType, ProductsSearchParamsType } from "@/shared/catalog";
import ActiveFilterChips from "@/shared/catalog/components/active-filter-chips.vue";
import CategoryControls from "@/shared/catalog/components/category/category-controls.vue";
import CategoryHorizontalFilters from "@/shared/catalog/components/category/category-horizontal-filters.vue";
import CategoryProducts from "@/shared/catalog/components/category/category-products.vue";
import FiltersPopupSidebar from "@/shared/catalog/components/category/filters-popup-sidebar.vue";
const props = defineProps<IProps>();

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const viewModes = ["grid", "list"] as const;

const CATEGORY_FACET_PARAM_NAME = "__outline_named";

type ViewModeType = (typeof viewModes)[number];

interface IProps {
  isRoot?: boolean;
  categoryId?: string;
  title?: string;
  hideTotal?: boolean;
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

const isCategoryNotFound = ref(false);

const route = useRoute();

const normalizedFacetsToHide = computed(() => {
  return facetsToHide.value?.map((facet) => facet.toLowerCase());
});

const isResetPageButtonShown = computed(() => {
  return (
    catalogPaginationMode.value === CATALOG_PAGINATION_MODES.loadMore &&
    !!route.query.page &&
    Number(route.query.page) > 1
  );
});

const catalogPaginationMode = computed(
  () => themeContext.value?.settings?.catalog_pagination_mode ?? CATALOG_PAGINATION_MODES.infiniteScroll,
);

const filtersToShow = computed(() => {
  if (!facetsToHide.value?.length) {
    return productsFilters.value;
  }

  return {
    ...productsFilters.value,
    facets: productsFilters.value.facets.filter(
      (facet) => !normalizedFacetsToHide.value?.includes(facet.paramName.toLowerCase()),
    ),
  };
});

const categoryFacets = computed(() => {
  return filtersToShow.value.facets.find((el) => el.paramName === CATEGORY_FACET_PARAM_NAME)?.values;
});

const { themeContext } = useThemeContext();
const {
  facetsQueryParam,
  fetchingMoreProducts,
  fetchingProducts,
  fetchingFacets,
  hasSelectedFacets,
  isFiltersSidebarVisible,
  keywordQueryParam,
  localStorageBranches,
  localStorageInStock,
  localStoragePurchasedBefore,
  pagesCount,
  pageHistory,
  products,
  productsFilters,
  searchQueryParam,
  sortQueryParam,
  totalProductsCount,
  preserveUserQueryQueryParam,

  applyFilters: _applyFilters,
  applyFiltersOnly,
  fetchProducts: _fetchProducts,
  fetchMoreProducts,
  hideFiltersSidebar,
  openBranchesModal,

  resetFacetFilters,
  resetFilterKeyword,
  showFiltersSidebar,

  currentPage,
  updateCurrentPage,
  resetCurrentPage,
} = useProducts({
  filtersDisplayOrder,
  useQueryParams: true,
  withFacets: true,
  catalogPaginationMode: catalogPaginationMode.value,
  facetsToHide: normalizedFacetsToHide.value,
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

useCategorySeo({ category: currentCategory, allowSetMeta, categoryComponentAnchorIsVisible });

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
  keyword: searchQueryParam.value || keywordQueryParam.value || props.keyword,
  filter: [
    props.filter,
    facetsQueryParam.value,
    getFilterExpressionForInStockVariations(localStorageInStock.value),
    getFilterExpressionForPurchasedBefore(localStoragePurchasedBefore.value),
    getFilterExpressionForAvailableIn(localStorageBranches.value),
  ]
    .filter(Boolean)
    .join(" "),
  preserveUserQuery: !!preserveUserQueryQueryParam.value,
}));

const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

function applyFilters(newFilters: ProductsFiltersType): void {
  _applyFilters(newFilters);
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
const { addScopeItem, removeScopeItemByType, setQueryScope, preparingScope } = useSearchScore();

watch(
  () => props.categoryId,
  async (categoryId) => {
    if (categoryId || props.isRoot) {
      isCategoryNotFound.value = false;

      setQueryScope(searchQueryParam.value);

      if (categoryId) {
        preparingScope.value = true;
      }

      const { zero_price_product_enabled } = themeContext.value.settings;
      const catalog_empty_categories_enabled = getSettingValue(MODULE_XAPI_KEYS.CATALOG_EMPTY_CATEGORIES_ENABLED);

      const productFilter = catalog_empty_categories_enabled
        ? undefined
        : getFilterExpression([
            getFilterExpressionForCategorySubtree({ catalogId, categoryId }),
            getFilterExpressionForZeroPrice(!!zero_price_product_enabled, currencyCode),
            getFilterExpressionForInStockVariations(true),
          ]);
      const data = await fetchCategory({
        categoryId,
        maxLevel: 1,
        onlyActive: true,
        productFilter,
      });

      if (!props.isRoot) {
        isCategoryNotFound.value = !data;
      }

      preparingScope.value = false;
    }
  },
  { immediate: true },
);

watch(props, ({ viewMode }) => {
  if (viewMode && viewModes.includes(viewMode)) {
    savedViewMode.value = viewMode;
  }
});

watch(
  () => currentCategory.value?.id,
  () => {
    if (currentCategory.value) {
      changeSearchBarScope(currentCategory.value.id, currentCategory.value.name);
    }
  },
);

watch(searchQueryParam, (value) => {
  setQueryScope(value);
  resetCurrentPage();
});

watchDebounced(
  computed(() => JSON.stringify(searchParams.value)),
  () => {
    void fetchProducts();
  },
  {
    debounce: 20,
    flush: "post",
    immediate: true,
  },
);

watchDebounced(
  computed(() => JSON.stringify(searchParams.value)),
  () => {
    if (categoryProductsAnchor.value && (!isHorizontalFilters.value || isMobile.value)) {
      categoryProductsAnchor.value.scrollIntoView({ block: "center" });
    }
  },
  {
    debounce: 20,
  },
);

const { clearSearchResults } = useSearchBar();

function changeSearchBarScope(categoryId: string, label?: string) {
  clearCategoryScope();

  if (!label) {
    return;
  }

  addScopeItem({
    filter: getFilterExpressionForCategorySubtree({ catalogId, categoryId }),
    label,
    id: categoryId,
    type: "category",
  });
}

onBeforeUnmount(() => {
  clearCategoryScope();
  document.body.style.overflowAnchor = "auto";
});

function clearCategoryScope() {
  removeScopeItemByType("category");
  clearSearchResults();
}

onMounted(() => {
  document.body.style.overflowAnchor = "none";
});
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

  &__products-bottom {
    @apply my-8 text-center;
  }
}
</style>
