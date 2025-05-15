<template>
  <VcProductCard>
    <VcProductImage :img-src="product.imgSrc" :images="product.images" :alt="product.name" lazy>
      <BadgesWrapper>
        <PurchasedBeforeBadge v-if="product.isPurchased" />

        <DiscountBadge v-if="product.price" static :price="product.price" />
      </BadgesWrapper>
    </VcProductImage>

    <VcProductActions direction="vertical" with-background>
      <AddToList :product="product" />

      <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="product" />
    </VcProductActions>

    <VcProductTitle :title="product.name" :to="link" lines-number="2" fix-height @click="$emit('linkClick', $event)" />

    <VcProductPrice
      :actual-price="price?.actual"
      :list-price="price?.list"
      :with-from-label="product.hasVariations || product.isConfigurable"
    />

    <VcProductButton
      v-if="product.isConfigurable"
      :to="link"
      :button-text="$t('pages.catalog.customize_button')"
      icon="cube-transparent"
      :target="$cfg.details_browser_target || '_blank'"
    />

    <VcProductButton
      v-else-if="product.hasVariations"
      :to="link"
      :target="$cfg.details_browser_target || '_blank'"
      variant="outline"
      :button-text="$t('pages.catalog.variations_button', [(product.variations?.length || 0) + 1])"
    />

    <AddToCart v-else :product="product" />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getProductRoute } from "@/core/utilities";
import { AddToCart } from "@/shared/cart";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import DiscountBadge from "./discount-badge.vue";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";
import BadgesWrapper from "@/shared/catalog/components/badges-wrapper.vue";
import PurchasedBeforeBadge from "@/shared/catalog/components/purchased-before-badge.vue";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
}

interface IProps {
  product: Product;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const price = computed(() => (props.product.hasVariations ? props.product.minVariationPrice : props.product.price));

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>
