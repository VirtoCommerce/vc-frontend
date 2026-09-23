<template>
  <div ref="categoryComponentAnchor" class="category">
    <Error404 v-if="isCategoryNotFound" />

    <template v-else>
      <!-- Popup sidebar for mobile and horizontal desktop view -->
      <FiltersPopupSidebar
        v-if="!hideSidebar && (isCompact || isHorizontalFilters)"
        :is-exist-selected-facets="hasSelectedFacets"
        :popup-sidebar-filters="filtersToShow"
        :facets-loading="fetchingFacets"
        :is-mobile="isCompact"
        :is-visible="isFiltersSidebarVisible"
        :loading="fetchingProducts"
        :hide-controls="hideControls"
        @hide-popup-sidebar="hideFiltersSidebar"
        @reset-facet-filters="resetFacetFilters"
        @apply-filters="applyFilters"
      />

      <VcLayout sticky>
        <template v-if="isSidebarVisible" #sidebar>
          <CategorySelector
            v-if="categoryId || isRoot"
            :category="currentCategory"
            :loading="!currentCategory && loadingCategory"
            class="category__selector"
            :category-facets="categoryFacets"
          />

          <ProductsFilters
            :filters="filtersToShow"
            :loading="fetchingProducts"
            class="category__product-filters"
            @change:filters="applyFiltersOnly($event)"
          />
        </template>

        <!-- The page is laid out as plates on the canvas: the heading is one plate, the category's
             picture a second beside it, and the listing a third below. -->
        <div :class="['category__head', { 'category__head--art': headImage }]">
          <div class="category__head-plate">
            <div v-if="$slots.breadcrumbs" class="category__breadcrumbs">
              <slot name="breadcrumbs" />
            </div>

            <VcTypography tag="h1" class="category__title">
              <i18n-t
                v-if="!categoryId && !isRoot && searchParams.keyword"
                :keypath="emptyViewSearchOnly ? 'pages.search.header_empty' : 'pages.search.header'"
                tag="span"
              >
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
                {{
                  $t("pages.catalog.search_in_category", { keyword: searchQueryParam, category: currentCategory.name })
                }}
              </span>

              <span v-else>
                {{ currentCategory?.name }}
              </span>

              <!-- The count answers the grid under it: "8 products found", and on a phone, "8 results". -->
              <sup v-if="showProductsCount" class="category__products-count">
                <b class="me-1" data-test-id="products-count-label">{{ $n(totalProductsCount, "decimal") }}</b>
                {{ " " }}

                <template v-if="currentCategory && searchQueryParam">
                  {{ $t("pages.catalog.products_found_message_search", totalProductsCount) }}
                </template>

                <template v-else-if="isMobile">
                  {{ $t("pages.catalog.products_found_message", totalProductsCount) }}
                </template>

                <template v-else>
                  {{ $t("pages.catalog.products_found_label", totalProductsCount) }}
                </template>
              </sup>
            </VcTypography>
          </div>

          <img v-if="headImage" :src="headImage" alt="" class="category__head-art" />
        </div>

        <div class="category__body">
          <template v-if="!hideAllControls">
            <div class="category__filters">
              <!-- Popup sidebar filters toggler -->
              <VcButton
                v-if="!hideSidebar"
                class="category__facets-button"
                icon="filter"
                size="sm"
                :aria-label="$t('common.accessibility.open_filters')"
                @click="showFiltersSidebar"
              />

              <!-- View options - horizontal view -->
              <ViewMode
                v-if="!hideViewModeSelector"
                v-model:mode="savedViewMode"
                class="category__view-mode"
                data-test-id="view-switcher"
              />

              <!-- The page's quick filters and its order, one group on the far side of the layout switch -->
              <div class="category__filters-right">
                <!-- In stock and branches -->
                <CategoryControls
                  v-if="!hideControls && !isCompact && !isHorizontalFilters"
                  v-model="localStorageInStock"
                  v-model:purchased-before="localStoragePurchasedBefore"
                  :loading="fetchingProducts"
                  :saved-branches="localStorageBranches"
                  class="category__controls"
                  @open-branches-modal="openBranchesModal"
                  @apply-in-stock="resetCurrentPage"
                  @apply-purchased-before="resetCurrentPage"
                />

                <!-- Sorting -->
                <CategorySort
                  v-if="!hideSorting && !isHorizontalFilters"
                  v-model="selectedSort"
                  :options="translatedProductSortingList"
                  :loading="fetchingProducts"
                  class="category__sort"
                  @change="applySort"
                />
              </div>
            </div>

            <!-- Horizontal filters -->
            <CategoryHorizontalFilters
              v-if="isHorizontalFilters && !isMobile"
              :facets-loading="fetchingFacets"
              :sortings="sortings"
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
              v-if="hasSelectedFilters || isResetPageButtonShown || activeControls.length"
              :filters="productsFilters.filters"
              :facets-to-hide="normalizedFacetsToHide"
              :controls="activeControls"
              @apply-filters="applyFiltersOnly"
              @cancel-control="cancelControl"
            >
              <template #actions>
                <VcChip
                  v-if="hasSelectedFilters || activeControls.length"
                  color="secondary"
                  variant="outline"
                  clickable
                  @click="resetFacetAndControlsFilters"
                >
                  <span>{{ $t("common.buttons.reset_filters") }}</span>

                  <VcIcon name="reset" variant="solid" />
                </VcChip>

                <VcChip v-if="isResetPageButtonShown" color="secondary" variant="outline" clickable @click="resetPage">
                  <span>{{ $t("common.buttons.reset_page") }}</span>

                  <VcIcon name="reset" variant="solid" />
                </VcChip>
              </template>
            </ActiveFilterChips>
          </template>

          <div ref="categoryProductsAnchor" class="category__products-anchor"></div>

          <CategoryProducts
            ref="categoryProducts"
            :card-type="cardType"
            :sort-token="sortToken"
            :fetching-more-products="fetchingMoreProducts"
            :fetching-products="fetchingProducts"
            :fixed-products-count="fixedProductsCount"
            :has-active-filters="
              hasSelectedFilters || localStorageInStock || localStoragePurchasedBefore || !!localStorageBranches.length
            "
            :items-per-page="itemsPerPage"
            :grid-columns="gridColumns"
            :pages-count="pagesCount"
            :page-number="currentPage"
            :page-history="pageHistory"
            :products="products"
            :saved-view-mode="savedViewMode"
            :mode="catalogPaginationMode"
            :keyword="searchParams.keyword"
            class="category__products"
            @change-page="changeProductsPage"
            @reset-filter-keyword="handleResetFilterKeyword"
            @select-product="selectProduct"
          />

          <div v-if="showButtonToDefaultView" class="category__products-bottom">
            <VcButton color="primary" :to="{ query: { view: 'default' } }">
              {{ $t("pages.catalog.show_all_results") }}
            </VcButton>
          </div>
        </div>
      </VcLayout>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, useElementVisibility, useLocalStorage, watchDebounced, whenever } from "@vueuse/core";
