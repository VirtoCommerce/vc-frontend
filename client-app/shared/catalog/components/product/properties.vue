<template>
  <ProductTitledBlock
    class="mt-5"
    v-if="!model.hidden"
    image-src="/static/images/technical_specs.svg"
    :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
  >
    <ProductProperties v-if="product.properties" :properties="product.properties" />
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Product } from "@/xapi/types";
import { ProductProperties, ProductTitledBlock } from "@/shared/catalog";

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
