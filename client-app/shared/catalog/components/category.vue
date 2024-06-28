<template>
  <VcContainer :class="{ 'polygon-gray-bg': !products.length && !loading }">
    <!-- Breadcrumbs -->
    <VcBreadcrumbs v-if="!hideBreadcrumbs" class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <div class="flex items-stretch lg:gap-6">
      <template v-if="!hideSidebar">
        <FiltersPopupSidebar
          v-if="isMobile || areHorizontalFilters"
          :is-exist-selected-facets="isExistSelectedFacets"
          :is-mobile-filter-dirty="isMobileFilterDirty"
          :mobile-filters="mobileFilters"
          :are-horizontal-filters="areHorizontalFilters"
          :facets-loading="facetsLoading"
          :is-mobile="isMobile"
          :is-visible="mobileSidebarVisible"
          :keyword-query-param="keywordQueryParam"
          :sort-query-param="sortQueryParam"
          :loading="loading"
          @hide-mobile-sidebar="hideMobileSidebar"
          @reset-facet-filters="resetFacetFilters"
          @open-branches-modal="openBranchesModal"
          @update-mobile-filters="updateMobileFilters"
          @apply-filters="applyFilters"
        />

        <!-- Sidebar -->
        <div v-else class="relative flex w-60 shrink-0 items-start">
          <div ref="filtersElement" class="sticky w-60 space-y-5" :style="filtersStyle">
            <CategorySelector
              v-if="!isSearchPage"
              :category="currentCategory"
              :loading="!currentCategory && loadingCategory"
            />

            <ProductsFilters
              :keyword="keywordQueryParam"
              :filters="{ facets, inStock: savedInStock, branches: savedBranches }"
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
            <span v-else-if="!currentCategory && loadingCategory" class="inline-block w-48 bg-gray-200 md:w-64">
              &nbsp;
            </span>

            <span v-else-if="title">
              {{ title }}
            </span>

            <span v-else>
              {{ currentCategory?.name }}
            </span>

            <sup
              v-if="!loading && !hideTotal && !Number(fixedProductsCount)"
              class="-top-1 ml-2 whitespace-nowrap text-sm font-normal normal-case text-neutral lg:top-[-0.5em] lg:text-base"
            >
              <b class="font-extrabold">{{ total }}</b>
              {{ $t("pages.catalog.products_found_message", total) }}
            </sup>
          </VcTypography>
          <!-- View options top facets view -->
          <ViewMode
            v-if="!hideViewModeSelector && areHorizontalFilters"
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
          <!-- Mobile filters toggler -->
          <VcButton
            v-if="!hideSidebar"
            class="mr-2.5 flex-none lg:!hidden"
            icon="filter"
            size="sm"
            @click="showMobileSidebar"
          />

          <!-- Sorting -->
          <div
            v-if="!hideSorting && !areHorizontalFilters"
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
            v-if="!hideViewModeSelector && !areHorizontalFilters"
            v-model:mode="savedViewMode"
            class="ml-3 inline-flex lg:order-1 lg:ml-0 lg:mr-auto"
          />

          <template v-if="!hideControls">
            <!-- Branch availability -->
            <div
              v-if="!isMobile && !areHorizontalFilters"
              role="button"
              tabindex="0"
              class="order-3 ml-4 flex items-center xl:ml-6"
              @click.prevent="openBranchesModal(false)"
              @keyup.enter.prevent="openBranchesModal(false)"
            >
              <VcTooltip placement="bottom-start" width="13rem">
                <template #trigger>
                  <VcCheckbox :model-value="!!savedBranches.length" :disabled="loading">
                    <i18n-t
                      keypath="pages.catalog.branch_availability_filter_card.available_in"
                      tag="div"
                      class="text-sm"
                      :class="{
                        'text-neutral': !savedBranches.length,
                      }"
                      scope="global"
                    >
                      <span :class="{ 'font-bold text-[--link-color]': savedBranches.length }">
                        {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: savedBranches.length }) }}
                      </span>
                    </i18n-t>
                  </VcCheckbox>
                </template>

                <template #content>
                  {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
                </template>
              </VcTooltip>
            </div>

            <!-- In Stock -->
            <div v-if="!isMobile && !areHorizontalFilters" class="order-2 ml-4 flex items-center xl:ml-8">
              <VcTooltip placement="bottom-start" width="12rem">
                <template #trigger>
                  <VcCheckbox v-model="savedInStock" :disabled="loading">
                    <span
                      class="whitespace-nowrap text-sm"
                      :class="{
                        'text-neutral': !savedInStock,
                      }"
                    >
                      {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
                    </span>
                  </VcCheckbox>
                </template>

                <template #content>
                  {{ $t("pages.catalog.instock_filter_card.tooltip_text") }}
                </template>
              </VcTooltip>
            </div>
          </template>
        </div>

        <!-- Horizontal Filters -->
        <ProductsFilters
          v-if="areHorizontalFilters && !isMobile"
          class="mb-4.5"
          :orientation="filtersOrientation"
          :keyword="keywordQueryParam"
          :filters="{ facets, inStock: savedInStock, branches: savedBranches }"
          :loading="loading"
          @change="applyFilters($event)"
        >
          <template #prepend>
            <VcButton prepend-icon="filter" size="sm" variant="outline" class="shrink-0" @click="showMobileSidebar">{{
              $t("common.buttons.all_filters")
            }}</VcButton>
            <VcDropdownMenu :offset-options="4" class="z-10" max-height="20rem">
              <template #trigger="">
                <VcButton prepend-icon="switch-vertical" size="sm" variant="outline" class="shrink-0">{{
                  $t("common.buttons.sort_by")
                }}</VcButton>
              </template>
              <template #content>
                <div class="py-2">
                  <VcMenuItem
                    v-for="sortingOption in PRODUCT_SORTING_LIST"
                    :key="sortingOption.id"
                    class="border-none"
                    color="secondary"
                  >
                    <VcRadioButton
                      v-model="sortQueryParam"
                      size="sm"
                      :value="sortingOption.id"
                      :label="sortingOption.name"
                      class="pl-1 pr-5"
                    />
                  </VcMenuItem>
                </div>
              </template>
            </VcDropdownMenu>
          </template>
        </ProductsFilters>

        <!-- Filters chips -->
        <div v-if="isExistSelectedFacets" class="flex flex-wrap gap-x-3 gap-y-2 pb-6">
          <template v-for="facet in facets">
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
          :is-exist-selected-facets="isExistSelectedFacets"
          :has-active-filters="isExistSelectedFacets || savedInStock || !!savedBranches.length"
          :fixed-products-count="fixedProductsCount"
          :saved-view-mode="savedViewMode"
          :items-per-page="itemsPerPage"
          :card-type="cardType"
          :columns-amount-desktop="columnsAmountDesktop"
          :columns-amount-tablet="columnsAmountTablet"
          :search-params="searchParams"
          @reset-facet-filters="resetFacetFilters"
        />
      </div>
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
import { computedEager, useBreakpoints, useElementVisibility, useLocalStorage, whenever } from "@vueuse/core";
import { cloneDeep, isEqual } from "lodash";
import { computed, ref, shallowReactive, shallowRef, triggerRef, watch } from "vue";
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
import { useSeo } from "@/shared/catalog/composables/useSeo";
import { useStickyFilters } from "@/shared/catalog/composables/useStickyFilters";
import { FFC_LOCAL_STORAGE } from "@/shared/fulfillmentCenters";
import { useModal } from "@/shared/modal";
import { useCategory, useProducts } from "../composables";
import CategorySelector from "./category-selector.vue";
import ProductsFilters from "./products-filters.vue";
import ViewMode from "./view-mode.vue";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import type { ProductsFilters as ProductsFiltersType, ProductsSearchParams } from "@/shared/catalog";
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
  fixedProductsCount?: string;
}

