<template>
  <VcContainer
    v-if="product && productTemplate"
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
      :hide-controls="false"
      @hide-popup-sidebar="hideFiltersSidebar"
      @reset-facet-filters="resetFacetFilters"
      @open-branches-modal="openBranchesModal"
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

    <VcLayout sidebar-position="right" sticky-sidebar class="mt-5">
      <div class="space-y-5 xl:space-y-7">
        <component
          :is="productInfoSection?.type"
          v-if="productInfoSection && !productInfoSection.hidden"
          :product="product"
          :model="productInfoSection"
        />

        <component
          :is="productDescriptionSection && 'type' in productDescriptionSection ? productDescriptionSection.type : ''"
          v-if="productDescriptionSection && !productDescriptionSection.hidden"
          :product="product"
          :model="productDescriptionSection"
          :is-collapsible="false"
        />

        <ProductConfiguration
          v-if="product.isConfigurable && configuration?.length"
          :product-id="productId"
          :configuration="configuration"
        />

        <KeepAlive>
          <ProductReviews
            v-if="productReviewsEnabled && !productReviewsSection?.hidden"
            :product-id="productId"
            :product-rating="product.rating"
          />
        </KeepAlive>

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
          :product-id="productId"
        />

        <template v-if="recommendedProductsSection && !recommendedProductsSection.hidden">
          <component
            :is="recommendedProductsSection?.type"
            v-for="{ model, id } in recommendedProductsSection.blocks"
            :key="id"
            :recommended-products="recommendedProducts[model as string]"
            :title="$t(`pages.product.recommended_products.${model}_section_title`)"
            :model="model"
            :product-id="productId"
          />
        </template>
      </div>

      <template #sidebar>
        <ProductSidebar
          :class="['max-md:mt-5', { 'print:hidden': product.hasVariations }]"
          :product="product"
          :variations="variations"
        />
      </template>
    </VcLayout>
  </VcContainer>

  <Error404 v-else-if="!fetchingProduct && productTemplate" />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useBreakpoints, useElementVisibility } from "@vueuse/core";
import { computed, defineAsyncComponent, ref, shallowRef, toRef, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import _productTemplate from "@/config/product.json";
import { useBreadcrumbs, useAnalytics, usePageTitle } from "@/core/composables";
import { useHistoricalEvents } from "@/core/composables/useHistoricalEvents";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
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
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import {
  useProduct,
  useRelatedProducts,
  ProductSidebar,
  ProductConfiguration,
  useProducts,
  useRecommendedProducts,
  useConfigurableProduct,
} from "@/shared/catalog";
import type { FacetItemType, FacetValueItemType, ISortInfo } from "@/core/types";
import type { FiltersDisplayOrderType, ProductsFiltersType, ProductsSearchParamsType } from "@/shared/catalog";
import type { IPageTemplate } from "@/shared/static-content";
import FiltersPopupSidebar from "@/shared/catalog/components/category/filters-popup-sidebar.vue";

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});

const ProductReviews = defineAsyncComponent(() => import("@/modules/customer-reviews/components/product-reviews.vue"));
const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

interface IProps {
  productId?: string;
  allowSetMeta?: boolean;
  filtersDisplayOrder?: FiltersDisplayOrderType;
}

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("lg");

const productId = toRef(props, "productId");
const filtersDisplayOrder = toRef(props, "filtersDisplayOrder");

const { t } = useI18n();
const { product, fetching: fetchingProduct, fetchProduct } = useProduct();
const { fetchProductConfiguration, configuration } = useConfigurableProduct(productId.value);
const {
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

const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);

const { analytics } = useAnalytics();
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

const seoTitle = computed(() => product.value?.seoInfo?.pageTitle || product.value?.name);
const { title: pageTitle } = usePageTitle(seoTitle);
const seoDescription = computed(() => product.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => product.value?.seoInfo?.metaKeywords);
const seoImageUrl = computed(() => product.value?.imgSrc);
const seoUrl = computed(() =>
  product.value?.seoInfo?.semanticUrl
    ? `${window.location.host}\${product.value?.seoInfo?.semanticUrl}`
    : window.location.toString(),
);
const canSetMeta = computed(() => props.allowSetMeta && productComponentAnchorIsVisible.value);

const productTemplate = _productTemplate as IPageTemplate;

const productInfoSection = productTemplate?.content?.find((item) => item?.type === "product-info");

const productDescriptionSection = productTemplate?.content?.find((item) => item?.type === "product-description");

const productReviewsSection = productTemplate?.content?.find((item) => item?.type === "product-reviews");

const productVariationsBlock = productInfoSection?.blocks?.find((block) => block?.type === "product-variations");

const relatedProductsSection = productTemplate?.content?.find((item) => item?.type === "related-products");

const recommendedProductsSection = productTemplate?.content?.find((item) => item?.type === "recommended-products");

const breadcrumbs = useBreadcrumbs(() => buildBreadcrumbs(product.value?.breadcrumbs));

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

useSeoMeta({
  title: () => (canSetMeta.value ? pageTitle.value : undefined),
  keywords: () => (canSetMeta.value ? seoKeywords.value : undefined),
  description: () => (canSetMeta.value ? seoDescription.value : undefined),
  ogUrl: () => (canSetMeta.value ? seoUrl.value : undefined),
  ogTitle: () => (canSetMeta.value ? pageTitle.value : undefined),
  ogDescription: () => (canSetMeta.value ? seoDescription.value : undefined),
  ogImage: () => (canSetMeta.value ? seoImageUrl.value : undefined),
  ogType: () => (canSetMeta.value ? "website" : undefined),
});

watchEffect(async () => {
  await fetchProduct(productId.value);
  if (product.value?.isConfigurable) {
    await fetchProductConfiguration();
  }

  if (product.value?.associations?.totalCount && !relatedProductsSection?.hidden) {
    await fetchRelatedProducts({ productId: productId.value, itemsPerPage: 30 });
  }

  const recommendedProductsBlocks = recommendedProductsSection?.blocks?.filter((block) => !!block.model) ?? [];
  if (!recommendedProductsSection?.hidden && recommendedProductsSection?.blocks?.length) {
    const paramsToFetch = recommendedProductsBlocks.map(({ model }) => ({
      productId: productId.value,
      model: model as string,
    }));
    await fetchRecommendedProducts(paramsToFetch);
  }

  if (product.value?.hasVariations && !productVariationsBlock?.hidden) {
    await fetchProducts(variationsSearchParams.value);
  }
});

/**
 * Send Google Analytics event and historical event for product.
 */
watchEffect(() => {
  if (product.value) {
    // todo https://github.com/VirtoCommerce/vc-theme-b2b-vue/issues/1098
    analytics("viewItem", product.value);
    void pushHistoricalEvent({
      eventType: "click",
      productId: product.value.id,
      storeId: globals.storeId,
    });
  }
});

watch(
  variations,
  (newVariations) => {
    if (!newVariations.length) {
      return;
    }

    analytics("viewItemList", newVariations, {
      item_list_id: `variations_${product.value?.id}`,
      item_list_name: "variations",
    });
  },
  { immediate: true },
);

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  if (relatedProducts.value.length) {
    analytics("viewItemList", relatedProducts.value, {
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
