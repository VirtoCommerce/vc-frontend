<template>
  <div
    class="bg-gray-100 pt-4 pb-16 shadow-inner grow lg:pt-6"
    :class="{ 'polygon-gray-bg': !products.length && !loading }"
  >
    <div class="px-5 mx-auto max-w-screen-2xl 2xl:px-18">
      <!-- Breadcrumbs -->
      <VcBreadcrumbs v-if="!isSearchPage" class="mb-2.5 md:mb-4" :items="breadcrumbs" />

      <div class="flex items-start lg:gap-6">
        <!-- Mobile sidebar back cover -->
        <VcPopupSidebar
          v-if="isMobile"
          :is-visible="mobileSidebarVisible"
          class="flex flex-col w-70 px-5 pt-5"
          @hide="hideMobileSidebar()"
        >
          <div class="relative mt-0.5 mb-6 pr-6">
            <div class="font-semibold text-26 pt-1 break-words">
              {{ $t("common.buttons.filters") }}
            </div>

            <button type="button" class="absolute top-2.5 right-1" @click="hideMobileSidebar()">
              <svg class="w-5 h-5 text-[color:var(--color-primary)]">
                <use href="/static/images/delete.svg#main" />
              </svg>
            </button>
          </div>

          <ProductsFiltersSidebar
            class="grow"
            :keyword="keywordQueryParam"
            :filters="mobileFilters"
            :loading="loading || facetsLoading"
            :with-local-search="!isSearchPage"
            @search="
              onSearchStart($event);
              hideMobileSidebar();
            "
            @change="updateMobileFilters($event)"
            @open-branches="openBranchesDialog(true)"
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
                  applyFilters(mobileFilters);
                  hideMobileSidebar();
                "
              >
                {{ $t("common.buttons.apply") }}
              </VcButton>
            </div>
          </div>
        </VcPopupSidebar>

        <!-- Sidebar -->
        <div v-else class="space-y-5 w-60 flex-shrink-0 pt-2">
          <CategorySelector v-if="!isSearchPage" :selected-category="selectedCategory" :loading="loadingCategories" />

          <ProductsFiltersSidebar
            :keyword="keywordQueryParam"
            :filters="{ facets, inStock: savedInStock, branches: savedBranches }"
            :loading="loading"
            :with-local-search="!isSearchPage"
            @search="onSearchStart($event)"
            @change="applyFilters($event)"
          />
        </div>

        <!-- Content -->
        <div class="flex-grow">
          <div class="flex">
            <h2 class="text-gray-800 text-21 font-bold uppercase lg:my-px lg:text-25">
              <i18n-t v-if="isSearchPage" keypath="pages.search.header" tag="span">
                <template #keyword>
                  <strong>{{ searchParams.keyword }}</strong>
                </template>
              </i18n-t>

              <span v-else>
                <span>{{ selectedCategory?.name }}</span>
              </span>

              <sup
                class="ml-2 normal-case font-normal whitespace-nowrap text-sm lg:text-15 -top-1 lg:top-[-0.5em] text-[color:var(--color-category-page-results)]"
              >
                <b class="font-extrabold">{{ total }}</b>
                {{ $t("pages.catalog.products_found_message", total) }}
              </sup>
            </h2>
          </div>

          <div ref="stickyMobileHeaderAnchor" class="-mt-px"></div>

          <div
            class="sticky top-0 z-10 flex items-center h-14 my-1.5 lg:relative lg:justify-end lg:flex-wrap lg:mb-3.5 lg:mt-3 lg:h-auto"
            :class="{
              'z-40 px-5 md:px-12 -mx-5 md:-mx-12 bg-[color:var(--color-header-bottom-bg)]':
                stickyMobileHeaderIsVisible,
            }"
          >
            <!-- Mobile filters toggler -->
            <div class="lg:hidden mr-2.5">
              <VcButton class="pl-2.5 pr-2 !text-15 font-bold !font-lato" size="md" @click="showMobileSidebar">
                <i class="fas fa-filter mr-2"></i> {{ $t("pages.catalog.filters_button") }}
              </VcButton>
            </div>

            <!-- Sorting -->
            <div class="flex items-center flex-grow z-10 ml-auto lg:ml-4 lg:flex-grow-0 lg:order-4 xl:ml-8">
              <span
                v-t="'pages.catalog.sort_by_label'"
                class="hidden lg:block shrink-0 mr-2 text-15 font-bold text-[color:var(--color-category-page-label)]"
              />

              <VcSelect
                v-model="sortQueryParam"
                text-field="name"
                value-field="id"
                :disabled="loading"
                :items="PRODUCT_SORTING_LIST"
                class="w-full lg:w-48"
              />
            </div>

            <!-- View options -->
            <ViewMode v-model:mode="savedViewMode" class="inline-flex ml-3 lg:order-1 lg:ml-0 lg:mr-auto" />

            <!-- Branch availability -->
            <div
              v-if="!isMobile"
              class="order-3 flex items-center ml-4 xl:ml-6"
              @click.prevent="openBranchesDialog(false)"
            >
              <VcTooltip :x-offset="28" placement="bottom-start" strategy="fixed">
                <template #trigger>
                  <VcCheckbox :model-value="!!savedBranches.length" :disabled="loading">
                    <i18n-t
                      keypath="pages.catalog.branch_availability_filter_card.available_in"
                      tag="div"
                      class="text-15"
                      :class="{
                        'text-[color:var(--color-category-page-checkbox-label)]': !savedBranches.length,
                      }"
                      scope="global"
                    >
                      <span :class="{ 'font-bold text-[color:var(--color-link)]': savedBranches.length }">
                        {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: savedBranches.length }) }}
                      </span>
                    </i18n-t>
                  </VcCheckbox>
                </template>

                <template #content>
                  <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5 w-52">
                    {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
                  </div>
                </template>
              </VcTooltip>
            </div>

            <!-- In Stock -->
            <div v-if="!isMobile" class="order-2 flex items-center ml-4 xl:ml-8">
              <VcTooltip :x-offset="28" placement="bottom-start" strategy="fixed">
                <template #trigger>
                  <VcCheckbox v-model="savedInStock" :disabled="loading">
                    <span
                      class="text-15 whitespace-nowrap"
                      :class="{
                        'text-[color:var(--color-category-page-checkbox-label)]': !savedInStock,
                      }"
                    >
                      {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
                    </span>
                  </VcCheckbox>
                </template>

                <template #content>
                  <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5 w-52">
                    {{ $t("pages.catalog.instock_filter_card.tooltip_text") }}
                  </div>
                </template>
              </VcTooltip>
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
              {{ $t("common.buttons.reset_filters") }}
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
              :view-mode="savedViewMode"
              :items-per-page="itemsPerPage"
              :products="products"
              :class="
                savedViewMode === 'list'
                  ? '-mx-5 divide-y lg:divide-y-0 lg:mx-0 lg:space-y-3.5'
                  : 'grid gap-6 xs:grid-cols-2 md:grid-cols-3 lg:gap-5 xl:grid-cols-4'
              "
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
              class="mt-9 -mb-6"
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
                class="px-6 uppercase"
                size="lg"
                @click="resetFacetFiltersWithKeyword"
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
  WatchStopHandle,
} from "vue";
import _ from "lodash";
import { useRoute } from "vue-router";
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
  buildBreadcrumbs,
  DEFAULT_PAGE_SIZE,
  FacetItem,
  FacetValueItem,
  getFilterExpressionFromFacets,
  PRODUCT_SORTING_LIST,
  QueryParamName,
  searchCategoryTreeItemByKey,
  useBreadcrumbs,
  useCategories,
  useElementVisibility,
  useGoogleAnalytics,
  usePageHead,
  useRouteQueryParam,
} from "@/core";
import {
  CategorySelector,
  DisplayProducts,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForInStock,
  ProductsFilters,
  ProductsFiltersSidebar,
  ProductsSearchParams,
  useProducts,
  ViewMode,
} from "@/shared/catalog";
import { BranchesDialog, FFC_LOCAL_STORAGE } from "@/shared/fulfillmentCenters";
import { AddToCart } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import { Product } from "@/xapi";

