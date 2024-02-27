<template>
  <VcWidget size="lg" class="max-md:-mx-4.5">
    <div class="flex flex-col lg:flex-row lg:gap-8 print:flex-row print:gap-4">
      <div class="flex-none lg:w-80 xl:w-[27.5rem] 2xl:w-[30rem] print:hidden">
        <ImageGallery :images="product.images">
          <template #badges>
            <DiscountBadge :price="product.price!" />
          </template>
        </ImageGallery>

        <ProductVideos class="mt-8 lg:mt-3" :videos="product.videos" />
      </div>

      <div class="hidden aspect-square w-40 flex-none print:block">
        <VcImage :src="product.imgSrc" class="w-full rounded border" />
      </div>

      <div v-if="model?.blocks?.length" class="mt-5 flex flex-col gap-6 lg:mt-0 lg:grow print:mt-5">
        <component
          :is="block.type"
          v-for="(block, index) in model.blocks"
          :key="block.id || index"
          :model="block"
          :product="product"
        />
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import type { PageContent } from "../types";
import type { Product } from "@/core/api/graphql/types";
import DiscountBadge from "@/shared/catalog/components/discount-badge.vue";
import ImageGallery from "@/shared/catalog/components/image-gallery.vue";
import ProductVideos from "@/shared/catalog/components/product-videos.vue";

interface IProps {
  product: Product;
  model: PageContent;
}

defineProps<IProps>();
</script>
