<template>
  <div class="flex flex-col bg-white p-6 lg:flex-row lg:space-x-12">
    <div class="mb-4 lg:mb-0 lg:w-1/3">
      <VcImageGallery :product="product">
        <template #badges>
          <DiscountBadge :price="product.price!" />
        </template>
      </VcImageGallery>

      <AddToCompare v-if="$cfg.product_compare_enabled" :product="product" class="mt-8 inline-flex" />
    </div>

    <div v-if="section?.blocks?.length" class="flex flex-col lg:w-2/3">
      <component
        :is="block.type"
        v-for="(block, index) in section.blocks"
        :key="block.id || index"
        :model="block"
        :product="product"
        class="mb-5 last:mb-0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AddToCompare } from "@/shared/compare";
import DiscountBadge from "./discount-badge.vue";
import type { PageContent } from "@/shared/static-content";
import type { Product } from "@/xapi/types";

interface IProps {
  product: Product;
  section?: PageContent;
}

defineProps<IProps>();
</script>
