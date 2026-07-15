<template>
  <template v-if="isCollapsible">
    <ProductTitledBlock
      v-if="!model.hidden && description"
      :title="model.title || $t('shared.catalog.product_details.description_block_title')"
      icon="document-text"
    >
      <VcCollapsibleContent max-height="18.75rem" class="text-base text-neutral-600">
        <VcMarkdownRender :src="description" />
      </VcCollapsibleContent>
    </ProductTitledBlock>
  </template>

  <template v-else>
    <VcWidget
      v-if="!model.hidden && description"
      size="lg"
      :title="model.title || $t('shared.catalog.product_details.description_block_title')"
      prepend-icon="document-text"
    >
      <div class="text-base text-neutral-600">
        <VcMarkdownRender :src="description" />
      </div>
    </VcWidget>
  </template>
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
  isCollapsible?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  isCollapsible: true,
});

const description = computed<string | undefined>(() => props.product.description?.content);
</script>