import { omit } from "lodash-es";
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  toRef,
  toRefs,
  useTemplateRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useAnalytics, useThemeContext } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import {
  getFilterExpression,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStockVariations,
  getFilterExpressionForPurchasedBefore,
  getFilterExpressionForZeroPrice,
} from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { getRowAlignedPageSize, useCatalogGridColumns } from "@/shared/catalog/composables/useCatalogGridColumns";
import { useCategorySeo } from "@/shared/catalog/composables/useCategorySeo";
import { useProductSortings } from "@/shared/catalog/composables/useProductSortings";
import { CATALOG_PAGINATION_MODES, CatalogControl } from "@/shared/catalog/constants/catalog";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar.ts";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore.ts";
import { LOCAL_ID_PREFIX, useShipToLocation } from "@/shared/ship-to-location/composables";
import { BREAKPOINTS } from "@/ui-kit/constants";
import { useCategory, useProducts } from "../composables";
import CategorySelector from "./category-selector.vue";
import ProductsFilters from "./products-filters.vue";
import ViewMode from "./view-mode.vue";
import type { Product } from "@/core/api/graphql/types";
import type { FiltersDisplayOrderType, ProductsFiltersType, ProductsSearchParamsType } from "@/shared/catalog";
import type { RouteLocationRaw } from "vue-router";
import ActiveFilterChips from "@/shared/catalog/components/active-filter-chips.vue";
import CategoryControls from "@/shared/catalog/components/category/category-controls.vue";
import CategoryHorizontalFilters from "@/shared/catalog/components/category/category-horizontal-filters.vue";
import CategoryProducts from "@/shared/catalog/components/category/category-products.vue";
import CategorySort from "@/shared/catalog/components/category/category-sort.vue";
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
  /** Overrides the default store currency when fetching products (e.g. for loyalty catalog). */
  currencyCodeOverride?: string;
}

