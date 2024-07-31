<template>
  <VcContainer ref="categoryComponentAnchor" :class="{ 'polygon-neutral-bg': !products.length && !loading }">
    <!-- Breadcrumbs -->
    <VcBreadcrumbs v-if="!hideBreadcrumbs" class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <div class="flex items-stretch lg:gap-6">
      <template v-if="!hideSidebar">
        <!-- Popup sidebar for mobile and horizontal desktop view -->
        <FiltersPopupSidebar
          v-if="isMobile || isHorizontalFilters"
          :is-exist-selected-facets="hasSelectedFilters"
          :is-popup-sidebar-filter-dirty="isFiltersDirty"
          :popup-sidebar-filters="productsFilters"
          :is-horizontal-filters="isHorizontalFilters"
          :facets-loading="facetsLoading"
          :is-mobile="isMobile"
          :is-visible="isFiltersSidebarVisible"
          :keyword-query-param="keywordQueryParam"
          :sort-query-param="sortQueryParam"
          :loading="loading"
          :hide-sorting="hideSorting"
          :hide-controls="hideControls"
          @hide-popup-sidebar="hideFiltersSidebar"
          @reset-facet-filters="resetFacetFilters"
          @open-branches-modal="openBranchesModal"
          @update-popup-sidebar-filters="updatePopupSidebarFilters"
          @apply-filters="applyFilters"
        />

        <!-- Regular desktop sidebar (vertical view) -->
        <div v-else class="relative flex w-60 shrink-0 items-start">
          <div ref="filtersElement" class="sticky w-60 space-y-5" :style="filtersStyle">
            <CategorySelector
              v-if="!isSearchPage"
              :category="currentCategory"
              :loading="!currentCategory && loadingCategory"
            />

            <ProductsFilters
              :keyword="keywordQueryParam"
              :filters="{ facets: productsFilters.facets, inStock: savedInStock, branches: savedBranches }"
              :loading="loading"
              @change="applyFilters($event)"
            />
          </div>
        </div>
      </template>

      <!-- Content -->
      <div ref="contentElement" class="grow">
        <div class="flex">
          <VcTypography tag="h1">
            <i18n-t v-if="isSearchPage" keypath="pages.search.header" tag="span">
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
              v-if="!loading && !hideTotal && !fixedProductsCount"
              class="-top-1 ml-2 whitespace-nowrap text-sm font-normal normal-case text-neutral lg:top-[-0.5em] lg:text-base"
            >
              <b class="font-black">{{ total }}</b>
              {{ $t("pages.catalog.products_found_message", total) }}
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
            class="mr-2.5 flex-none lg:!hidden"
            icon="filter"
            size="sm"
            @click="showFiltersSidebar"
          />

          <!-- Sorting -->
          <div
            v-if="!hideSorting && !isHorizontalFilters"
            class="z-10 ml-auto flex grow items-center lg:order-4 lg:ml-4 lg:grow-0 xl:ml-8"
          >
            <span class="mr-2 hidden shrink-0 text-sm font-bold text-neutral-900 lg:block">
              {{ $t("pages.catalog.sort_by_label") }}
            </span>

            <VcSelect
              v-model="sortQueryParam"
              text-field="name"
              value-field="id"
              :disabled="loading"
              :items="PRODUCT_SORTING_LIST"
              class="w-0 grow lg:w-48"
              size="sm"
            />
          </div>

          <!-- View options -->
          <ViewMode
            v-if="!hideViewModeSelector && !isHorizontalFilters"
            v-model:mode="savedViewMode"
            class="ml-3 inline-flex lg:order-1 lg:ml-0 lg:mr-auto"
          />

          <!-- In stock and branches -->
          <CategoryControls
            v-if="!hideControls && !isMobile && !isHorizontalFilters"
            v-model="savedInStock"
            :loading="loading"
            :saved-branches="savedBranches"
            @open-branches-modal="openBranchesModal"
          />
        </div>

        <!-- Horizontal filters -->
        <CategoryHorizontalFilters
          v-if="isHorizontalFilters && !isMobile"
          :facets-loading="facetsLoading"
          :keyword-query-param="keywordQueryParam"
          :sort-query-param="sortQueryParam"
          :loading="loading || facetsLoading"
          :filters="{ facets: productsFilters.facets, inStock: savedInStock, branches: savedBranches }"
          :hide-sorting="hideSorting"
          :hide-all-filters="hideSidebar"
          @reset-facet-filters="resetFacetFilters"
          @apply-filters="applyFilters"
          @show-popup-sidebar="showFiltersSidebar"
        />

        <!-- Filters chips -->
        <div v-if="!facetsLoading && hasSelectedFilters" class="flex flex-wrap gap-x-3 gap-y-2 pb-6">
          <template v-for="facet in productsFilters.facets">
            <template v-for="filterItem in facet.values">
              <VcChip
                v-if="filterItem.selected"
                :key="facet.paramName + filterItem.value"
                color="secondary"
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

          <VcChip color="secondary" variant="outline" clickable @click="resetFacetFilters">
            <span>{{ $t("common.buttons.reset_filters") }}</span>

            <VcIcon name="reset" />
          </VcChip>
        </div>

        <!-- Products -->
        <CategoryProducts
          :is-exist-selected-facets="hasSelectedFilters"
          :has-active-filters="hasSelectedFilters || savedInStock || !!savedBranches.length"
          :fixed-products-count="fixedProductsCount"
          :saved-view-mode="savedViewMode"
          :items-per-page="itemsPerPage"
          :card-type="cardType"
          :columns-amount-desktop="columnsAmountDesktop"
          :columns-amount-tablet="columnsAmountTablet"
          :search-params="searchParams"
          @reset-facet-filters="resetFacetFilters"
        />
        <div class="text-center">
          <VcButton v-if="showButtonToDefaultView" class="my-8" color="primary" :to="{ query: { view: 'default' } }">
            {{ $t("pages.catalog.show_all_results") }}
          </VcButton>
        </div>
      </div>
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
import { computedEager, useBreakpoints, useElementVisibility, useLocalStorage, whenever } from "@vueuse/core";
import { isEqual } from "lodash";
import { computed, ref, shallowRef, toRefs, triggerRef, watch } from "vue";
import { useBreadcrumbs, useRouteQueryParam, useThemeContext } from "@/core/composables";
import { BREAKPOINTS, DEFAULT_PAGE_SIZE, PRODUCT_SORTING_LIST } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import {
  buildBreadcrumbs,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForInStock,
  getFilterExpressionForZeroPrice,
  getFilterExpressionFromFacets,
} from "@/core/utilities";
import { useCategorySeo } from "@/shared/catalog/composables/useCategorySeo";
import { useStickyFilters } from "@/shared/catalog/composables/useStickyFilters";
import { FFC_LOCAL_STORAGE } from "@/shared/fulfillmentCenters";
import { useModal } from "@/shared/modal";
import { useCategory, useProducts, useProductsFiltersSidebar } from "../composables";
import CategorySelector from "./category-selector.vue";
import ProductsFilters from "./products-filters.vue";
import ViewMode from "./view-mode.vue";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import type {
  FiltersDisplayOrderType,
  ProductsFilters as ProductsFiltersType,
  ProductsSearchParams,
} from "@/shared/catalog";
import CategoryControls from "@/shared/catalog/components/category/category-controls.vue";
import CategoryHorizontalFilters from "@/shared/catalog/components/category/category-horizontal-filters.vue";
import CategoryProducts from "@/shared/catalog/components/category/category-products.vue";
import FiltersPopupSidebar from "@/shared/catalog/components/category/filters-popup-sidebar.vue";
import BranchesModal from "@/shared/fulfillmentCenters/components/branches-modal.vue";

