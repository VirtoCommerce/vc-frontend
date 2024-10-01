<template>
  <VcContainer
    v-if="product && template"
    ref="productComponentAnchor"
    class="print:min-w-[1024px] print:bg-transparent print:px-0 print:[zoom:0.7]"
  >
    <FiltersPopupSidebar
      :is-exist-selected-facets="hasSelectedFacets"
      :is-popup-sidebar-filter-dirty="isFiltersDirty"
      :popup-sidebar-filters="productsFilters"
      :facets-loading="fetchingFacets"
      :is-mobile="isMobile"
      :is-visible="isFiltersSidebarVisible"
      :loading="fetchingVariations"
      :hide-sorting="false"
      :hide-controls="false"
      @hide-popup-sidebar="hideFiltersSidebar"
      @reset-facet-filters="resetFacetFilters"
      @open-branches-modal="showBranchesModal"
      @update-popup-sidebar-filters="updateFiltersSidebar"
      @apply-filters="applyFilters"
    />

    <!-- Breadcrumbs -->
    <VcBreadcrumbs class="mb-3" :items="breadcrumbs" />

    <VcTypography tag="h1">
      {{ product.name }}
    </VcTypography>

    <div v-if="!product.hasVariations" class="mt-2 flex flex-wrap gap-5">
      <VcCopyText :text="product.code" :notification="$t('pages.product.sku_copied_message')">
        <span class="text-base text-secondary-900">
          {{ $t("pages.product.sku_label") }}
          <span class="font-black">#{{ product.code }}</span>
        </span>
      </VcCopyText>
    </div>

    <!--
        TODO: create VcLayoutWithSidebar component
        https://virtocommerce.atlassian.net/browse/ST-5629
      -->
    <div class="mt-5 flex flex-col gap-6 sm:gap-7 md:flex-row md:items-start md:gap-4 lg:gap-5 xl:gap-6">
      <div class="contents md:block md:w-0 md:grow md:space-y-6 xl:space-y-7">
        <component
          :is="productInfoSection?.type"
          v-if="productInfoSection && !productInfoSection.hidden"
          :product="product"
          :model="productInfoSection"
        />

        <component
          :is="productVariationsBlock?.type"
          v-if="productVariationsBlock && !productVariationsBlock.hidden && product.hasVariations"
          :variations="variations"
          :sort="variationSortInfo"
          :model="productVariationsBlock"
          :fetching-variations="fetchingVariations"
          :page-number="variationsSearchParams.page"
          :pages-count="variationsPagesCount"
          :products-filters="productsFilters"
          :has-selected-filters="hasSelectedFacets"
          @apply-sorting="sortVariations"
          @change-page="changeVariationsPage"
          @show-filters="showFiltersSidebar"
          @remove-facet-filter="removeFacetFilter"
          @reset-facet-filters="resetFacetFilters"
        />

        <component
          :is="relatedProductsSection?.type"
          v-if="relatedProductsSection && !relatedProductsSection.hidden"
          :related-products="relatedProducts"
          :model="relatedProductsSection"
        />

        <template v-if="recommendedProductsSection && !recommendedProductsSection.hidden">
          <component
            :is="recommendedProductsSection?.type"
            v-for="{ model, id } in recommendedProductsSection.blocks"
            :key="id"
            :recommended-products="recommendedProducts[model]"
            :title="$t(`pages.product.recommended_products.${model}_section_title`)"
          />
        </template>
      </div>

      <ProductSidebar
        :class="[
          'flex-none md:sticky md:top-18 md:w-64 lg:top-[6.5rem] xl:w-[17.875rem]',
          { 'print:hidden': product.hasVariations },
        ]"
        :product="sideBarProduct"
        :variations="variations"
      />
    </div>
  </VcContainer>

  <Error404 v-else-if="!fetchingProduct && template" />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useBreakpoints, useElementVisibility } from "@vueuse/core";
