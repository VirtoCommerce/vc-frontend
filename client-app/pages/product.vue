<template>
  <template v-if="product && productTemplate">
    <VcContainer
      ref="productComponentAnchor"
      v-track-item="product"
      data-vc-track="product-details"
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

      <PageBuilderSection
        v-for="item in templateParts.before"
        :key="item.id"
        :item="item"
        :context="sectionContext"
        :id="getAnchorId(item)"
        :model="item"
        class="mb-5 xl:mb-6"
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
          <span class="text-base text-neutral-900">
            {{ $t("pages.product.sku_label") }}
            <span class="font-black">#{{ product.code }}</span>
          </span>
        </VcCopyText>

        <ProductRating v-if="productReviewsEnabled && product.rating" :rating="product.rating" with-review-count />
      </div>

      <VcLayout sidebar-position="right" sticky class="mt-5">
        <div class="space-y-5 xl:space-y-6">
          <component
            :is="productInfoSection?.type"
            v-if="productInfoSection && !productInfoSection.hidden"
            :product="product"
            :variations="variations"
            :model="productInfoSection"
            :fetching-variations="fetchingVariations"
          />

          <ProductConfiguration
            v-if="product.isConfigurable && configuration?.length"
            :product-id="productId"
            :configuration="configuration"
            :initial-configuration="initialConfiguration"
          />

          <PageBuilderSection
            v-for="item in templateParts.column"
            :key="item.id"
            :item="item"
            :context="columnSectionContext"
            :id="getAnchorId(item)"
            :model="item"
          />

          <component
            :is="productVariationsBlock?.type"
            v-if="productVariationsBlock && !productVariationsBlock.hidden && product.hasVariations"
            :variations="variations"
            :sort="variationSortInfo"
            :model="productVariationsBlock"
            :fetching-variations="fetchingVariations"
            :page-number="variationsPageNumber"
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
        </div>

        <template #sidebar>
          <ProductPriceBlock
            :product="product"
            :class="['max-md:mt-5', { 'print:hidden': product.hasVariations }]"
            :is-mobile="isMobile"
            :template-layout="templateLayout"
            :variations="variations"
          />

          <ProductVendor :class="['mt-5', { 'print:hidden': product.hasVariations }]" :product="product" />

          <ProductPickupLocations
            v-if="xPickupEnabled && pickupLocations?.length > 0 && product.availabilityData.isAvailable"
            :loading="pickupLocationsLoading"
            :product-id="productId"
            class="mt-5"
          />
        </template>
      </VcLayout>

      <PageBuilderSection
        v-for="item in templateParts.after"
        :key="item.id"
        :item="item"
        :context="sectionContext"
        :lazy="lazySections"
        :id="getAnchorId(item)"
        :model="item"
        class="mt-5 xl:mt-6"
      />
    </VcContainer>

    <FloatingBar v-if="isMobile">
      <ProductPrice :product="product" :variations="variations" :template-layout="templateLayout" />
    </FloatingBar>
  </template>

  <Error404 v-else-if="!fetchingProduct && !product" />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useBreakpoints, useElementVisibility, useLocalStorage } from "@vueuse/core";
import { computed, defineAsyncComponent, ref, shallowRef, toRef, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBreadcrumbs, usePageTitle, useSeoKeywords } from "@/core/composables";
import { useHistoricalEvents } from "@/core/composables/useHistoricalEvents";
import { useLanguages } from "@/core/composables/useLanguages";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import {
  LOCAL_PRODUCT_CONFIGURATIONS_LOCAL_STORAGE,
  CONFIGURATION_URL_SEARCH_PARAM,
  LINE_ITEM_ID_URL_SEARCH_PARAM,
} from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { globals } from "@/core/globals";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import {
  buildBreadcrumbs,
  generateFilterExpressionFromFilters,
  getFilterExpression,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForInStock,
  getFilterExpressionForPurchasedBefore,
  getSortingExpression,
  getUrlSearchParam,
} from "@/core/utilities";
import {
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import { isPreviewMode } from "@/plugins/builder-preview/utils";
import { useShortCart } from "@/shared/cart";
import {
  useProduct,
  ProductVendor,
  ProductPrice,
  ProductConfiguration,
  useProducts,
  useConfigurableProduct,
  useProductPickupLocations,
  useProductVariations,
  useLoyaltyCatalogCurrency,
} from "@/shared/catalog";
import { useProductVariationProperties } from "@/shared/catalog/composables/useProductVariationProperties";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES } from "@/shared/catalog/constants/product";
import { FloatingBar } from "@/shared/common";
import { getAnchorId, PageBuilderSection, useAnchorScroll, useProductTemplate } from "@/shared/static-content";
import { useXPickup } from "@/shared/x-pickup/composables/useXPickup";
import { BREAKPOINTS } from "@/ui-kit/constants";
import type { ISortInfo } from "@/core/types";
import type { FiltersDisplayOrderType, LocalConfigurationType, ProductsFiltersType } from "@/shared/catalog";
import ProductRating from "@/modules/customer-reviews/components/product-rating.vue";
import FiltersPopupSidebar from "@/shared/catalog/components/category/filters-popup-sidebar.vue";
import ProductPickupLocations from "@/shared/catalog/components/product-pickup-locations.vue";
import ProductPriceBlock from "@/shared/catalog/components/product-price-block.vue";

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});

