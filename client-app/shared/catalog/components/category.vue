<template>
  <VcContainer :class="{ 'polygon-gray-bg': !products.length && !loading }">
    <!-- Breadcrumbs -->
    <VcBreadcrumbs v-if="!hideBreadcrumbs" class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <div class="flex items-stretch lg:gap-6">
      <template v-if="!hideSidebar">
        <!-- Mobile sidebar back cover -->
        <VcPopupSidebar v-if="isMobile" :is-visible="mobileSidebarVisible" @hide="hideMobileSidebar()">
          <ProductsFiltersSidebar
            :keyword="keywordQueryParam"
            :filters="mobileFilters"
            :loading="loading || facetsLoading"
            @change="updateMobileFilters($event)"
            @open-branches="openBranchesModal(true)"
          />

          <template #footer>
            <VcButton
              variant="outline"
              :disabled="!isExistSelectedFacets && !isExistSelectedMobileFacets"
              @click="
                resetFacetFilters();
                hideMobileSidebar();
              "
            >
              {{ $t("common.buttons.reset") }}
            </VcButton>

            <VcButton
              :disabled="!isMobileFilterDirty"
              @click="
                applyFilters(mobileFilters);
                hideMobileSidebar();
              "
            >
              {{ $t("common.buttons.apply") }}
            </VcButton>
          </template>
        </VcPopupSidebar>

        <!-- Sidebar -->
        <div v-else class="relative flex w-60 shrink-0 items-start">
          <div ref="filtersElement" class="sticky w-60 space-y-5" :style="filtersStyle">
            <CategorySelector
              v-if="!isSearchPage"
              :category="currentCategory"
              :loading="!currentCategory && loadingCategory"
            />

            <ProductsFiltersSidebar
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
              v-if="!loading && !hideTotal"
              class="-top-1 ml-2 whitespace-nowrap text-sm font-normal normal-case text-neutral lg:top-[-0.5em] lg:text-base"
            >
              <b class="font-extrabold">{{ total }}</b>
              {{ $t("pages.catalog.products_found_message", total) }}
            </sup>
          </VcTypography>
        </div>

        <div ref="stickyMobileHeaderAnchor" class="-mt-px"></div>

        <div
          class="sticky top-0 z-10 my-1.5 flex h-14 items-center lg:relative lg:mb-3.5 lg:mt-3 lg:h-auto lg:flex-wrap lg:justify-end"
          :class="{
            'z-40 -mx-5 bg-additional-50 px-5 md:-mx-12 md:px-12': stickyMobileHeaderIsVisible,
          }"
        >
          <!-- Mobile filters toggler -->
          <VcButton class="mr-2.5 flex-none lg:!hidden" icon="filter" size="sm" @click="showMobileSidebar" />

          <!-- Sorting -->
          <div class="z-10 ml-auto flex grow items-center lg:order-4 lg:ml-4 lg:grow-0 xl:ml-8">
            <span
              v-t="'pages.catalog.sort_by_label'"
              class="mr-2 hidden shrink-0 text-sm font-bold text-neutral-900 lg:block"
            />

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
            v-if="!hideViewModeSelector"
            v-model:mode="savedViewMode"
            class="ml-3 inline-flex lg:order-1 lg:ml-0 lg:mr-auto"
          />

          <!-- Branch availability -->
          <div
            v-if="!isMobile"
            class="order-3 ml-4 flex items-center xl:ml-6"
            @click.prevent="openBranchesModal(false)"
            @keyup.enter.prevent="openBranchesModal(false)"
          >
            <VcTooltip :x-offset="28" placement="bottom-start" strategy="fixed">
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
                <div class="w-52 rounded-sm bg-additional-50 px-3.5 py-1.5 text-xs text-neutral-800 shadow-sm-x-y">
                  {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
                </div>
              </template>
            </VcTooltip>
          </div>

          <!-- In Stock -->
          <div v-if="!isMobile" class="order-2 ml-4 flex items-center xl:ml-8">
            <VcTooltip :x-offset="28" placement="bottom-start" strategy="fixed">
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
                <div class="w-52 rounded-sm bg-additional-50 px-3.5 py-1.5 text-xs text-neutral-800 shadow-sm-x-y">
                  {{ $t("pages.catalog.instock_filter_card.tooltip_text") }}
                </div>
              </template>
            </VcTooltip>
          </div>
        </div>

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
        <template v-if="products.length || loading">
          <DisplayProducts
            :loading="loading"
            :view-mode="savedViewMode"
            :items-per-page="itemsPerPage"
            :products="products"
            open-product-in-new-tab
            @item-link-click="sendGASelectItemEvent"
          >
            <template #cart-handler="{ item }">
              <AddToCart :product="item" :reserved-space="savedViewMode === 'grid'" />
            </template>
          </DisplayProducts>

          <VcInfinityScrollLoader
            v-if="!loading"
            :loading="loadingMore"
            distance="400"
            class="mt-8"
            @visible="loadMoreProducts"
          />

          <VcScrollTopButton />
        </template>

        <!-- Empty view -->
        <VcEmptyView
          v-else
          :text="
            isExistSelectedFacets || savedInStock || savedBranches.length || keywordQueryParam
              ? $t('pages.catalog.no_products_filtered_message')
              : $t('pages.catalog.no_products_message')
          "
          class="h-96"
        >
          <template #icon>
            <VcImage src="/static/images/common/stock.svg" :alt="$t('pages.catalog.products_icon')" />
          </template>

          <template #button>
            <VcButton
              v-if="isExistSelectedFacets || keywordQueryParam"
              prepend-icon="reset"
              @click="resetFacetFiltersWithKeyword"
            >
              {{ $t("pages.catalog.no_products_button") }}
            </VcButton>
          </template>
        </VcEmptyView>
      </div>
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import {
  computedEager,
  useBreakpoints,
  useElementBounding,
  useElementVisibility,
  useLocalStorage,
  watchDebounced,
  whenever,
} from "@vueuse/core";
import { cloneDeep, isEqual, throttle } from "lodash";
import { computed, onBeforeUnmount, onMounted, ref, shallowReactive, shallowRef, triggerRef, watch } from "vue";
import {
  useBreadcrumbs,
  useGoogleAnalytics,
  usePageHead,
  useRouteQueryParam,
  useThemeContext,
} from "@/core/composables";
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
import { AddToCart } from "@/shared/cart";
import { BranchesModal, FFC_LOCAL_STORAGE } from "@/shared/fulfillmentCenters";
import { useModal } from "@/shared/modal";
import { useCategory, useProducts } from "../composables";
import CategorySelector from "./category-selector.vue";
import DisplayProducts from "./display-products.vue";
import ProductsFiltersSidebar from "./products-filters.vue";
import ViewMode from "./view-mode.vue";
import type { Product } from "@/core/api/graphql/types";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import type { ProductsFilters, ProductsSearchParams } from "@/shared/catalog";
import type { StyleValue } from "vue";

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
  viewMode?: ViewModeType;
}

