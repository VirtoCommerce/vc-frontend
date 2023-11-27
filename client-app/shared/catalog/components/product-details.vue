<template>
  <div class="flex flex-col bg-white p-6 print:flex-row print:space-x-12 print:p-0 lg:flex-row lg:space-x-12">
    <div class="mb-4 flex-none print:w-1/3 lg:mb-0 lg:w-1/3">
      <ImageGallery :images="product.images">
        <template #badges>
          <DiscountBadge :price="product.price!" />
        </template>
      </ImageGallery>

      <AddToCompare v-if="$cfg.product_compare_enabled" :product="product" class="mt-8 inline-flex print:hidden" />
    </div>

    <div v-if="section?.blocks?.length" class="flex flex-col gap-5 print:w-2/3 lg:grow">
      <component
        :is="block.type"
        v-for="(block, index) in section.blocks"
        :key="block.id || index"
        :model="block"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AddToCompare } from "@/shared/compare";
import DiscountBadge from "./discount-badge.vue";
import ImageGallery from "./image-gallery.vue";
import type { Product } from "@/core/api/graphql/types";
import type { PageContent } from "@/shared/static-content";

interface IProps {
  product: Product;
  section?: PageContent;
}

defineProps<IProps>();
</script>