import { computed, defineAsyncComponent, ref, shallowRef, toRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead } from "@/core/composables";
import { useHistoricalEvents } from "@/core/composables/useHistoricalEvents";
import { BREAKPOINTS } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { globals } from "@/core/globals";
import {
  buildBreadcrumbs,
  getFilterExpressionFromFacets,
  getFilterExpression,
  getSortingExpression,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForInStock,
} from "@/core/utilities";
import {
  useProduct,
  useRelatedProducts,
  useCategory,
  ProductSidebar,
  useProducts,
  useRecommendedProducts,
} from "@/shared/catalog";
import { useTemplate } from "@/shared/static-content";
import type { Product } from "@/core/api/graphql/types";
import type { FacetItemType, FacetValueItemType, ISortInfo } from "@/core/types";
import type { FiltersDisplayOrderType, ProductsFiltersType, ProductsSearchParamsType } from "@/shared/catalog";
import type { PageContent } from "@/shared/static-content";
import FiltersPopupSidebar from "@/shared/catalog/components/category/filters-popup-sidebar.vue";

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});

interface IProps {
  productId?: string;
  allowSetMeta?: boolean;
  filtersDisplayOrder?: FiltersDisplayOrderType;
}

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("lg");

const productId = toRef(props, "productId");
const filtersDisplayOrder = toRef(props, "filtersDisplayOrder");

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const { t } = useI18n();
const { product, fetching: fetchingProduct, fetchProduct } = useProduct();
const {
  branchesFromSidebarFilters,
  fetchingProducts: fetchingVariations,
  products: variations,
  pagesCount: variationsPagesCount,
  fetchingFacets,
  fetchProducts,
  getFacets,
  hasSelectedFacets,
  isFiltersDirty,
  isFiltersSidebarVisible,
  productsFilters,
  applyFilters: _applyFilters,
  hideFiltersSidebar,
  openBranchesModal,
  removeFacetFilter: _removeFacetFilter,
  resetFacetFilters: _resetFacetFilters,
  showFiltersSidebar,
  updateProductsFilters,
} = useProducts({
  withFacets: true,
  filtersDisplayOrder,
});
const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const { recommendedProducts, fetchRecommendedProducts } = useRecommendedProducts();

const template = useTemplate("product");
const ga = useGoogleAnalytics();
const { catalogBreadcrumb } = useCategory();
const { pushHistoricalEvent } = useHistoricalEvents();

const variationsFilterExpression = ref(`productfamilyid:${productId.value} is:product,variation`);
const variationSortInfo = ref<ISortInfo>({
  column: "name",
  direction: SortDirection.Ascending,
});

const variationsSearchParams = shallowRef<ProductsSearchParamsType>({
  page: 1,
  itemsPerPage: 50,
  sort: getSortingExpression(variationSortInfo.value),
  filter: getFilterExpression([
    variationsFilterExpression.value,
    getFilterExpressionForAvailableIn(productsFilters.value.branches),
    getFilterExpressionForInStock(productsFilters.value.inStock),
  ]),
});

// todo https://github.com/VirtoCommerce/vc-theme-b2b-vue/issues/1099
const sideBarProduct = computed(() => {
  return product.value as Product;
});

const seoTitle = computed(() => product.value?.seoInfo?.pageTitle || product.value?.name);
const seoDescription = computed(() => product.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => product.value?.seoInfo?.metaKeywords);
const seoImageUrl = computed(() => product.value?.imgSrc);

const productInfoSection = computed(() =>
  template.value?.content.find((item: PageContent) => item.type === "product-info"),
);

const productVariationsBlock = computed(() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productInfoSection.value?.blocks.find((block: any) => block.type === "product-variations"),
);

const relatedProductsSection = computed(() =>
  template.value?.content.find((item: PageContent) => item.type === "related-products"),
);

const recommendedProductsSection = computed(() =>
  template.value?.content.find((item: PageContent) => item.type === "recommended-products"),
);

const breadcrumbs = useBreadcrumbs(() => {
  return [catalogBreadcrumb].concat(buildBreadcrumbs(product.value?.breadcrumbs) ?? []);
});

