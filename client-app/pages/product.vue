<template>
  <VcContainer
    v-if="product && productTemplate"
    ref="productComponentAnchor"
    class="print:min-w-[1024px] print:bg-transparent print:px-0 print:[zoom:0.7]"
  >
    <FiltersPopupSidebar
      :is-exist-selected-facets="hasSelectedFacets"
      :popup-sidebar-filters="productsFilters"
      :facets-loading="fetchingFacets"
      :is-mobile="isMobile"
      :is-visible="isFiltersSidebarVisible"
      :loading="fetchingVariations"
      :hide-controls="false"
      @hide-popup-sidebar="hideFiltersSidebar"
      @reset-facet-filters="resetFacetFilters"
      @apply-filters="applyFilters"
    />

    <!-- Breadcrumbs -->
    <VcBreadcrumbs class="mb-3" :items="breadcrumbs" />

    <VcTypography tag="h1">
      {{ selectedVariationName || product.name }}
    </VcTypography>

    <div class="mt-2 flex flex-wrap gap-1 max-sm:justify-between sm:gap-6">
      <VcCopyText
        v-if="!product.hasVariations"
        :text="product.code"
        :notification="$t('pages.product.sku_copied_message')"
      >
        <span class="text-base text-secondary-900">
          {{ $t("pages.product.sku_label") }}
          <span class="font-black">#{{ product.code }}</span>
        </span>
      </VcCopyText>

      <ProductRating v-if="productReviewsEnabled && product.rating" :rating="product.rating" />
    </div>

    <VcLayout sidebar-position="right" sticky-sidebar class="mt-5">
      <div class="space-y-5 xl:space-y-7">
        <component
          :is="productInfoSection?.type"
          v-if="productInfoSection && !productInfoSection.hidden"
          :product="product"
          :variations="variations"
          :model="productInfoSection"
          :fetching-variations="fetchingVariations"
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
          :product-id="productId"
          :product-name="product.name"
          @apply-sorting="sortVariations"
          @change-page="changeVariationsPage"
          @show-filters="showFiltersSidebar"
          @reset-filters="resetFacetFilters"
          @apply-filters="applyFilters"
        />

        <component
          :is="relatedProductsSection?.type"
          v-if="relatedProductsSection && !relatedProductsSection.hidden"
          :related-products="relatedProducts"
          :product-id="productId"
          :product-name="product.name"
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
            :product-name="product.name"
          />
        </template>
      </div>

      <template #sidebar>
        <ProductSidebar
          :class="['max-md:mt-5', { 'print:hidden': product.hasVariations }]"
          :product="product"
          :variations="variations"
          :template-layout="templateLayout"
        />
      </template>
    </VcLayout>
  </VcContainer>

  <Error404 v-else-if="!fetchingProduct && productTemplate" />
</template>

<script setup lang="ts">
import { ApolloError } from "@apollo/client/core";
import { useSeoMeta } from "@unhead/vue";
import { useBreakpoints, useElementVisibility } from "@vueuse/core";
import { computed, defineAsyncComponent, ref, shallowRef, toRef, watch } from "vue";
import { useRouter } from "vue-router";
import productTemplateDefault from "@/config/product-default.json";
import productTemplateB2c from "@/config/product_b2c.json";
import { useBreadcrumbs, useAnalytics, usePageTitle } from "@/core/composables";
import { useHistoricalEvents } from "@/core/composables/useHistoricalEvents";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BREAKPOINTS } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { globals } from "@/core/globals";
import {
  buildBreadcrumbs,
  generateFilterExpressionFromFilters,
  getFilterExpression,
  getSortingExpression,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForInStock,
  getFilterExpressionForPurchasedBefore,
} from "@/core/utilities";
import {
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import { ROUTES } from "@/router/routes/constants";
import {
  useProduct,
  useRelatedProducts,
  ProductSidebar,
  ProductConfiguration,
  useProducts,
  useRecommendedProducts,
  useConfigurableProduct,
} from "@/shared/catalog";
import { useProductVariationProperties } from "@/shared/catalog/composables/useProductVariationProperties";
import {
  PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME,
  PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES,
} from "@/shared/catalog/constants/product";
import type { ISortInfo } from "@/core/types";
import type { FiltersDisplayOrderType, ProductsFiltersType, ProductsSearchParamsType } from "@/shared/catalog";
import type { IPageTemplate } from "@/shared/static-content";
import ProductRating from "@/modules/customer-reviews/components/product-rating.vue";
import FiltersPopupSidebar from "@/shared/catalog/components/category/filters-popup-sidebar.vue";

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});

const router = useRouter();

const B2C_VARIATIONS_ITEMS_PER_PAGE = 150;

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

const { product, fetching: fetchingProduct, fetchProduct } = useProduct();
const { fetchProductConfiguration, configuration } = useConfigurableProduct(productId.value);
const {
  fetchingProducts: fetchingVariations,
  products: variations,
  pagesCount: variationsPagesCount,
  fetchingFacets,
  fetchProducts,
  hasSelectedFacets,
  isFiltersSidebarVisible,
  productsFilters,
  applyFilters: _applyFilters,
  hideFiltersSidebar,
  resetFacetFilters: _resetFacetFilters,
  showFiltersSidebar,
} = useProducts({
  withFacets: true,
  filtersDisplayOrder,
});
const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
const { recommendedProducts, fetchRecommendedProducts } = useRecommendedProducts();
const { applicableVariations } = useProductVariationProperties(variations);

const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);

const { analytics } = useAnalytics();
const { pushHistoricalEvent } = useHistoricalEvents();

