<template>
  <div v-if="!isMobile" class="text-sm mt-1">
    <span>Item #</span><span class="font-extrabold pl-1">{{ product.code }}</span>
  </div>
  <div class="flex flex-col md:flex-row md:space-x-6 mt-5">
    <div
      class="flex flex-grow flex-col lg:flex-row -mx-5 md:mx-0 lg:space-x-12 mb-6 p-6 bg-white border border-gray-100 rounded-md shadow-sm"
    >
      <div class="lg:w-1/3 mb-8 lg:mb-0">
        <VcImageGallery
          :src="product.imgSrc ?? ''"
          :images="product.images ?? []"
          :is-mobile="isMobile"
        ></VcImageGallery>
        <!-- Compare checkbox -->
        <div class="mt-8 hidden md:flex items-center text-sm cursor-pointer">
          <input
            type="checkbox"
            class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-cyan-700 checked:border-transparent focus:outline-none cursor-pointer"
          />
          <span class="ml-2">Compare</span>
        </div>
      </div>
      <div class="flex flex-col lg:w-2/3">
        <ProductTitledBlock class="mt-5" image-src="/static/images/technical_specs.svg" title="technical specs">
          <ProductProperties v-if="product.properties" :properties="product.properties"></ProductProperties>
        </ProductTitledBlock>
        <ProductTitledBlock
          v-if="product?.description"
          class="mt-5"
          image-src="/static/images/description.svg"
          title="Description"
        >
          <VcMarkdownRender :src="product?.description?.content" class="text-gray-500"></VcMarkdownRender>
        </ProductTitledBlock>
      </div>
    </div>
    <div class="flex-none md:w-80 lg:w-96 flex flex-col">
      <ProductPriceBlock :product="product">
        <div class="flex items-baseline justify-between text-sm">
          <div class="font-extrabold text-base">Your price:</div>
          <div>
            <!-- todo: extract a component for price and use it here -->
            <span class="font-extrabold text-green-700"><VcPriceDisplay :value="product.price?.actual" /></span
            >&nbsp;<span class="font-semibold hidden lg:inline-block">/ each</span>
          </div>
        </div>
        <div class="mt-7 md:mt-5">
          <AddToCart class="-mb-3" :product="product"></AddToCart>
        </div>
      </ProductPriceBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Product } from "@/core/api/graphql/types";
import { PropType } from "vue";
import { AddToCart } from "@/shared/cart";
import { VcMarkdownRender, VcImageGallery, VcPriceDisplay } from "@/components";
import { ProductProperties, ProductTitledBlock, ProductPriceBlock } from "@/shared/catalog";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});
</script>
