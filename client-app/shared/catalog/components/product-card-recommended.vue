<template>
  <VcProductCard v-track-item="product" data-name="product-card" :background="false">
    <VcProductImage :img-src="product.imgSrc" :alt="product.name" />

    <VcProductTitle
      data-name="product-link"
      lines-number="2"
      fix-height
      :to="link"
      :title="product.name"
      :target="browserTarget"
    >
      {{ product.name }}
    </VcProductTitle>

    <VcProductVendor>{{ product.vendor?.name }}</VcProductVendor>

    <VcProductPrice
      :with-from-label="product.hasVariations || product.isConfigurable"
      :actual-price="price?.actual"
      :list-price="price?.list"
      single-line
    />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBrowserTarget } from "@/core/composables";
import { getProductRoute } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  product: Product;
}

const props = defineProps<IProps>();

const { browserTarget } = useBrowserTarget();

const price = computed(() => (props.product.hasVariations ? props.product.minVariationPrice : props.product.price));

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>
