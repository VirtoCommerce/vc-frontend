<template>
  <ProductTitledBlock
    v-if="product.variations?.length"
    class="mt-5"
    image-src="/static/images/variations_customize.svg"
    :title="model.title || $t('shared.catalog.product_details.variations_block_title')"
  >
    <ProductVariationCard class="mb-5" :variation="product" />

    <div v-for="(variation, i) in product.variations" :key="variation?.id ?? i">
      <ProductVariationCard v-if="variation" class="mb-5" :variation="variation" :product="product" />
    </div>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { Product } from "@/xapi/types";
import { PropType } from "vue";
import { ProductTitledBlock, ProductVariationCard } from "@/shared/catalog";

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
