<template>
  <ProductTitledBlock
    v-if="product.assets?.length"
    icon="document-text"
    :title="model.title || $t('shared.catalog.product_details.assets_block_title')"
  >
    <ul class="ml-6 list-disc">
      <li v-for="(asset, index) in product.assets" :key="index">
        <a :href="asset.url" class="text-accent-600 hover:text-accent-700">
          {{ asset.name || asset.url }}
        </a>
      </li>
    </ul>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { ProductTitledBlock } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

defineProps<{
  product: Product;
  model: {
    title: string;
  };
}>();
</script>
