<template>
  <div class="flex flex-col lg:flex-row p-6 lg:space-x-12 bg-white">
    <div class="lg:w-1/3 mb-4 lg:mb-0">
      <VcImageGallery :product="product">
        <template #badges>
          <DiscountBadge :price="product.price!" />
        </template>
      </VcImageGallery>

      <AddToCompare v-if="$cfg.product_compare_enabled" :product="product" class="mt-8 inline-flex" />
    </div>

    <div v-if="section && section.blocks" class="flex flex-col lg:w-2/3">
      <component v-for="item in section.blocks" :key="item.id" :is="item.type" :model="item" :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Product } from "@/xapi/types";
import { PageContent } from "@/core/types";
import { PropType } from "vue";
import { AddToCompare } from "@/shared/compare";
import { DiscountBadge } from "@/shared/catalog";

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