const props = defineProps<IProps>();
const viewModes = ["grid", "list"] as const;
type ViewModeType = (typeof viewModes)[number];

interface IProps {
  categoryId?: string;
  isSearchPage?: boolean;
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

const { catalogId, currencyCode } = globals;

const breakpoints = useBreakpoints(BREAKPOINTS);

const isMobile = breakpoints.smaller("lg");

const { themeContext } = useThemeContext();
const { openModal } = useModal();
const { getFacets, loading, facetsLoading, products, total, facets } = useProducts({
  withFacets: true,
});
const { loading: loadingCategory, category: currentCategory, catalogBreadcrumb, fetchCategory } = useCategory();
const {
  hasSelectedFilters,
  isFiltersDirty,
  isFiltersSidebarVisible,
  productsFilters,
  hideFiltersSidebar,
  initializeFiltersSidebar,
  removeFacetFilter,
  resetFacetsFilters,
  showFiltersSidebar,
  updateProductsFilters,
} = useProductsFiltersSidebar(isMobile);

const savedViewMode = useLocalStorage<ViewModeType>("viewMode", "grid");
const savedInStock = useLocalStorage<boolean>("viewInStockProducts", true);
const savedBranches = useLocalStorage<string[]>(FFC_LOCAL_STORAGE, []);

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: PRODUCT_SORTING_LIST[0].id,
  validator: (value) => PRODUCT_SORTING_LIST.some((item) => item.id === value),
});

