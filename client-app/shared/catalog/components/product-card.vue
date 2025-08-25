<template>
  <VcProductCard :view-mode="viewMode" :data-product-sku="product.code" border data-test-id="product-card">
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

    <VcProductTitle :title="product.name" :to="link" lines-number="2" fix-height />

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
      :actual-price="product.minVariationPrice?.actual ?? product.price.actual"
      :list-price="product.minVariationPrice?.list ?? product.price.list"
      :with-from-label="product.hasVariations"
      :single-line="viewMode === 'grid'"
    />

    <component
      :is="getComponent(CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON)"
      v-if="
        isComponentRegistered(CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON) &&
        shouldRenderComponent(CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON, product)
      "
      :product="product"
      is-text-shown
      v-bind="getComponentProps(CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON)" 
    />

    <VcProductButton
      v-else-if="product.isConfigurable"
      :to="getProductRoute(product.id, product.slug)"
      :link-text="$t('pages.catalog.customize_button')"
      :link-to="getProductRoute(product.id, product.slug)"
      :button-text="$t('pages.catalog.customize_button')"
      icon="cube-transparent"
      :target="browserTarget || $cfg.details_browser_target || '_blank'"
      @link-click="$emit('linkClick', product, $event)"
    />

    <VcProductButton
      v-else-if="product.hasVariations"
      :to="link"
      :link-text="$t('pages.catalog.show_on_a_separate_page')"
      :link-to="link"
      :button-text="$t('pages.catalog.variations_button', [variationsCount])"
      :target="browserTarget || $cfg.details_browser_target || '_blank'"
      @link-click="$emit('linkClick', product, $event)"
    />

    <AddToCart v-else :product="product" :reserved-space="viewMode === 'grid'">
      <InStock
        :is-in-stock="product.availabilityData?.isInStock"
        :is-digital="product.productType === ProductType.Digital"
        :quantity="product.availabilityData?.availableQuantity"
      />

      <CountInCart :product-id="product.id" />
    </AddToCart>
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { ProductType } from "@/core/enums";
import { getProductRoute, getPropertiesGroupedByName } from "@/core/utilities";
import {
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import { AddToCart } from "@/shared/cart";
import { useProducts } from "@/shared/catalog";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME } from "@/shared/catalog/constants/product";
import { useCustomProductComponents } from "@/shared/common/composables";
import { CUSTOM_PRODUCT_COMPONENT_IDS } from "@/shared/common/constants";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import BadgesWrapper from "./badges-wrapper.vue";
import CountInCart from "./count-in-cart.vue";
import DiscountBadge from "./discount-badge.vue";
import InStock from "./in-stock.vue";
import PurchasedBeforeBadge from "./purchased-before-badge.vue";
import type { Product } from "@/core/api/graphql/types";
import type { BrowserTargetType } from "@/core/types";

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
  browserTarget: "_blank",
});

const { isComponentRegistered, getComponent, shouldRenderComponent, getComponentProps } = useCustomProductComponents();

const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);

const link = computed(() => getProductRoute(props.product.id, props.product.slug));

const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product))
    .filter((property) => property.name !== PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME)
    .slice(0, 3),
);

const badgeSize = computed(() => {
  return props.viewMode === "grid" ? "lg" : "md";
});

const { productsFilters } = useProducts();

const variationsCount = computed(() => {
  if (!productsFilters.value.inStock)
    return (props.product.variations?.length || 0) + 1;

  let result = 0;
  if (props.product.availabilityData?.isInStock && props.product.availabilityData.isBuyable) {
    result++;
  }
  result += props.product.variations?.filter(x => x.availabilityData?.isInStock && x.availabilityData?.isBuyable)?.length || 0;
  return result;
});
</script>
