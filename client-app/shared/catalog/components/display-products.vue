<template>
  <div
    :class="[
      'display-products',
      {
        'display-products--list': viewMode === 'list',
        'display-products--grid': viewMode === 'grid',
      },
    ]"
  >
    <template v-if="loading">
      <component :is="skeletonComponent" v-for="i in itemsPerPage" :key="i" />
    </template>

    <template v-else>
      <VcProductCard v-for="(item, index) in products" :key="item.id + index" :view-mode="viewMode" border>
        <template #media>
          <VcProductImage
            :images="viewMode === 'grid' ? item.images : []"
            :img-src="item.imgSrc"
            :alt="item.name"
            :lazy="index >= lazyCardsCount"
            :to="getProductRoute(item.id, item.slug)"
          >
            <DiscountBadge :price="item.price!" />
          </VcProductImage>

          <VcProductActions
            :direction="viewMode === 'grid' ? 'vertical' : 'horizontal'"
            :with-background="viewMode === 'grid'"
          >
            <AddToList :product="item" />

            <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="item" />
          </VcProductActions>
        </template>

        <VcProductTitle :title="item.name" :to="getProductRoute(item.id, item.slug)" lines-number="2" fix-height />

        <VcProductVendor v-if="$cfg.vendor_enabled">
          {{ item.vendor?.name }}
        </VcProductVendor>

        <VcProductProperties v-if="cardType !== 'short'">
          <VcProperty
            v-for="(property, i) in Object.values(
              getPropertiesGroupedByName(item.properties ?? [], PropertyType.Product),
            ).slice(0, 3)"
            :key="i"
            :label="property.label"
          >
            {{ property.value }}
          </VcProperty>

          <VcProperty
            v-if="productReviewsEnabled && item.rating"
            :label="$t('shared.catalog.product_card.product_rating')"
          >
            <VcRating size="xs" :value="item.rating.value" :review-count="item.rating.reviewCount" />
          </VcProperty>
        </VcProductProperties>

        <VcProductPrice
          :actual-price="item.minVariationPrice?.actual ?? item.price.actual"
          :list-price="item.minVariationPrice?.list ?? item.price.list"
          :with-from-label="item.hasVariations"
          :single-line="viewMode === 'grid'"
          :align="viewMode === 'list' ? 'end' : 'start'"
        />

        <component
          :is="getComponent(CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON)"
          v-if="
            isComponentRegistered(CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON) &&
            shouldRenderComponent(CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON, item)
          "
          :product="item"
          v-bind="getComponentProps(CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON)"
        />

        <VcProductButton
          v-else-if="item.isConfigurable"
          :to="getProductRoute(item.id, item.slug)"
          :link-text="$t('pages.catalog.customize_button')"
          :link-to="getProductRoute(item.id, item.slug)"
          :button-text="$t('pages.catalog.customize_button')"
          icon="cube-transparent"
          :target="browserTarget || $cfg.details_browser_target || '_blank'"
          @link-click="$emit('itemLinkClick', item, $event)"
        />

        <VcProductButton
          v-else-if="item.hasVariations"
          :to="getProductRoute(item.id, item.slug)"
          :link-text="$t('pages.catalog.show_on_a_separate_page')"
          :link-to="getProductRoute(item.id, item.slug)"
          :button-text="$t('pages.catalog.variations_button', [(item.variations?.length || 0) + 1])"
          :target="browserTarget || $cfg.details_browser_target || '_blank'"
          @link-click="$emit('itemLinkClick', item, $event)"
        />

        <AddToCart v-else :product="item" :reserved-space="viewMode === 'grid'">
          <InStock
            :is-in-stock="item.availabilityData?.isInStock"
            :is-digital="item.productType === ProductType.Digital"
            :quantity="item.availabilityData?.availableQuantity"
          />

          <CountInCart :product-id="item.id" />
        </AddToCart>
      </VcProductCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BREAKPOINTS, DEFAULT_PAGE_SIZE } from "@/core/constants";