const { catalogId, currencyCode } = globals;

const { themeContext } = useThemeContext();
const { openModal } = useModal();
const breakpoints = useBreakpoints(BREAKPOINTS);
const { getFacets, loading, facetsLoading, products, total, facets } = useProducts({
  withFacets: true,
});
const { loading: loadingCategory, category: currentCategory, catalogBreadcrumb, fetchCategory } = useCategory();
useSeo();

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

const isMobile = breakpoints.smaller("lg");

const itemsPerPage = ref(DEFAULT_PAGE_SIZE);

const mobileSidebarVisible = ref(false);
const mobileFilters = shallowReactive<ProductsFiltersType>({
  facets: [],
  inStock: savedInStock.value,
  branches: savedBranches.value,
});

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

const areHorizontalFilters = computed(() => !isMobile.value && props.filtersOrientation === "horizontal");

const contentElement = ref<HTMLElement | null>(null);
const filtersElement = ref<HTMLElement | null>(null);
const { setFiltersPosition, filtersStyle } = useStickyFilters({ areHorizontalFilters, contentElement, filtersElement });

const breadcrumbs = useBreadcrumbs(() => {
  return [catalogBreadcrumb].concat(buildBreadcrumbs(currentCategory.value?.breadcrumbs) ?? []);
});