const B2C_VARIATIONS_ITEMS_PER_PAGE = 150;

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

interface IProps {
  productId?: string;
  allowSetMeta?: boolean;
  filtersDisplayOrder?: FiltersDisplayOrderType;
}

const configurationId = getUrlSearchParam(CONFIGURATION_URL_SEARCH_PARAM);
const lineItemId = getUrlSearchParam(LINE_ITEM_ID_URL_SEARCH_PARAM);

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("md");

const productId = toRef(props, "productId");
const filtersDisplayOrder = toRef(props, "filtersDisplayOrder");

const loyaltyCurrencyOverride = useLoyaltyCatalogCurrency();

const {
  product,
  fetching: fetchingProduct,
  fetchProduct,
} = useProduct({
  currencyCodeOverride: loyaltyCurrencyOverride,
});
const { fetchProductConfiguration, configuration } = useConfigurableProduct(productId);
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
  hideFiltersSidebar: _hideFiltersSidebar,
  resetFacetFilters: _resetFacetFilters,
  showFiltersSidebar,
} = useProducts({
  withFacets: true,
  filtersDisplayOrder,
  currencyCodeOverride: loyaltyCurrencyOverride,
});
const { applicableVariations } = useProductVariationProperties(variations);

const { pickupLocations, fetchPickupLocations, pickupLocationsLoading } = useProductPickupLocations();

const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);
const { xPickupEnabled } = useXPickup();

const { pushHistoricalEvent } = useHistoricalEvents();

const router = useRouter();
const route = useRoute();

useAnchorScroll(() => product.value);

const { cart, loading: loadingCart } = useShortCart();
const { updateLocalizedUrl } = useLanguages();

const localProductConfigurations = useLocalStorage<LocalConfigurationType[]>(
  LOCAL_PRODUCT_CONFIGURATIONS_LOCAL_STORAGE,
  [],
);

const initialConfiguration = computed(() => {
  const configurationLocal = localProductConfigurations.value.find((config) => config.localId === configurationId);
  return configurationLocal?.configuration;
});

const selectedVariationName = computed(() => {
  return applicableVariations.value.length === 1 ? applicableVariations.value[0].name : undefined;
});

/**
 * With the new Page Builder, sections below the product mount as they come near the viewport; the designer preview
 * shows them all at once. Without it the page sends the same requests as before.
 */
const lazySections = isNewPageBuilderEnabled() && !isPreviewMode();

const {
  template: productTemplate,
  parts: templateParts,
  productInfoSection,
  isB2cLayout,
  layoutPropertyValue,
} = useProductTemplate(product);

const productVariationsBlock = computed(() =>
  productInfoSection.value?.blocks?.find((block) => block?.type === "product-variations"),
);

const sectionContext = computed(() => ({ product: product.value }));

const columnSectionContext = computed(() => ({ product: product.value, isCollapsible: false }));

const templateLayout = computed(() =>
  isB2cLayout.value ? PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c : layoutPropertyValue.value,
);

const variationSortInfo = ref<ISortInfo>({
  column: "name",
  direction: SortDirection.Ascending,
});

const variationsItemsPerPage = computed(() => (isB2cLayout.value ? B2C_VARIATIONS_ITEMS_PER_PAGE : 50));

const variationsSort = computed(() => (isB2cLayout.value ? undefined : getSortingExpression(variationSortInfo.value)));

const variationsFilterExpression = computed(() => `productfamilyid:${productId.value} is:product,variation`);

const variationsFilterBuilder = () => {
  const baseFilters = [variationsFilterExpression.value];

  const facetFilters = generateFilterExpressionFromFilters(productsFilters.value.filters);
  if (facetFilters) {
    baseFilters.push(facetFilters);
  }

  if (isB2cLayout.value) {
    return getFilterExpression([
      ...baseFilters,
      getFilterExpressionForAvailableIn([]),
      getFilterExpressionForInStock(true),
    ]);
  }

  return getFilterExpression([
    ...baseFilters,
    getFilterExpressionForAvailableIn(productsFilters.value.branches),
    getFilterExpressionForInStock(productsFilters.value.inStock),
    getFilterExpressionForPurchasedBefore(productsFilters.value.purchasedBefore),
  ]);
};

