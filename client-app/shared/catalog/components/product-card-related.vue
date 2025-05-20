<template>
  <VcProductCard :background="false">
    <template #media>
      <VcProductImage :img-src="product.imgSrc" :images="product.images" :alt="product.name" />

      <VcProductActions direction="vertical" with-background>
        <AddToList :product="product" />

        <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="product" class="relative" />
      </VcProductActions>
    </template>

    <VcProductTitle
      lines-number="2"
      fix-height
      :to="link"
      :title="product.name"
      target="_blank"
      @click="$emit('linkClick', $event)"
    >
      {{ product.name }}
    </VcProductTitle>

    <VcProductPrice
      :actual-price="price?.actual"
      :list-price="price?.list"
      :with-from-label="product.hasVariations || product.isConfigurable"
      single-line
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

    <AddToCart v-else :product="product" reserved-space />
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