const productComponentAnchor = shallowRef<HTMLElement | null>(null);
const productComponentAnchorIsVisible = useElementVisibility(productComponentAnchor);

async function sortVariations(sortInfo: ISortInfo): Promise<void> {
  variationSortInfo.value = sortInfo;

  variationsSearchParams.value.page = 1;
  variationsSearchParams.value.sort = getSortingExpression(sortInfo);

  await fetchProducts(variationsSearchParams.value);
}

async function changeVariationsPage(pageNumber: number): Promise<void> {
  variationsSearchParams.value.page = pageNumber;

  await fetchProducts(variationsSearchParams.value);
}

async function updateFiltersSidebar(newFilters: ProductsFiltersType): Promise<void> {
  const searchParamsForFacets: ProductsSearchParamsType = {
    filter: getFilterExpression([variationsFilterExpression.value, getFilterExpressionFromFacets(newFilters.facets)]),
  };

  updateProductsFilters({
    branches: newFilters.branches,
    inStock: newFilters.inStock,
    facets: await getFacets(searchParamsForFacets),
  });
}

async function applyFilters(newFilters: ProductsFiltersType): Promise<void> {
  _applyFilters(newFilters);

  variationsSearchParams.value.page = 1;
  variationsSearchParams.value.filter = getFilterExpression([
    variationsFilterExpression.value,
    getFilterExpressionFromFacets(newFilters.facets),
    getFilterExpressionForInStock(newFilters.inStock),
    getFilterExpressionForAvailableIn(newFilters.branches),
  ]);

  await fetchProducts(variationsSearchParams.value);
}

async function removeFacetFilter(
  payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">,
): Promise<void> {
  _removeFacetFilter(payload);

  variationsSearchParams.value.page = 1;
  variationsSearchParams.value.filter = getFilterExpression([
    variationsFilterExpression.value,
    getFilterExpressionFromFacets(productsFilters.value.facets),
    getFilterExpressionForAvailableIn(productsFilters.value.branches),
    getFilterExpressionForInStock(productsFilters.value.inStock),
  ]);

  await fetchProducts(variationsSearchParams.value);
}

async function resetFacetFilters(): Promise<void> {
  _resetFacetFilters();

  variationsSearchParams.value.page = 1;
  variationsSearchParams.value.filter = getFilterExpression([variationsFilterExpression.value]);

  await fetchProducts(variationsSearchParams.value);
}

function showBranchesModal(fromFiltersSidebar: boolean): void {
  branchesFromSidebarFilters.value = fromFiltersSidebar;
  openBranchesModal();
}

watchEffect(() => {
  if (props.allowSetMeta && productComponentAnchorIsVisible.value) {
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
  }
});

watchEffect(async () => {
  await fetchProduct(productId.value);

  if (product.value?.associations?.totalCount && !relatedProductsSection.value?.hidden) {
    await fetchRelatedProducts({ productId: productId.value, itemsPerPage: 30 });
  }

  const recommendedProductsBlocks = (recommendedProductsSection.value?.blocks ?? []) as { model: string }[];
  if (!recommendedProductsSection.value?.hidden && recommendedProductsSection.value?.blocks.length) {
    const paramsToFetch = recommendedProductsBlocks.map(({ model }) => ({
      productId: productId.value,
      model,
    }));
    await fetchRecommendedProducts(paramsToFetch);
  }

  if (product.value?.hasVariations) {
    await fetchProducts(variationsSearchParams.value);
  }
});

/**
 * Send Google Analytics event and historical event for product.
 */
watchEffect(() => {
  if (product.value) {
    // todo https://github.com/VirtoCommerce/vc-theme-b2b-vue/issues/1098
    ga.viewItem(product.value as Product);
    void pushHistoricalEvent({
      eventType: "click",
      productId: product.value.id,
      storeId: globals.storeId,
    });
  }
});

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  if (relatedProducts.value.length) {
    ga.viewItemList(relatedProducts.value, {
      item_list_id: "related_products",
      item_list_name: t("pages.product.related_product_section_title"),
    });
  }
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
