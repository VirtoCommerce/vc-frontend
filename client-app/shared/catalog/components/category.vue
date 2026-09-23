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

          <!-- The way out of a narrowed listing sits at the foot of the rail that narrowed it. It only
               appears once something is picked: a reset with nothing to reset is a dead control. -->
          <VcButton
            v-if="hasSelectedFilters || activeControls.length"
            class="category__clear-all"
            variant="soft"
            color="neutral"
            full-width
            @click="resetFacetAndControlsFilters"
          >
            {{ $t("common.buttons.reset_filters") }}
          </VcButton>
        </template>

        <!-- The page is laid out as plates on the canvas: the heading is one plate, the category's
             picture a second beside it, and the listing a third below. -->
        <div class="category__head">
          <div class="category__head-plate">
            <span v-if="headEyebrow" class="category__eyebrow">{{ headEyebrow }}</span>

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
            </VcTypography>
          </div>

          <div v-if="headImage" class="category__head-art">
            <img :src="headImage" alt="" class="category__head-image" />
          </div>
        </div>

        <div class="category__body">
          <div ref="stickyMobileHeaderAnchor" class="category__header-anchor"></div>

          <template v-if="!hideAllControls">
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

              <!-- View options - horizontal view -->
              <ViewMode
                v-if="!hideViewModeSelector"
                v-model:mode="savedViewMode"
                class="category__view-mode"
                data-test-id="view-switcher"
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

                  <VcIcon name="reset" />
                </VcChip>

                <VcChip v-if="isResetPageButtonShown" color="secondary" variant="outline" clickable @click="resetPage">
                  <span>{{ $t("common.buttons.reset_page") }}</span>

                  <VcIcon name="reset" />
                </VcChip>
              </template>
            </ActiveFilterChips>
          </template>

          <div ref="categoryProductsAnchor" class="category__products-anchor"></div>

          <CategoryProducts
            :card-type="cardType"
            :sort-token="sortToken"
            :columns-amount-desktop="columnsAmountDesktop"
            :columns-amount-tablet="columnsAmountTablet"
            :fetching-more-products="fetchingMoreProducts"
            :fetching-products="fetchingProducts"
            :fixed-products-count="fixedProductsCount"
            :has-active-filters="
              hasSelectedFilters || localStorageInStock || localStoragePurchasedBefore || !!localStorageBranches.length
            "
            :items-per-page="itemsPerPage"
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

          <div class="category__products-bottom">
            <VcButton v-if="showButtonToDefaultView" color="primary" :to="{ query: { view: 'default' } }">
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
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, shallowRef, toRef, toRefs, watch } from "vue";
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

const itemsPerPage = ref(DEFAULT_PAGE_SIZE);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

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
  return !props.hideSidebar && !isMobile.value && !isHorizontalFilters.value && !emptyViewSearchOnly.value;
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

/** The parent section, named over the title so the reader knows where in the catalog they stand. */
const headEyebrow = computed(() => (props.isRoot ? undefined : currentCategory.value?.parent?.name));

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

whenever(() => !isMobile.value, hideFiltersSidebar);
const { addScopeItem, removeScopeItemByType, setQueryScope, preparingScope } = useSearchScore();

const { clearSearchResults } = useSearchBar();

const isMobileLg = breakpoints.smaller("lg");

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

  if (!isMobileLg.value) {
    clearSearchResults();
  }
}

onMounted(() => {
  document.body.style.overflowAnchor = "none";
});
</script>

<style lang="scss">
// The facet stack as the design draws it, on the desktop rail and in the phone's filter drawer
// alike — the drawer is teleported out of the page, so it cannot inherit these from the rail.
@mixin facet-rail {
  // The design's "nested widget" (Ilya, 22.09.2026): a widget lying inside another's plate draws
  // no plate of its own and keeps no side inset, so heading and rows stand on the plate's edge.
  // What it keeps is the kit's own vertical rhythm — a 38px heading with a 24px fold chevron, and
  // 16px above and 20px below the body.
  .vc-widget {
    // No rule between a heading and its body — the kit divides its own children with one.
    --vc-widget-divide-color: transparent;

    @apply rounded-none border-0 bg-transparent p-0 shadow-none;
  }

  .vc-widget__header {
    @apply px-0;
  }

  .vc-widget__slot-container {
    @apply border-0;
  }

  .vc-widget__slot {
    @apply px-0 pb-5 pt-4;
  }

  .vc-widget__append-icon {
    --vc-icon-size: 1.5rem;
  }

  // Sections are parted by a hairline. Each facet sits in a wrapper of its own, so the rule goes on
  // the wrappers — a "next widget" selector never finds a widget beside another.
  .category__selector + .category__product-filters,
  .products-filters__container > * + * {
    @apply border-t border-neutral-200;
  }

  .category__selector {
    @apply mb-0;
  }

  // Facet rows are the same size-sm row as the category list: 10px above and below a 14px name, the
  // plate bleeding 12px past the text so the name stays on the heading's vertical. The kit paints
  // each row paper white, which on the warm plate read as a white block behind the list.
  .vc-menu-item__inner {
    @apply -mx-3 w-[calc(100%+1.5rem)] bg-transparent px-3;

    &:hover {
      @apply bg-neutral-100;
    }
  }

  // The list scrolls, so the bleed has to fit inside its box or it opens a horizontal scrollbar.
  .facet-filter-widget__container {
    @apply -mx-3 px-3;
  }

  // The fade over a cut-off list has to end in the plate's colour, not white, or it draws a pale band.
  .facet-filter-widget__fade::after {
    --tw-gradient-from: var(--category-plate-bg, theme("colors.additional.50")) var(--tw-gradient-from-position);
    --tw-gradient-to: transparent var(--tw-gradient-to-position);
  }
}

