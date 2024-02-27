<template>
  <ProductTitledBlock
    v-if="!model.hidden && product.variations?.length"
    :title="model.title || $t('shared.catalog.product_details.variations_block_title')"
    icon="adjustments"
  >
    <div class="space-y-5">
      <ProductVariationCard :variation="product" />

      <template v-for="variation in product.variations" :key="variation.code">
        <ProductVariationCard :variation="variation" />
      </template>
    </div>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import type { Product } from "@/core/api/graphql/types";
import ProductTitledBlock from "@/shared/catalog/components/product-titled-block.vue";
import ProductVariationCard from "@/shared/catalog/components/product-variation-card.vue";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

defineProps<IProps>();
</script>
