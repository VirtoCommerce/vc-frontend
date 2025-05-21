<template>
  <VcProductCard border>
    <VcProductImage :img-src="product.imgSrc" :images="product.images" :alt="product.name" />

    <VcProductActions direction="vertical" with-background>
      <AddToList :product="product" />
      <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="product" class="relative" />
    </VcProductActions>

    <VcProductTitle
      class="text-sm"
      :to="link"
      :title="product.name"
      target="_blank"
      @click="$emit('linkClick', $event)"
    >
      {{ product.name }}
    </VcProductTitle>

    <VcProductPrice
      class="h-9 text-lg"
      :actual-price="price?.actual"
      :list-price="price?.list"
      :with-from-label="product.hasVariations || product.isConfigurable"
    />

    <VcProductButton
      v-if="product.isConfigurable"
      :to="link"
      :button-text="$t('pages.catalog.customize_button')"
      icon="cube-transparent"
      target="_blank"
    />

    <VcProductButton
      v-else-if="product.hasVariations"
      :to="link"
      target="_blank"
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
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

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