const selectedVariationName = computed(() => {
  return applicableVariations.value.length === 1 ? applicableVariations.value[0].name : undefined;
});

const templateLayout = computed(() => {
  const layoutProperty = product.value?.properties?.find(
    (property) => property.name === PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME,
  )?.value;

  if (typeof layoutProperty === "string") {
    return layoutProperty;
  }

  return undefined;
});

const variationsFilterExpression = ref(`productfamilyid:${productId.value} is:product,variation`);
const variationSortInfo = ref<ISortInfo>({
  column: "name",
  direction: SortDirection.Ascending,
});

const initialVariationsSearchParamsDefault = {
  page: 1,
  itemsPerPage: 50,
  sort: getSortingExpression(variationSortInfo.value),
  filter: getFilterExpression([
    variationsFilterExpression.value,
    getFilterExpressionForAvailableIn(productsFilters.value.branches),
    getFilterExpressionForInStock(productsFilters.value.inStock),
    getFilterExpressionForPurchasedBefore(productsFilters.value.purchasedBefore),
  ]),
};

const initialVariationsSearchParamsB2c = {
  page: 1,
  itemsPerPage: B2C_VARIATIONS_ITEMS_PER_PAGE,
  filter: getFilterExpression([
    variationsFilterExpression.value,
    getFilterExpressionForAvailableIn([]),
    getFilterExpressionForInStock(true),
  ]),
};

const variationsSearchParams = ref<ProductsSearchParamsType>({
  ...(templateLayout.value === PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c
    ? initialVariationsSearchParamsB2c
    : initialVariationsSearchParamsDefault),
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

const productTemplate = computed(() => {
  if (templateLayout.value === PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c) {
    return productTemplateB2c as IPageTemplate;
  }
  return productTemplateDefault as IPageTemplate;
});

const productInfoSection = computed(() =>
  productTemplate.value?.content?.find((item) => item?.type === "product-info"),
);

const productDescriptionSection = computed(() =>
  productTemplate.value?.content?.find((item) => item?.type === "product-description"),
);

const productReviewsSection = computed(() =>
  productTemplate.value?.content?.find((item) => item?.type === "product-reviews"),
);

const productVariationsBlock = computed(() =>
  productInfoSection.value?.blocks?.find((block) => block?.type === "product-variations"),
);

const relatedProductsSection = computed(() =>
  productTemplate.value?.content?.find((item) => item?.type === "related-products"),
);

const recommendedProductsSection = computed(() =>
  productTemplate.value?.content?.find((item) => item?.type === "recommended-products"),
);

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

async function applyFilters(newFilters: ProductsFiltersType): Promise<void> {
  _applyFilters(newFilters);

  variationsSearchParams.value.page = 1;
  variationsSearchParams.value.filter = getFilterExpression([
    variationsFilterExpression.value,
    generateFilterExpressionFromFilters(newFilters.filters),
    getFilterExpressionForInStock(newFilters.inStock),
    getFilterExpressionForAvailableIn(newFilters.branches),
    getFilterExpressionForPurchasedBefore(newFilters.purchasedBefore),
  ]);

  await fetchProducts(variationsSearchParams.value);
}

async function resetFacetFilters(): Promise<void> {
  await _resetFacetFilters();
  void applyFilters(productsFilters.value);
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

watch(
  productId,
  async () => {
    await fetchProduct(productId.value);
    if (product.value?.isConfigurable) {
      await tryFetchProductConfiguration();
    }

    if (product.value?.associations?.totalCount && !relatedProductsSection.value?.hidden) {
      await fetchRelatedProducts({ productId: productId.value, itemsPerPage: 30 });
    }

    const recommendedProductsBlocks = recommendedProductsSection.value?.blocks?.filter((block) => !!block.model) ?? [];
    if (!recommendedProductsSection.value?.hidden && recommendedProductsSection.value?.blocks?.length) {
      const paramsToFetch = recommendedProductsBlocks.map(({ model }) => ({
        productId: productId.value,
        model: model as string,
      }));
      await fetchRecommendedProducts(paramsToFetch);
    }

    const showVariations = productVariationsBlock.value && !productVariationsBlock.value?.hidden;
    const optionsBlock = productInfoSection.value?.blocks?.find((block) => block?.type === "product-options");
    const showOptions = optionsBlock && !optionsBlock?.hidden;

    if (product.value?.hasVariations && (showVariations || showOptions)) {
      if (templateLayout.value === PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c) {
        variationsSearchParams.value = {
          ...variationsSearchParams.value,
          itemsPerPage: B2C_VARIATIONS_ITEMS_PER_PAGE,
          sort: undefined,
          filter: getFilterExpression([variationsFilterExpression.value, getFilterExpressionForInStock(true)]),
        };
      }
      await fetchProducts(variationsSearchParams.value);
    }
  },
  { immediate: true },
);

async function tryFetchProductConfiguration() {
  try {
    await fetchProductConfiguration();
  } catch (e) {
    // Redirect to sign-in page if logged out on configurable product with lineItemId in URL
    if(e instanceof ApolloError && e.graphQLErrors.length) {
      void router.replace({ name: ROUTES.SIGN_IN.NAME })
    }
  }
}

/**
 * Send Google Analytics event and historical event for product.
 */

const fetchedProductId = computed(() => product.value?.id);

watch(
  fetchedProductId,
  () => {
    if (fetchedProductId.value && product.value) {
      analytics("viewItem", product.value);

      void pushHistoricalEvent({
        eventType: "click",
        productId: product.value.id,
        storeId: globals.storeId,
      });
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
