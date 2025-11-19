<template>
  <VcProductCard
    :view-mode="viewMode"
    :data-product-sku="product.code"
    border
    data-test-id="product-card"
    ref="productCard"
    :class="['product-card', `product-card--${viewMode}`]"
  >
    <template #media>
      <VcProductImage
        :images="viewMode === 'grid' ? product.images : []"
        :img-src="product.imgSrc"
        :alt="product.name"
        :lazy="lazy"
        :to="link"
      >
        <BadgesWrapper>
          <PurchasedBeforeBadge v-if="product.isPurchased" :size="badgeSize" square />

          <DiscountBadge v-if="product.price" static :price="product.price" :size="badgeSize" />
        </BadgesWrapper>
      </VcProductImage>

      <VcProductActions
        :direction="viewMode === 'grid' ? 'vertical' : 'horizontal'"
        :with-background="viewMode === 'grid'"
      >
        <AddToList :product="product" />

        <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="product" />
      </VcProductActions>
    </template>

    <VcProductTitle
      :title="product.name"
      :to="link"
      lines-number="2"
      fix-height
      @click="$emit('linkClick', product, $event)"
    />

    <VcProductVendor v-if="$cfg.vendor_enabled">
      {{ product.vendor?.name }}
    </VcProductVendor>

    <VcProductProperties v-if="cardType !== 'short'">
      <VcProperty v-for="(property, i) in properties" :key="i" :label="property.label">
        {{ property.value }}
      </VcProperty>

      <VcProperty
        v-if="productReviewsEnabled && product.rating"
        :label="$t('shared.catalog.product_card.product_rating')"
      >
        <VcRating size="xs" :value="product.rating.value" :review-count="product.rating.reviewCount" />
      </VcProperty>
    </VcProductProperties>

    <VcProductPrice
      :actual-price="actualPrice"
      :list-price="listPrice"
      :with-from-label="product.hasVariations"
      :single-line="viewMode === 'grid'"
    />

    <ExtensionPoint
      v-if="$canRenderExtensionPoint('productCard', EXTENSION_NAMES.productCard.cardButton, product)"
      :name="EXTENSION_NAMES.productCard.cardButton"
      category="productCard"
      :product="product"
      is-text-shown
    />

    <VcProductButton
      v-else-if="product.isConfigurable"
      :to="getProductRoute(product.id, product.slug)"
      :link-text="$t('pages.catalog.customize_button')"
      :link-to="getProductRoute(product.id, product.slug)"
      :button-text="$t('pages.catalog.customize_button')"
      icon="cube-transparent"
      :target="browserTarget || browserTargetFromSetting"
      @link-click="$emit('linkClick', product, $event)"
    />

    <template v-else-if="product.hasVariations">
      <VcProductButton
        class="product-card__variations-button"
        :link-text="$t('pages.catalog.show_on_a_separate_page')"
        :link-to="link"
        :button-text="$t('pages.catalog.variations_button', [variationsCount])"
        :append-icon="isExpanded ? 'chevron-up' : 'chevron-down'"
        :loading="fetchingVariations"
        @link-click="handleVariationsClick"
      />

      <VcProductButton
        class="product-card__variations-link-button"
        :to="link"
        :link-text="$t('pages.catalog.show_on_a_separate_page')"
        :link-to="link"
        :button-text="$t('pages.catalog.variations_button', [variationsCount])"
        :target="browserTarget || browserTargetFromSetting"
        @link-click="$emit('linkClick', product, $event)"
      />
    </template>

    <AddToCartSimple v-else :product="product" :reserved-space="viewMode === 'grid'">
      <InStock
        :is-in-stock="product.availabilityData?.isInStock"
        :is-digital="product.productType === ProductType.Digital"
        :quantity="product.availabilityData?.availableQuantity"
      />

      <CountInCart :product-id="product.id" />
    </AddToCartSimple>

    <template v-if="viewMode === 'list'" #expanded-content>
      <div v-show="isExpanded" class="product-card__variants-wrapper">
        <div
          v-if="fetchingVariations && (!variations || variations.length === 0)"
          class="product-card__variants-loader"
        >
          <VcLoader />
        </div>

        <template v-else>
          <VcTypography tag="h5" class="product-card__variants-title" text-transform="none">
            {{ $t("pages.catalog.available_variations", variationsCount) }}
          </VcTypography>

          <VariationsDefault
            :variations="variations ?? []"
            :page-number="variationsPageNumber"
            :pages-count="variationsPagesCount"
            @change-page="changeVariationsPage"
          />
        </template>
      </div>
    </template>
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed, toRef, ref, nextTick, useTemplateRef } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { useBrowserTarget } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BrowserTargetType, ProductType } from "@/core/enums";
import { getProductRoute, getPropertiesGroupedByName } from "@/core/utilities";
import {
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import { useProductVariations } from "@/shared/catalog/composables/useProductVariations";
import { useProducts } from "@/shared/catalog/composables/useProducts";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME } from "@/shared/catalog/constants/product";
import { EXTENSION_NAMES } from "@/shared/common/constants";
import { AddToCompareCatalog } from "@/shared/compare/components";
import { AddToList } from "@/shared/wishlists";
import BadgesWrapper from "./badges-wrapper.vue";
import CountInCart from "./count-in-cart.vue";
import DiscountBadge from "./discount-badge.vue";
import InStock from "./in-stock.vue";
import VariationsDefault from "./product/variations-default.vue";
import PurchasedBeforeBadge from "./purchased-before-badge.vue";
import type { Product } from "@/core/api/graphql/types";
import AddToCartSimple from "@/shared/cart/components/add-to-cart-simple.vue";