const { allowSetMeta } = toRefs(props);
const filtersDisplayOrder = toRef(props, "filtersDisplayOrder");
const facetsToHide = toRef(props, "facetsToHide");

const { catalogId, currencyCode: defaultCurrencyCode } = globals;
const currencyCode = computed(() => props.currencyCodeOverride || defaultCurrencyCode);

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("md");
/** Below lg the rail gives way to the filters drawer, and the quick filters move into it with the facets. */
const isCompact = breakpoints.smaller("lg");

const isCategoryNotFound = ref(false);

const route = useRoute();
const router = useRouter();

const { isCategoryScope } = useSearchScore();

const normalizedFacetsToHide = computed(() => {
  return facetsToHide.value?.map((facet) => String(facet).toLowerCase()) ?? [];
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
      (facet) => !normalizedFacetsToHide.value.includes(facet.paramName.toLowerCase()),
    ),
  };
});

const categoryFacets = computed(() => {
  return filtersToShow.value.facets.find((el) => el.paramName === CATEGORY_FACET_PARAM_NAME)?.values ?? [];
});

const { themeContext } = useThemeContext();
const {
  facetsQueryParam,
  fetchingMoreProducts,
  fetchingProducts,
  fetchingFacets,
  hasSelectedFacets,
  hasSelectedFilters,
  isFiltersSidebarVisible,
  localStorageBranches,
  localStorageInStock,
  localStoragePurchasedBefore,
  pagesCount,
  pageHistory,
  products,
  productsFilters,
  searchQueryParam,
  sortQueryParam,
  sortings,
  totalProductsCount,
  preserveUserQueryQueryParam,

  applyFilters: _applyFilters,
  applyFiltersOnly,
  fetchProducts: _fetchProducts,
  fetchMoreProducts,
  hideFiltersSidebar,
  openBranchesModal,

  resetFacetFilters,
  resetFacetAndControlsFilters,
  resetSearchKeyword,
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
  currencyCodeOverride: () => props.currencyCodeOverride,
});
const {
  loading: loadingCategory,
  category: currentCategory,
  fetchCategory,
} = useCategory({
  currencyCodeOverride: () => props.currencyCodeOverride,
});
const { analytics } = useAnalytics();
const { updateLocalizedUrl } = useLanguages();

const { selectedAddress } = useShipToLocation();

const savedViewMode = useLocalStorage<ViewModeType>("viewMode", "grid");

const categoryProducts = useTemplateRef("categoryProducts");
const gridColumns = useCatalogGridColumns(() => categoryProducts.value?.$el as HTMLElement | undefined);

/** Whole rows per page: 16 cards on three columns left a row of one at the foot of every page. */
const itemsPerPage = computed(() => getRowAlignedPageSize(gridColumns.value, DEFAULT_PAGE_SIZE));

const isHorizontalFilters = computed(() => !isMobile.value && props.filtersOrientation === "horizontal");
const hideViewModeSelector = computed(() => {
  return !!props.viewMode && viewModes.includes(props.viewMode);
});

const categoryListProperties = computed(() => ({
  item_list_id: `category_${currentCategory.value?.slug}_page_${currentPage.value}`,
  item_list_name: `Category "${currentCategory.value?.name}" (page ${currentPage.value})`,
  related_id: currentCategory.value?.id,
  related_type: "category",
}));

const filteredOnlyBySearch = computed(() => {
  return !hasSelectedFilters.value && !!searchQueryParam.value;
});
const emptyViewSearchOnly = computed(() => {
  return filteredOnlyBySearch.value && products.value.length === 0 && !fetchingProducts.value;
});
const hideAllControls = computed(() => {
  return emptyViewSearchOnly.value;
});

const isSidebarVisible = computed(() => {
  return !props.hideSidebar && !isCompact.value && !isHorizontalFilters.value && !emptyViewSearchOnly.value;
});

