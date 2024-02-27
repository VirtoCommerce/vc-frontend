<template>
  <div v-if="product.assets?.length" class="mt-5 flex flex-col lg:flex-row lg:space-x-8">
    <div class="-mx-5 md:mx-0 lg:w-8/12 xl:w-9/12">
      <ProductTitledBlock
        class="mt-5"
        icon="document-text"
        :title="model.title || $t('shared.catalog.product_details.assets_block_title')"
      >
        <ul class="ml-6 list-disc">
          <li v-for="(asset, index) in product.assets" :key="index">
            <a :href="asset.url" class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]">
              {{ asset.name || asset.url }}
            </a>
          </li>
        </ul>
      </ProductTitledBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "@/core/api/graphql/types";
import ProductTitledBlock from "@/shared/catalog/components/product-titled-block.vue";

defineProps<{
  product: Product;
  model: {
    title: string;
  };
}>();
</script>