const { catalogId, currencyCode } = globals;

const { themeContext } = useThemeContext();
const { openModal } = useModal();
const breakpoints = useBreakpoints(BREAKPOINTS);
const ga = useGoogleAnalytics();
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
const { loading: loadingCategory, category: currentCategory, catalogBreadcrumb, fetchCategory } = useCategory();

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

const page = ref(1);
const itemsPerPage = ref(DEFAULT_PAGE_SIZE);

const mobileSidebarVisible = ref(false);
const mobileFilters = shallowReactive<ProductsFilters>({
  facets: [],
  inStock: savedInStock.value,
  branches: savedBranches.value,
});

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

let scrollOld = 0;
const maxOffsetTop = 108;
const maxOffsetBottom = 20;

const contentElement = ref<HTMLElement | null>(null);
const filtersElement = ref<HTMLElement | null>(null);
const filtersStyle = ref<StyleValue | undefined>();

const BOUNDING_OPTIONS = { windowResize: false, immediate: false };

const { top: cTop, height: cHeight } = useElementBounding(contentElement, BOUNDING_OPTIONS);
const { height: fHeight, top: fTop } = useElementBounding(filtersElement, BOUNDING_OPTIONS);

const seoTitle = computed(() => currentCategory.value?.seoInfo?.pageTitle || currentCategory.value?.name);
const seoDescription = computed(() => currentCategory.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => currentCategory.value?.seoInfo?.metaKeywords);
const seoImageUrl = computed(() => currentCategory.value?.images?.[0]?.url);

usePageHead({
  title: seoTitle,
  meta: {
    keywords: seoKeywords,
    description: seoDescription,
  },
});

useSeoMeta({
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImageUrl,
});

const breadcrumbs = useBreadcrumbs(() => {
  return [catalogBreadcrumb].concat(buildBreadcrumbs(currentCategory.value?.breadcrumbs) ?? []);
});

