<template>
  <VcWidget size="lg" class="max-md:-mx-4.5">
    <div class="flex flex-col print:flex-row print:gap-4 lg:flex-row lg:gap-8">
      <div class="flex-none print:hidden lg:w-80 xl:w-[27.5rem] 2xl:w-[30rem]">
        <ImageGallery :images="product.images">
          <template #badges>
            <DiscountBadge :price="product.price!" />
          </template>
        </ImageGallery>
      </div>

      <div class="hidden aspect-square w-40 flex-none print:block">
        <VcImage :src="product.imgSrc" class="w-full rounded border" />
      </div>

      <div v-if="model?.blocks?.length" class="mt-5 flex flex-col gap-6 print:mt-5 lg:mt-0 lg:grow">
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
import { ImageGallery, DiscountBadge } from "@/shared/catalog";
import type { PageContent } from "../types";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  model: PageContent;
}

defineProps<IProps>();
</script>
