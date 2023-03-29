<template>
  <ProductTitledBlock
    v-if="!model.hidden && product.variations?.length"
    :title="model.title || $t('shared.catalog.product_details.variations_block_title')"
    image-src="/static/images/variations_customize.svg"
  >
    <ProductVariationCard :variation="product" class="mb-5" />

    <div v-for="variation in product.variations" :key="variation.code">
      <ProductVariationCard :variation="variation" class="mb-5" />
    </div>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { ProductTitledBlock, ProductVariationCard } from "@/shared/catalog";
import type { Product } from "@/xapi/types";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

defineProps<IProps>();
</script>
