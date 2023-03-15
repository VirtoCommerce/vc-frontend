<template>
  <ProductTitledBlock
    v-if="product.description"
    class="mt-5"
    image-src="/static/images/description.svg"
    :title="model.title || $t('shared.catalog.product_details.description_block_title')"
  >
    <VcMarkdownRender :src="product.description?.content"></VcMarkdownRender>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { ProductTitledBlock } from "@/shared/catalog";
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