interface IEmits {
  (eventName: "linkClick", product: Product, globalEvent: MouseEvent): void;
}

interface IProps {
  loading?: boolean;
  product: Product;
  viewMode?: "grid" | "list";
  browserTarget?: BrowserTargetType;
  cardType?: "full" | "short";
  lazy?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  viewMode: "grid",
  browserTarget: BrowserTargetType.BLANK,
});

const product = toRef(props, "product");
const isExpanded = ref(false);
const productCard = useTemplateRef("productCard");

const { browserTarget: browserTargetFromSetting } = useBrowserTarget();

const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);

const productId = computed(() => product.value.id);

const link = computed(() => getProductRoute(productId.value, props.product.slug));

const actualPrice = computed(() =>
  product.value.hasVariations
    ? (product.value.minVariationPrice?.actual ?? product.value.price.actual)
    : product.value.price.actual,
);
const listPrice = computed(() =>
  product.value.hasVariations
    ? (product.value.minVariationPrice?.list ?? product.value.price.list)
    : product.value.price.list,
);

const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product))
    .filter((property) => property.name !== PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME)
    .slice(0, 3),
);

const badgeSize = computed(() => {
  return props.viewMode === "grid" ? "lg" : "md";
});

const {
  products: variations,
  pagesCount: variationsPagesCount,
  productsFilters,
  fetchingProducts: fetchingVariations,
  fetchProducts: fetchVariationsProducts,
} = useProducts({
  initialFetchingState: false,
});

const variationsLoaded = ref(false);

const variationsFilterExpression = computed(() => `productfamilyid:${productId.value} is:product,variation`);

const { variationsSearchParams, updateSearchParams } = useProductVariations({
  productsFilters,
  variationsFilterExpression,
});

const variationsPageNumber = computed(() => variationsSearchParams.value.page ?? 1);

async function loadVariations() {
  if (!variationsLoaded.value) {
    await fetchVariationsProducts(variationsSearchParams.value);
    variationsLoaded.value = true;
  }
}

async function changeVariationsPage(pageNumber: number) {
  updateSearchParams({ page: pageNumber });
  await fetchVariationsProducts(variationsSearchParams.value);
}

async function handleVariationsClick() {
  isExpanded.value = !isExpanded.value;

  if (isExpanded.value && !variationsLoaded.value) {
    await loadVariations();
  }

  if (isExpanded.value) {
    await nextTick();
    const cardElement = productCard.value?.$el as HTMLElement | null;
    if (cardElement) {
      const headerHeightVar = getComputedStyle(document.documentElement).getPropertyValue(
        "--vc-layout-sidebar-offset-top",
      );
      const headerHeight = headerHeightVar ? parseInt(headerHeightVar, 10) : 0;

      const elementPosition = cardElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }
}

const variationsCount = computed(() => {
  if (!productsFilters.value.inStock) {
    return (props.product.variations?.length || 0) + 1;
  }

  let result = 0;
  if (props.product.availabilityData?.isInStock && props.product.availabilityData.isBuyable) {
    result++;
  }
  result +=
    props.product.variations?.filter((x) => x.availabilityData?.isInStock && x.availabilityData?.isBuyable)?.length ||
    0;

  return result;
});
</script>

<style scoped lang="scss">
.product-card {
  $list: "";

  &--list {
    $list: &;
  }

  &__variations-button {
    @apply hidden;

    #{$list} & {
      @container (min-width: theme("containers.3xl")) {
        @apply block;
      }
    }
  }

  &__variations-link-button {
    @apply block;

    #{$list} & {
      @container (min-width: theme("containers.3xl")) {
        @apply hidden;
      }
    }
  }

  &__variants-wrapper {
    @apply border-t border-neutral-200 p-6 pt-4 hidden;

    #{$list} & {
      @container (min-width: theme("containers.3xl")) {
        @apply block;
      }
    }
  }

  &__variants-loader {
    @apply flex justify-center py-8;
  }

  &__variants-title {
    @apply pb-3 leading-5;
  }
}
</style>