const FILTERS_RESET_TIMEOUT_IN_MS = 500;
const watchStopHandles: WatchStopHandle[] = [];

interface IProps {
  categoryId?: string;
}

const props = defineProps<IProps>();

const { openPopup } = usePopup();
const breakpoints = useBreakpoints(breakpointsTailwind);
const ga = useGoogleAnalytics();
const { loading: loadingCategories, categoryTree } = useCategories();
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

const selectedCategory = computed(() =>
  props.categoryId && categoryTree.value
    ? searchCategoryTreeItemByKey(categoryTree.value, "id", props.categoryId)
    : categoryTree.value
);

usePageHead({
  title: computed(() => selectedCategory.value?.seoInfo?.pageTitle || selectedCategory.value?.name),
  meta: {
    keywords: computed(() => selectedCategory.value?.seoInfo?.metaKeywords),
    description: computed(() => selectedCategory.value?.seoInfo?.metaDescription),
  },
});

const breadcrumbs = useBreadcrumbs(() =>
  selectedCategory.value
    ? buildBreadcrumbs(selectedCategory.value.breadcrumbs) ?? [{ title: selectedCategory.value.name }]
    : []
);

const route = useRoute();
const savedViewMode = useLocalStorage<"grid" | "list">("viewMode", "grid");
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
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor, { direction: "top" });
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