const showProductsCount = computed(() => {
  return !fetchingProducts.value && !props.hideTotal && !props.fixedProductsCount && !emptyViewSearchOnly.value;
});

const activeControls = computed(() => {
  const controls = [];

  if (localStorageInStock.value) {
    controls.push({
      label: t("pages.catalog.instock_filter_card.checkbox_label"),
      value: CatalogControl.InStock,
    });
  }
  if (localStoragePurchasedBefore.value) {
    controls.push({
      label: t("pages.catalog.purchased_before_filter_card.checkbox_label"),
      value: CatalogControl.PurchasedBefore,
    });
  }
  if (localStorageBranches.value.length) {
    controls.push({
      label: `${t("pages.catalog.branch_availability_filter_card.available_in")} ${t("pages.catalog.branch_availability_filter_card.branches", { n: localStorageBranches.value.length })}`,
      value: CatalogControl.Branches,
    });
  }

  return controls;
});

const categoryComponentAnchor = shallowRef<HTMLElement | null>(null);
const categoryComponentAnchorIsVisible = useElementVisibility(categoryComponentAnchor);

useCategorySeo({ category: currentCategory, allowSetMeta, categoryComponentAnchorIsVisible });

const categoryProductsAnchor = shallowRef<HTMLElement | null>(null);

const { t } = useI18n();

const { sortList: translatedProductSortingList, selectedSort } = useProductSortings(sortings, sortQueryParam);

function cancelControl(control: CatalogControl) {
  switch (control) {
    case CatalogControl.InStock:
      localStorageInStock.value = false;
      break;
    case CatalogControl.PurchasedBefore:
      localStoragePurchasedBefore.value = false;
      break;
    case CatalogControl.Branches:
      localStorageBranches.value = [];
      break;
  }

  void fetchProducts();
}

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

const searchParams = computed<ProductsSearchParamsType>(() => ({
  ...getSelectedAddressArgs(),
  categoryId: props.categoryId,
  itemsPerPage: props.fixedProductsCount || itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: searchQueryParam.value || props.keyword,
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
  void _applyFilters(newFilters);
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

/** The category's own picture, set per category in the admin; the plate is left out when there is none. */
const headImage = computed(() => currentCategory.value?.images?.[0]?.url);

// Counted from the press, not from the sorting the store has confirmed: `selectedSort` follows the
// backend's own `selected` flag and only moves once the search has answered — a second and a half
// after the grid has had to decide whether to hold its cards or drop them for skeletons.
const sortToken = ref(0);

function applySort() {
  sortToken.value += 1;
  void resetCurrentPage();
}

function selectProduct(product: Product): void {
  analytics("selectItem", product, categoryListProperties.value);
}

function resetPage() {
  void resetCurrentPage();
  void fetchProducts();
}

async function handleResetFilterKeyword() {
  const hadKeyword = !!searchQueryParam.value;

  resetSearchKeyword();
  await resetFacetAndControlsFilters({ skipPageReset: true });

  if (!hadKeyword) {
    return;
  }

  const back = router.options.history.state?.back;

  if (!back || !isRouteLocationRaw(back)) {
    return;
  }

  const previousResolvedRoute = router.resolve(back);

  if (previousResolvedRoute.matched.length <= 0) {
    return;
  }

  if (isCategoryScope.value) {
    void router.replace({
      ...previousResolvedRoute,
      query: omit(previousResolvedRoute.query, QueryParamName.SearchPhrase),
    });
  } else {
    const catalogQuery = router.currentRoute.value.name === ROUTES.SEARCH.NAME ? router.currentRoute.value.query : {};
    const catalogQueryWithoutSearch = omit(catalogQuery, QueryParamName.SearchPhrase);

    void router.replace({ name: ROUTES.CATALOG.NAME, query: catalogQueryWithoutSearch });
  }
}

function isRouteLocationRaw(value: unknown): value is RouteLocationRaw {
  if (typeof value === "string") {
    return true;
  }
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    return "path" in record || "name" in record;
  }
  return false;
}

whenever(() => !isCompact.value, hideFiltersSidebar);
const { addScopeItem, removeScopeItemByType, setQueryScope, preparingScope } = useSearchScore();

const { clearSearchResults } = useSearchBar();

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
            getFilterExpressionForZeroPrice(!!zero_price_product_enabled, currencyCode.value),
            getFilterExpressionForInStockVariations(true),
          ]);
      let data;
      try {
        data = await fetchCategory({
          categoryId,
          maxLevel: 1,
          onlyActive: true,
          productFilter,
        });
      } finally {
        preparingScope.value = false;
      }

      if (!props.isRoot) {
        isCategoryNotFound.value = !data;
      }

      updateLocalizedUrl(data?.category?.slug);
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
  void resetCurrentPage();
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