.filters-popup-sidebar {
  @include facet-rail;
}

.category {
  // The page is plates on the canvas, on the same numbers as the header and footer plates PR #2494
  // built: one radius, one inside, one shadow, and one step between every plate. The fallbacks are
  // those values, so a theme without the paprika tokens still gets round plates.
  --category-plate-radius: var(--plate-radius, 1.75rem);
  --category-plate-pad-y: var(--plate-pad-y, 2.25rem);
  --category-plate-pad-x: var(--plate-pad-x, 2rem);
  --category-plate-gap: var(--page-stack, 1.625rem);

  // The plate surface is the design's warm off-white (#fffdfa), not paper white — the same step the
  // footer's top plate already paints with, so every plate on the page is one colour and they flip
  // to dark together.
  --category-plate-bg: var(--footer-top-bg-color, #fffdf9);

  %plate {
    padding: var(--category-plate-pad-y) var(--category-plate-pad-x);
    border-radius: var(--category-plate-radius);
    background: var(--category-plate-bg);
    box-shadow: var(--plate-shadow, theme("boxShadow.md"));
  }

  .vc-layout__container {
    @media (min-width: theme("screens.md")) {
      gap: var(--category-plate-gap);
    }
  }

  // The rail is 280 wide with 28 of inside all round, as the design measures it — 224 of content.
  // Two classes deep on purpose: the layout sets this width through its own position modifier, and
  // an equal-weight rule here loses to it on load order.
  .vc-layout .vc-layout__sidebar-container {
    @media (min-width: theme("screens.xl")) {
      width: 17.5rem;
    }
  }

  .vc-layout__sidebar {
    @extend %plate;

    // The layout gives the sticky sidebar a width of its own as well as its container's; it follows
    // the container so the two cannot disagree.
    @apply w-full;

    padding: 1.75rem;

    @include facet-rail;

    .category__clear-all {
      @apply mt-7 h-[2.8125rem] rounded-full text-base font-semibold text-neutral-950;
    }
  }

  &__head {
    @apply flex items-stretch;

    gap: var(--category-plate-gap);
    margin-bottom: var(--category-plate-gap);
  }

  // One height whether or not there is a parent to name over the title — the height of a plate that
  // has both lines — and the content centred in it, so a title on its own sits in the middle rather
  // than under an empty line. Written from the plate's own inside so it steps with it below lg.
  &__head-plate {
    @extend %plate;
    @apply flex min-w-0 grow flex-col justify-center gap-2;

    min-height: calc(var(--category-plate-pad-y) * 2 + 4.1875rem);
  }

  &__eyebrow {
    @apply text-xs font-bold uppercase tracking-[0.14em] text-primary-500;
  }

  // The picture is a third of the row and fills its plate edge to edge; the heading keeps the rest.
  // The heading sets the row's height and the picture fills whatever that is — an image left to its
  // own size stretched the whole row to its height. Category art is cut out on transparency and
  // cropped to the object, so it is contained and anchored to the far corner, where the design lets
  // the object run to the plate's edge, rather than covered and clipped.
  &__head-art {
    @apply relative hidden shrink-0 overflow-hidden;

    width: 32%;
    border-radius: var(--category-plate-radius);
    background: var(--category-plate-bg);
    box-shadow: var(--plate-shadow, theme("boxShadow.md"));

    @media (min-width: theme("screens.lg")) {
      @apply block;
    }
  }

  &__head-image {
    @apply absolute inset-0 size-full object-contain object-right-bottom;
  }

  &__body {
    @extend %plate;
  }

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
    @apply flex flex-wrap items-center gap-3 my-3 empty:h-2;

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
    // No layout of its own: the rail is one control, and a gap set here would reopen the seam the
    // seg track closes between its seats. On a phone it takes a row to itself under the filter and
    // layout buttons — squeezed between them it had room for one and a half tabs.
    @media (width < theme("screens.md")) {
      @apply order-last w-full min-w-0;
    }

    @media (min-width: theme("screens.lg")) {
      @apply order-last;
    }
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
