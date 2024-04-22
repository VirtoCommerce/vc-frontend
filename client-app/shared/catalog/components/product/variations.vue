<template>
  <VcWidget
    v-if="!model.hidden && product.variations?.length"
    class="variations"
    size="lg"
    :title="model.title || $t('shared.catalog.product_details.variations_block_title')"
    prepend-icon="adjustments"
  >
    <VcLineItems :with-header="false">
      <template #line-items>
        <VcLineItem
          v-for="variation in [product, ...product.variations]"
          :key="variation.code"
          with-image
          with-price
          with-properties
          :image-url="variation.images[0].url"
          :name="variation.name"
          :properties="variation.properties.slice(0, 3)"
          :list-price="variation.price.list"
          :actual-price="variation.price.actual"
        >
          <AddToCart :product="variation" />
        </VcLineItem>
      </template>
    </VcLineItems>
  </VcWidget>
</template>

<script setup lang="ts">
import { AddToCart } from "@/shared/cart";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

defineProps<IProps>();
</script>