const searchParams = computedEager<ProductsSearchParams>(() => ({
  categoryId: props.categoryId,
  itemsPerPage: Number(props.fixedProductsCount) || itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: props.keyword || (props.isSearchPage ? searchQueryParam.value : keywordQueryParam.value),
  filter:
    props.filter ||
    [
      facetsQueryParam.value,
      getFilterExpressionForInStock(savedInStock),
      getFilterExpressionForAvailableIn(savedBranches),
    ]
      .filter(Boolean)
      .join(" "),
}));

const isExistSelectedFacets = computedEager<boolean>(() =>
  facets.value.some((facet) => facet.values.some((value) => value.selected)),
);

const isMobileFilterDirty = computedEager<boolean>(
  () =>
    JSON.stringify(mobileFilters) !==
    JSON.stringify({
      facets: facets.value,
      inStock: savedInStock.value,
      branches: savedBranches.value,
    } as ProductsFiltersType),
);

function showMobileSidebar() {
  mobileFilters.facets = cloneDeep(facets.value);
  mobileFilters.inStock = savedInStock.value;
  mobileFilters.branches = savedBranches.value.slice();
  mobileSidebarVisible.value = true;
}

function hideMobileSidebar() {
  mobileSidebarVisible.value = false;
}

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

async function updateMobileFilters(newFilters: ProductsFiltersType) {
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

  mobileFilters.inStock = newFilters.inStock;
  mobileFilters.branches = newFilters.branches;
  mobileFilters.facets = await getFacets(searchParamsForFacets);
}

function removeFacetFilterItem(payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">) {
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

function openBranchesModal(fromMobileFilter: boolean) {
  openModal({
    component: BranchesModal,
    props: {
      selectedBranches: fromMobileFilter ? mobileFilters.branches : savedBranches.value,
      onSave(branches: string[]) {
        if (fromMobileFilter) {
          const newFilters: ProductsFiltersType = {
            branches,
            facets: mobileFilters.facets,
            inStock: mobileFilters.inStock,
          };

          void updateMobileFilters(newFilters);
        } else {
          savedBranches.value = branches;
        }
      },
    },
  });
}

whenever(() => !isMobile.value, hideMobileSidebar);

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

const hideViewModeSelector = computed(() => {
  return props.viewMode && viewModes.includes(props.viewMode);
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}

:global(.vc-popup-sidebar.desktop-popup-sidebar) {
  --close-button-color: var(--color_neutral_600);
}
</style>
