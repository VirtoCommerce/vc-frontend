<template>
  <ProductTitledBlock
    v-if="!model.hidden && description"
    :title="model.title || $t('shared.catalog.product_details.description_block_title')"
    image-src="/static/images/description.svg"
  >
    <VcCollapsibleContent max-height="12rem">
      <VcMarkdownRender :src="description" />
    </VcCollapsibleContent>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ProductTitledBlock from "../product-titled-block.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

const props = defineProps<IProps>();

const description = computed<string | undefined>(() => props.product.description?.content);
</script>
