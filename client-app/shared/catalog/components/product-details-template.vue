<template>
  <div class="flex flex-grow flex-col lg:flex-row p-6 lg:space-x-12 bg-white">
    <div class="relative lg:w-1/3 mb-4 lg:mb-0">
      <VcImageGallery :src="product.imgSrc ?? ''" :images="product.images ?? []" :is-mobile="isMobile" />

      <div
        v-if="discount"
        class="absolute z-10 top-0 right-0 px-2 pt-1 pb-1.5 rounded-bl bg-[color:var(--color-sale-badge-bg)] text-white text-xs font-extrabold"
      >
        {{ discount }}
      </div>

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
import { useBreakpoints, breakpointsTailwind, computedEager } from "@vueuse/core";
import { AddToCompare } from "@/shared/compare";
import { getProductDiscountLabel } from "../utils";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
  section: {
    type: Object as PropType<PageContent>,
    required: true,
  },
});

const discount = computedEager<string | null>(() => getProductDiscountLabel(props.product.price!));
</script>