const searchQueryParam = useRouteQueryParam<string>(QueryParamName.SearchPhrase, {
  defaultValue: "",
});

const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
  defaultValue: "",
});

const facetsQueryParam = useRouteQueryParam<string>(QueryParamName.Facets, {
  defaultValue: "",
});

const itemsPerPage = ref(DEFAULT_PAGE_SIZE);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

const isHorizontalFilters = computed(() => !isMobile.value && props.filtersOrientation === "horizontal");

const contentElement = ref<HTMLElement | null>(null);
const filtersElement = ref<HTMLElement | null>(null);
const { setFiltersPosition, filtersStyle } = useStickyFilters({ isHorizontalFilters, contentElement, filtersElement });

const categoryComponentAnchor = shallowRef<HTMLElement | null>(null);
const categoryComponentAnchorIsVisible = useElementVisibility(categoryComponentAnchor);
const { allowSetMeta } = toRefs(props);
useCategorySeo({ allowSetMeta, categoryComponentAnchorIsVisible });

const breadcrumbs = useBreadcrumbs(() => {
  return [catalogBreadcrumb].concat(buildBreadcrumbs(currentCategory.value?.breadcrumbs) ?? []);
});

const searchParams = computedEager<ProductsSearchParams>(() => ({
  categoryId: props.categoryId,
  itemsPerPage: props.fixedProductsCount || itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: props.keyword || (props.isSearchPage ? searchQueryParam.value : keywordQueryParam.value),
  filter: [
    props.filter,
    facetsQueryParam.value,
    getFilterExpressionForInStock(savedInStock),
    getFilterExpressionForAvailableIn(savedBranches),
  ]
    .filter(Boolean)
    .join(" "),
}));

function applyFilters(newFilters: ProductsFiltersType) {
  const facetsFilterExpression: string = getFilterExpressionFromFacets(newFilters.facets);

  if (facetsQueryParam.value !== facetsFilterExpression) {
    facetsQueryParam.value = facetsFilterExpression;
  }

  if (savedInStock.value !== newFilters.inStock) {
    savedInStock.value = newFilters.inStock;
  }

  if (!isEqual(savedBranches.value, newFilters.branches)) {
    savedBranches.value = newFilters.branches;
  }

  setFiltersPosition();
}

async function updatePopupSidebarFilters(newFilters: ProductsFiltersType) {
  const searchParamsForFacets: ProductsSearchParams = {
    ...searchParams.value,
    filter: [
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

function removeFacetFilterItem(payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">) {
  const isSuccess = removeFacetFilter(payload);
  if (isSuccess) {
    facetsQueryParam.value = getFilterExpressionFromFacets(facets);

    // Instant update of the filter chips
    triggerRef(facets);
  }
}

function resetFacetFilters() {
  facetsQueryParam.value = "";

  resetFacetsFilters();

  // Instant update of the filter chips
  triggerRef(facets);
}

function openBranchesModal(fromPopupSidebarFilter: boolean) {
  openModal({
    component: BranchesModal,
    props: {
      selectedBranches: fromPopupSidebarFilter ? productsFilters.value.branches : savedBranches.value,
      onSave(branches: string[]) {
        if (fromPopupSidebarFilter) {
          const newFilters: ProductsFiltersType = {
            branches,
            facets: productsFilters.value.facets,
            inStock: productsFilters.value.inStock,
          };

          void updatePopupSidebarFilters(newFilters);
        } else {
          savedBranches.value = branches;
        }
      },
    },
  });
}

whenever(() => !isMobile.value, hideFiltersSidebar);

watch(
  () => props.categoryId,
  (categoryId) => {
    if (!props.isSearchPage) {
      const { catalog_empty_categories_enabled, zero_price_product_enabled } = themeContext.value.settings;

      const productFilter = catalog_empty_categories_enabled
        ? undefined
        : [
            getFilterExpressionForCategorySubtree({ catalogId, categoryId }),
            getFilterExpressionForZeroPrice(!!zero_price_product_enabled, currencyCode),
            getFilterExpressionForInStock(true),
          ]
            .filter(Boolean)
            .join(" ");

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

watch(facets, (newFacets) => {
  if (newFacets) {
    initializeFiltersSidebar({
      branches: savedBranches.value,
      inStock: savedInStock.value,
      facets: newFacets,
      filtersDisplayOrder: props.filtersDisplayOrder,
    });
  }
});

const hideViewModeSelector = computed(() => {
  return props.viewMode && viewModes.includes(props.viewMode);
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
