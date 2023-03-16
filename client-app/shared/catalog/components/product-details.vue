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

    <div v-if="section && section.blocks" class="flex flex-col lg:w-2/3">
      <component :is="item.type" v-for="item in section.blocks" :key="item.id" :model="item" :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DiscountBadge } from "@/shared/catalog";
import { AddToCompare } from "@/shared/compare";
import type { PageContent } from "@/shared/static-content";
import type { Product } from "@/xapi/types";
import type { PropType } from "vue";

defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },

  section: {
    type: Object as PropType<PageContent>,
    required: true,
  },
});
</script>