// A page size that follows the column count is not a new question, so it does not scroll the reader.
watchDebounced(
  computed(() => JSON.stringify(omit(searchParams.value, "itemsPerPage"))),
  () => {
    if (categoryProductsAnchor.value && (!isHorizontalFilters.value || isMobile.value)) {
      categoryProductsAnchor.value.scrollIntoView({ block: "center" });
    }
  },
  {
    debounce: 20,
  },
);

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

  if (!isCompact.value) {
    clearSearchResults();
  }
}

onMounted(() => {
  document.body.style.overflowAnchor = "none";
});
</script>

<style lang="scss">
// The design's "nested widget" (Ilya, 22.09.2026): a widget lying inside someone else's surface
// draws no plate of its own and keeps no side inset, so its heading and its rows stand on one
// vertical with whatever holds it — here the rail's cards, and in the phone's drawer the drawer.
@mixin nested-widget {
  .vc-widget {
    --vc-widget-divide-color: transparent;

    @apply rounded-none border-0 bg-transparent px-0 shadow-none;
  }

  .vc-widget__header,
  .vc-widget__slot {
    @apply px-0;
  }

  // The heading carries the hairline under it; rounded like the widget, the rule's ends curl up.
  .vc-widget__header,
  .vc-widget__header-container {
    @apply rounded-none;
  }

  .vc-widget__slot-container,
  .vc-widget__footer-container {
    @apply border-0;
  }

  // The kit paints each row paper white, which on the warm surface reads as a block behind the list.
  // Resting rows only — the kit's hover and active fills stay as they are.
  .vc-menu-item__inner {
    @apply rounded-md px-0;

    &:not(:hover, .vc-menu-item__inner--active) {
      @apply bg-transparent;
    }
  }

  .vc-widget__append-icon {
    --vc-icon-size: 1.5rem;

    @apply text-primary-500;
  }

  // The field stands on the column's edges like the rows under it, and the heading's hairline is
  // the only rule: the design keeps the kit's 12px inset and a second line under the field, a
  // leftover from when a facet had side padding of its own, and in a card it read as a box in a box.
  .facet-filter-widget__search {
    @apply border-0 px-0 pb-1 pt-2.5;
  }

  // The rows start right under the heading's rule, as the design stacks them; the kit pads its list
  // 6px at each end for a widget that had no such rule.
  .facet-filter-widget__container {
    @apply py-0;
  }

  // The kit squares the bottom of anything in a widget's footer to meet the widget's own corners.
  // Here the footer is a pill button floating inside the card, and a squared hover fill read as a tab.
  .facet-filter-widget__more {
    @apply rounded-full;
  }
}

// The drawer is teleported out of the page and carries the facets on its own surface, so it takes
// the nested widget and nothing of the rail's cards.
.filters-popup-sidebar {
  @include nested-widget;

  .vc-widget__title {
    @apply text-sm leading-[1.125rem];
  }

  .facet-filter-widget__fade::after {
    --tw-gradient-from: theme("colors.additional.50") var(--tw-gradient-from-position);
  }
}