import { ProductType } from "@/core/enums";
import { getProductRoute, getPropertiesGroupedByName } from "@/core/utilities";
import {
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import { AddToCart } from "@/shared/cart";
import { useCustomProductComponents } from "@/shared/common/composables";
import { CUSTOM_PRODUCT_COMPONENT_IDS } from "@/shared/common/constants";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import CountInCart from "./count-in-cart.vue";
import DiscountBadge from "./discount-badge.vue";
import InStock from "./in-stock.vue";
import ProductSkeletonGrid from "./product-skeleton-grid.vue";
import ProductSkeletonList from "./product-skeleton-list.vue";
import type { Product } from "@/core/api/graphql/types";
import type { BrowserTargetType } from "@/core/types";

interface IEmits {
  (eventName: "itemLinkClick", product: Product, globalEvent: MouseEvent): void;
}

interface IProps {
  loading: boolean;
  products?: Product[];
  itemsPerPage?: number;
  viewMode?: "grid" | "list";
  browserTarget?: BrowserTargetType;
  cardType?: "full" | "short";
  columnsAmountTablet?: string;
  columnsAmountDesktop?: string;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  itemsPerPage: DEFAULT_PAGE_SIZE,
  products: () => [],
  viewMode: "grid",
  columnsAmountTablet: "3",
  columnsAmountDesktop: "4",
});

const breakpoints = useBreakpoints(BREAKPOINTS);
const { isComponentRegistered, getComponent, shouldRenderComponent, getComponentProps } = useCustomProductComponents();

const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);

const skeletonComponent = computed(() => (props.viewMode === "list" ? ProductSkeletonList : ProductSkeletonGrid));

const columns = computed(() => ({
  null: 1,
  xs: 2,
  md: Number(props.columnsAmountTablet),
  xl: Number(props.columnsAmountDesktop),
}));

const lazyCardsCount = computed(() => {
  if (props.viewMode === "grid") {
    return getGridLazyCardsCount();
  }
  if (props.viewMode == "list") {
    return getListLazyCardsCount();
  }
  return 0;
});

function getGridLazyCardsCount() {
  const rowCount = 2;
  if (breakpoints.isSmaller("xs")) {
    return columns.value.null;
  }
  if (breakpoints.isInBetween("xs", "md")) {
    return columns.value.xs * rowCount;
  }
  if (breakpoints.isInBetween("md", "xl")) {
    return columns.value.md * rowCount;
  }
  if (breakpoints.isGreaterOrEqual("xl")) {
    return columns.value.xl * rowCount;
  }
  return 0;
}

function getListLazyCardsCount() {
  if (breakpoints.isSmaller("xs")) {
    return 2;
  }
  if (breakpoints.isInBetween("xs", "sm")) {
    return 4;
  }
  if (breakpoints.isInBetween("sm", "lg")) {
    return 6;
  }
  if (breakpoints.isInBetween("lg", "2xl")) {
    return 4;
  }
  if (breakpoints.isGreaterOrEqual("2xl")) {
    return 5;
  }
  return 0;
}
</script>

<style lang="scss">
.display-products {
  --vc-product-title-font-size: theme("fontSize.sm");
  --columnsAmountTablet: v-bind(props.columnsAmountTablet);
  --columnsAmountDesktop: v-bind(props.columnsAmountDesktop);

  &--grid {
    @apply grid gap-5;

    @media (min-width: theme("screens.xs")) {
      @apply grid-cols-2;
    }

    @media (min-width: theme("screens.md")) {
      grid-template-columns: repeat(var(--columnsAmountTablet), minmax(0, 1fr));
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-columns: repeat(var(--columnsAmountDesktop), minmax(0, 1fr));
    }
  }

  &--list {
    @apply -mx-5 divide-y space-y-2;

    @media (min-width: theme("screens.md")) {
      @apply divide-y-0 mx-0 space-y-3.5;
    }
  }
}
</style>