const searchParams = computedEager<ProductsSearchParams>(() => ({
  categoryId: props.categoryId,
  itemsPerPage: itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: props.isSearchPage ? searchQueryParam.value : keywordQueryParam.value,
  filter: [
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

const isExistSelectedMobileFacets = computedEager<boolean>(() =>
  mobileFilters.facets.some((facet) => facet.values.some((value) => value.selected)),
);

const isMobileFilterDirty = computedEager<boolean>(
  () =>
    JSON.stringify(mobileFilters) !==
    JSON.stringify({
      facets: facets.value,
      inStock: savedInStock.value,
      branches: savedBranches.value,
    } as ProductsFilters),
);

function sendGASelectItemEvent(product: Product) {
  ga.selectItem(product);
}

function showMobileSidebar() {
  mobileFilters.facets = cloneDeep(facets.value);
  mobileFilters.inStock = savedInStock.value;
  mobileFilters.branches = savedBranches.value.slice();
  mobileSidebarVisible.value = true;
}

function hideMobileSidebar() {
  mobileSidebarVisible.value = false;
}

function applyFilters(newFilters: ProductsFilters) {
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

async function updateMobileFilters(newFilters: ProductsFilters) {
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

function resetFacetFiltersWithKeyword() {
  keywordQueryParam.value = "";
  // FIXME: `setTimeout` is a hack to apply the value of `useRouteQueryParam` in parallel
  setTimeout(resetFacetFilters, 0);
}

async function loadProducts() {
  page.value = 1;

  await fetchProducts(searchParams.value);

  /**
   * Send Google Analytics event for products.
   */
  ga.viewItemList(products.value, {
    item_list_id: currentCategory.value?.slug,
    item_list_name: currentCategory.value?.name,
  });
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

  /**
   * Send Google Analytics event for products on next page.
   */
  ga.viewItemList(products.value, {
    item_list_id: `${currentCategory.value?.slug}_page_${nextPage}`,
    item_list_name: `${currentCategory.value?.name} (page ${nextPage})`,
  });
}

function openBranchesModal(fromMobileFilter: boolean) {
  openModal({
    component: BranchesModal,
    props: {
      selectedBranches: fromMobileFilter ? mobileFilters.branches : savedBranches.value,
      onSave(branches: string[]) {
        if (fromMobileFilter) {
          const newFilters: ProductsFilters = {
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

const setFiltersPosition = throttle(_setFiltersPosition, 100);

function _setFiltersPosition() {
  const { clientHeight, scrollTop } = document.documentElement || document.body.scrollTop;

  const scrollBottom = scrollTop + clientHeight;

  const contentHeight = cHeight.value;
  const contentTop = scrollTop + cTop.value;
  const contentBottom = contentTop + contentHeight;

  const filterHeight = fHeight.value;
  const filterTop = scrollTop + fTop.value;
  const filterBottom = filterTop + filterHeight;

  const down = scrollTop > scrollOld;
  const up = scrollTop < scrollOld;

  const zoomCorrection = window.devicePixelRatio === 1 ? 0 : 1;

  const offsetTop = maxOffsetTop - zoomCorrection;
  const offsetBottom = maxOffsetBottom - zoomCorrection;

  let action = "BETWEEN";

  if (
    (up && scrollTop <= filterTop - offsetTop) ||
    filterHeight <= clientHeight - offsetTop ||
    filterHeight >= contentHeight ||
    contentTop > filterTop
  ) {
    action = "TOP";
  } else if (
    (down && scrollBottom >= filterBottom + offsetBottom && scrollBottom <= contentBottom + offsetBottom) ||
    (scrollBottom >= contentBottom + offsetBottom && filterBottom < contentBottom) ||
    (!up && scrollBottom > filterBottom + offsetBottom && filterBottom < contentBottom) ||
    filterBottom > contentBottom
  ) {
    action = "BOTTOM";
  }

  switch (action) {
    case "BOTTOM":
      filtersStyle.value = {
        alignSelf: "flex-end",
        bottom: `${maxOffsetBottom}px`,
      };

      break;
    case "BETWEEN":
      filtersStyle.value = {
        marginTop: `${filterTop - contentTop}px`,
      };
      break;
    default:
      filtersStyle.value = {
        top: `${maxOffsetTop}px`,
      };
  }

  scrollOld = scrollTop;
}

onMounted(() => {
  window.addEventListener("scroll", setFiltersPosition);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", setFiltersPosition);
});

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

watch(
  () => fHeight.value,
  (value, oldValue) => {
    if (value !== oldValue) {
      setFiltersPosition();
    }
  },
);

watch(
  () => cHeight.value,
  (value, oldValue) => {
    if (value !== oldValue) {
      setFiltersPosition();
    }
  },
);

watch(props, ({ viewMode }) => {
  if (viewMode && viewModes.includes(viewMode)) {
    savedViewMode.value = viewMode;
  }
});

const hideViewModeSelector = computed(() => {
  return props.viewMode && viewModes.includes(props.viewMode);
});

watchDebounced(
  computed(() => JSON.stringify(searchParams.value)),
  loadProducts,
  {
    immediate: true,
    flush: "post",
    debounce: 20,
  },
);
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