const { variationsSearchParams, updateSearchParams } = useProductVariations({
  productsFilters,
  itemsPerPage: variationsItemsPerPage,
  sort: variationsSort,
  variationsFilterExpression,
  customFilterBuilder: variationsFilterBuilder,
  customFilterBuilderDeps: [isB2cLayout, productsFilters],
});

const variationsPageNumber = computed(() => variationsSearchParams.value.page ?? 1);

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

const breadcrumbs = useBreadcrumbs(() => buildBreadcrumbs(product.value?.breadcrumbs));

const productComponentAnchor = shallowRef<HTMLElement | null>(null);
const productComponentAnchorIsVisible = useElementVisibility(productComponentAnchor);

async function sortVariations(sortInfo: ISortInfo): Promise<void> {
  variationSortInfo.value = sortInfo;

  updateSearchParams({ page: 1 });

  await fetchProducts(variationsSearchParams.value, isB2cLayout.value);
}

async function changeVariationsPage(pageNumber: number): Promise<void> {
  updateSearchParams({ page: pageNumber });

  await fetchProducts(variationsSearchParams.value, isB2cLayout.value);
}

async function applyFilters(newFilters: ProductsFiltersType): Promise<void> {
  await _applyFilters(newFilters);

  updateSearchParams({
    page: 1,
    filter: getFilterExpression([
      variationsFilterExpression.value,
      generateFilterExpressionFromFilters(newFilters.filters),
      getFilterExpressionForInStock(newFilters.inStock),
      getFilterExpressionForAvailableIn(newFilters.branches),
      getFilterExpressionForPurchasedBefore(newFilters.purchasedBefore),
    ]),
  });

  await fetchProducts(variationsSearchParams.value, isB2cLayout.value);
}

async function resetFacetFilters(): Promise<void> {
  await _resetFacetFilters();
  void applyFilters(productsFilters.value);
}

function hideFiltersSidebar(): void {
  _hideFiltersSidebar();
  const variationsFiltersButton = document.getElementById(`${productId.value}-variations-filters-button`);
  if (variationsFiltersButton) {
    variationsFiltersButton.focus();
  }
}

function checkLineItemId() {
  const cartItems = cart.value?.items;
  return cartItems?.some((item) => item.id === lineItemId);
}

useSeoMeta({
  title: () => (canSetMeta.value ? pageTitle.value : undefined),
  description: () => (canSetMeta.value ? seoDescription.value : undefined),
  ogUrl: () => (canSetMeta.value ? seoUrl.value : undefined),
  ogTitle: () => (canSetMeta.value ? pageTitle.value : undefined),
  ogDescription: () => (canSetMeta.value ? seoDescription.value : undefined),
  ogImage: () => (canSetMeta.value ? seoImageUrl.value : undefined),
  ogType: () => (canSetMeta.value ? "website" : undefined),
});

useSeoKeywords(() => (canSetMeta.value ? seoKeywords.value : undefined));

const MAX_PICKUP_LOCATIONS_COUNT = 1;

watch(
  productId,
  async () => {
    await fetchProduct(productId.value);
    if (product.value?.isConfigurable) {
      await fetchProductConfiguration();
    }

    const showVariations = productVariationsBlock.value && !productVariationsBlock.value?.hidden;
    const optionsBlock = productInfoSection.value?.blocks?.find((block) => block?.type === "product-options");
    const showOptions = optionsBlock && !optionsBlock?.hidden;

    if (product.value?.hasVariations && (showVariations || showOptions)) {
      await fetchProducts(variationsSearchParams.value, isB2cLayout.value);
    }

    if (xPickupEnabled.value && product.value) {
      await fetchPickupLocations({ productId: productId.value, first: MAX_PICKUP_LOCATIONS_COUNT });
    }

    updateLocalizedUrl(product.value?.slug);
  },
  { immediate: true },
);

const fetchedProductId = computed(() => product.value?.id);

watch(
  fetchedProductId,
  () => {
    if (fetchedProductId.value && product.value) {
      void pushHistoricalEvent({
        eventType: "click",
        productId: product.value.id,
        storeId: globals.storeId,
      });
    }
  },
  { immediate: true },
);

watch(
  [() => lineItemId, cart, loadingCart],
  () => {
    if (loadingCart.value && !(cart.value && lineItemId)) {
      return;
    }

    const isExist = checkLineItemId();
    if (!isExist) {
      void router.replace({ ...route, query: { ...route.query, [LINE_ITEM_ID_URL_SEARCH_PARAM]: undefined } });
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