.category {
  // The page is plates on the canvas, on the numbers PR #2494 built for the header and footer:
  // one radius, one inside, one shadow and one step between every plate. The fallbacks are those
  // values, so a theme without the paprika tokens still gets round plates.
  --category-plate-radius: var(--plate-radius, 1.75rem);
  --category-plate-pad-y: var(--plate-pad-y, 2.25rem);
  --category-plate-pad-x: var(--plate-pad-x, 2rem);
  --category-plate-gap: var(--page-stack, 1.625rem);
  --category-plate-shadow: var(--plate-shadow, theme("boxShadow.md"));

  // The plate is the design's warm off-white (#fffdf9), the step the footer's top plate paints
  // with, so every plate on the page is one colour and they turn dark together.
  --category-plate-bg: var(--footer-top-bg-color, #fffdf9);

  // The step inside a plate between its toolbar and the grid under it.
  --category-inner: 1.5rem;

  @media (width < 900px) {
    --category-inner: 1.25rem;
  }

  %plate {
    padding: var(--category-plate-pad-y) var(--category-plate-pad-x);
    border-radius: var(--category-plate-radius);
    background: var(--category-plate-bg);
    box-shadow: var(--category-plate-shadow);

    // In dark a plate's edge is the light catching its top, not an outline.
    html.dark & {
      box-shadow:
        inset 0 1px 0 var(--glass-sheen, transparent),
        var(--category-plate-shadow);
    }
  }

  // Between the rail and the listing only: below md the layout unboxes its content column, and a
  // row gap would add itself to the heading's own step.
  .vc-layout__container {
    column-gap: var(--category-plate-gap);
  }

  // 280 wide, the design's rail. Two classes deep: the layout sets the width through its own
  // position modifier, and an equal-weight rule loses to it on load order.
  .vc-layout .vc-layout__sidebar-container {
    width: 17.5rem;
  }

  // The rail is not one plate but a stack of cards — the category list and every facet in a card
  // of its own, 20 apart (Ilya, 22.09.2026). On one continuous surface a gap between two blocks
  // reads as an empty line rather than as a border.
  .vc-layout__sidebar {
    @apply flex w-full flex-col gap-5;

    @include nested-widget;

    .products-filters__container {
      @apply flex flex-col gap-5;
    }

    // A card repeats the plate's surface at a smaller radius — 22 on a block this narrow looks
    // inflated, 16 keeps it in the family.
    .category__selector,
    .products-filters__container > * > .vc-widget,
    .slider-filter > .vc-widget {
      @apply rounded-2xl;

      padding: 1rem 1.25rem 0.75rem;
      background: var(--category-plate-bg);
      box-shadow: var(--category-plate-shadow);

      html.dark & {
        box-shadow:
          inset 0 1px 0 var(--glass-sheen, transparent),
          var(--category-plate-shadow);
      }
    }

    // Every block on the rail is headed the same way — Geologica 700 18/22 over a hairline — so
    // the category list and the facets under it read as one level (Ilya's Figma, 22.09.2026).
    .vc-widget__header-container {
      @apply p-0;
    }

    // The hairline under a heading steps up to neutral 300 in dark, where 200 on the plate vanishes.
    .vc-widget__header {
      @apply min-h-0 border-b border-neutral-200 pb-2 pt-0;

      html.dark & {
        @apply border-neutral-300;
      }
    }

    .vc-widget__title {
      @apply font-geologica text-lg font-bold normal-case leading-[1.375rem] tracking-[-0.02em] text-neutral-950;
    }

    .vc-widget__prepend-append,
    .vc-widget__append-icon {
      @apply flex h-6;
    }

    // A folded facet is its label alone: the hairline would hang along the card's bottom edge.
    .vc-widget--collapsed .vc-widget__header {
      @apply border-b-0 pb-0.5;
    }

    .facet-filter-widget .vc-widget__slot-container {
      @apply pt-1;
    }

    .slider-filter-widget .vc-widget__slot {
      @apply pb-1 pt-4;
    }

    // Rows are 36 — an 18 checkbox and 9 above and below — and the name is quieter than the
    // heading over it.
    .facet-filter-widget__container .vc-menu-item__inner {
      @apply py-[0.5625rem];
    }

    .facet-filter-widget__container .vc-menu-item__content {
      @apply block min-h-[1.125rem] truncate leading-[1.125rem] text-neutral-700;
    }

    // The fade over a cut-off list ends in the card's colour, not white, or it draws a pale band.
    .facet-filter-widget__fade::after {
      --tw-gradient-from: var(--category-plate-bg) var(--tw-gradient-from-position);
      --tw-gradient-to: transparent var(--tw-gradient-to-position);
    }

    // The category list's heading is the widget's own title and the list comes straight under it,
    // 10 below the hairline, with the card's 20 all round.
    .category__selector {
      @apply p-5;

      .vc-widget__header {
        @apply pb-1.5;
      }

      .vc-widget__title {
        @apply tracking-[-0.01em];
      }

      .vc-widget__slot {
        @apply px-0 pb-0 pt-2.5;
      }
    }
  }

  // The heading row is a text plate and the category's picture, 2 : 1 at one fixed height; the
  // picture answers "where am I" faster than the title does.
  &__head {
    @apply grid;

    grid-template-columns: minmax(0, 1fr);
    gap: var(--category-plate-gap);
    margin-bottom: var(--category-plate-gap);

    @media (width >= 900px) {
      block-size: 8.75rem;

      > .category__head-plate {
        @apply py-0;
      }
    }

    &--art {
      @media (width >= 900px) {
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      }
    }
  }

  // 140 is the whole row, so the plate's own vertical inside does not fit in it: the text is
  // centred instead.
  &__head-plate {
    @extend %plate;
    @apply flex min-w-0 flex-col justify-center;
  }

  // The picture is its own plate, on the plate's material: the same shadow and a 2px edge of half
  // white. box-sizing matters — the row is exactly 140, and an outside border would push it out.
  &__head-art {
    @apply block size-full min-h-0 box-border object-cover object-center;

    border-radius: var(--category-plate-radius);
    border: 2px solid rgb(from theme("colors.additional.50") r g b / 0.5);
    background: var(--category-plate-bg);
    box-shadow: var(--category-plate-shadow);

    @media (width < 900px) {
      @apply aspect-video h-auto;
    }

    html.dark & {
      border-color: rgb(from theme("colors.primary.950") r g b / 0.5);
    }
  }

  &__breadcrumbs {
    @apply mb-3.5;
  }

  // Not the home page's display h1 but a caption to the row: 30 on 1.12, where the full h1 took
  // the height the picture needs.
  &__title {
    --vc-typography-text-transform: none;

    @apply font-geologica text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.03em];

    @media (min-width: 1920px) {
      @apply text-[2.0625rem];
    }
  }

  // A note to the title, not part of it: 14 and quiet, raised as a superscript the way the design sets
  // it — by the line box, not by the reset's relative offset.
  &__products-count {
    @apply static ms-2 whitespace-nowrap align-super text-sm font-normal normal-case leading-[1.12] tracking-normal text-neutral-500;
  }

  &__title-skeleton {
    @apply inline-block w-48 bg-neutral-200 md:w-64;
  }

  &__body {
    @extend %plate;
  }

  // Layout switch on the left; the quick filters and the sort together on the right.
  &__filters {
    @apply flex flex-wrap items-center gap-3;

    margin-bottom: var(--category-inner);
  }

  // The layout switch and the sort are the design's seg track: no rim, 13 each side of a label, and
  // the soft plate shadow on the sliding pill and the chosen segment rather than the kit's md.
  .vc-tab-switch-group--seg {
    --vc-tab-switch-padding-x: 0.8125rem;
    --vc-tab-switch-group-pill-shadow: var(--category-plate-shadow);
    --vc-tab-switch-checked-shadow: var(--category-plate-shadow);

    @apply border-0;

    // In dark the pill carries the fill and its own rim; a shadow on the segment over it would lay a
    // second veil on the pill's edge.
    html.dark & {
      --vc-tab-switch-checked-shadow: none;
    }
  }

  &__filters-right {
    @apply ms-auto flex flex-wrap items-center gap-5;

    // Below 1240 the group takes a line of its own: the sort would otherwise eat the switches'
    // width and break their labels in the middle.
    @media (width < 1240px) {
      @apply ms-0 w-full justify-between;
    }

    @media (width < theme("screens.md")) {
      @apply contents;
    }
  }

  &__facets-button {
    @media (min-width: theme("screens.lg")) {
      @apply hidden;
    }
  }

  // On a phone the five tabs take a line of their own; the track scrolls when even that is short.
  &__sort {
    @media (width < theme("screens.md")) {
      @apply w-full min-w-0 flex-auto;
    }
  }

  &__view-mode {
    @media (width < theme("screens.md")) {
      @apply order-last;
    }
  }

  .active-filter-chips {
    @apply mb-4;
  }

  &__products-bottom {
    @apply my-8 text-center;
  }
}
</style>