const isSearchPage = computedEager<boolean>(() => route.name === "Search");

const searchParams = computedEager<ProductsSearchParams>(() => ({
  categoryId: props.categoryId,
  itemsPerPage: itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: isSearchPage.value ? searchQueryParam.value : keywordQueryParam.value,
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
    JSON.stringify(mobileFilters) !==
    JSON.stringify({
      facets: facets.value,
      inStock: savedInStock.value,
      branches: savedBranches.value,
    } as ProductsFilters)
);

function sendGASelectItemEvent(product: Product) {
  ga.selectItem(product);
}

function showMobileSidebar() {
  mobileFilters.facets = _.cloneDeep(facets.value);
  mobileFilters.inStock = savedInStock.value;
  mobileFilters.branches = savedBranches.value.slice();
  mobileSidebarVisible.value = true;
}

function hideMobileSidebar() {
  mobileSidebarVisible.value = false;
}

function onSearchStart(newKeyword: string) {
  const searchText = newKeyword;

  if (searchText !== keywordQueryParam.value && searchText.length <= 30) {
    keywordQueryParam.value = searchText;
  }
}

function applyFilters(newFilters: ProductsFilters) {
  const facetsFilterExpression: string = getFilterExpressionFromFacets(newFilters.facets);

  if (facetsQueryParam.value !== facetsFilterExpression) {
    facetsQueryParam.value = facetsFilterExpression;
  }

  if (savedInStock.value !== newFilters.inStock) {
    savedInStock.value = newFilters.inStock;
  }

  if (!_.isEqual(savedBranches.value, newFilters.branches)) {
    savedBranches.value = newFilters.branches;
  }
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

function removeFacetFilterItem(payload: Pick<FacetItem, "paramName"> & Pick<FacetValueItem, "value">) {
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

  /**
   * Send Google Analytics event for products.
   */
  ga.viewItemList(products.value, {
    item_list_id: selectedCategory.value?.slug,
    item_list_name: selectedCategory.value?.name,
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
    item_list_id: `${selectedCategory.value?.slug}_page_${nextPage}`,
    item_list_name: `${selectedCategory.value?.name} (page ${nextPage})`,
  });
}

function openBranchesDialog(fromMobileFilter: boolean) {
  openPopup({
    component: BranchesDialog,
    props: {
      selectedBranches: fromMobileFilter ? mobileFilters.branches : savedBranches.value,
      onSave(branches: string[]) {
        if (fromMobileFilter) {
          const newFilters: ProductsFilters = {
            branches,
            facets: mobileFilters.facets,
            inStock: mobileFilters.inStock,
          };

          updateMobileFilters(newFilters);
        } else {
          savedBranches.value = branches;
        }
      },
    },
  });
}

onMounted(async () => {
  await loadProducts();

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
    )
  );
});

onBeforeUnmount(() => {
  watchStopHandles.forEach((watchStopHandle) => watchStopHandle());
});

whenever(() => !isMobile.value, hideMobileSidebar);
</script>
