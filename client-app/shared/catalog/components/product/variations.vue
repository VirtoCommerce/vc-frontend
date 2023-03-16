<template>
  <ProductTitledBlock
    v-if="product.variations?.length"
    class="mt-5"
    image-src="/static/images/variations_customize.svg"
    :title="model.title || $t('shared.catalog.product_details.variations_block_title')"
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
import type { PropType } from "vue";

defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },

  model: {
    type: Object,
    required: true,
  },
});
</script>
