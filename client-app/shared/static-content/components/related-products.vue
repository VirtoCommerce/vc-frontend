<template>
  <!-- Related products section -->
  <div v-show="relatedProducts.length" class="mt-10 flex flex-col lg:mt-6 lg:flex-row lg:space-x-8">
    <div class="-mx-5 flex flex-col md:mx-0 lg:w-8/12 xl:w-9/12">
      <VcSection
        :title="$t('pages.product.related_product_section_title')"
        icon-url="/static/images/checkout/products.svg"
        class="rounded-none border shadow-sm md:rounded"
      >
        <VcCarousel
          :slides="relatedProducts"
          :options="relatedProductsCarouselOptions"
          :pagination="isMobile"
          :navigation="!isMobile"
          class="mb-8 px-6 [--navigation-offset:3rem] lg:mb-2"
        >
          <template #slide="{ slide }">
            <CarouselProductCard :product="slide" class="mb-6" />
          </template>
        </VcCarousel>
      </VcSection>
    </div>

    <div class="flex flex-col lg:w-4/12 xl:w-3/12"></div>
  </div>
</template>

<script setup lang="ts">
import { CarouselProductCard } from "@/shared/catalog";
import type { Product } from "@/xapi/types";
import type { PropType } from "vue";

defineProps({
  relatedProducts: {
    type: Array as PropType<Product[]>,
    required: true,
  },

  isMobile: {
    type: Boolean,
  },
});

const relatedProductsCarouselOptions: CarouselOptions = {
  spaceBetween: 30,
  slidesPerView: 2,
  slidesPerGroup: 2,
  breakpoints: {
    // 640: /* sm */ {},
    768: /* md */ {
      slidesPerView: 3,
      slidesPerGroup: 3,
      spaceBetween: 30,
    },
    1024: /* lg */ {
      slidesPerView: 4,
      slidesPerGroup: 4,
      spaceBetween: 6,
    },
    1280: /* xl */ {
      slidesPerView: 5,
      slidesPerGroup: 5,
      spaceBetween: 6,
    },
    // 1536: /* 2xl */ {},
  },
};
</script>
