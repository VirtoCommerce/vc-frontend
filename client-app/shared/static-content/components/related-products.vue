<template>
  <!-- Related products section -->
  <div v-show="relatedProducts.length" class="mt-5 flex flex-col print:hidden lg:flex-row">
    <div class="-mx-5 print:mx-0 print:grow lg:mx-0 lg:w-full xl:w-9/12 xl:pe-8">
      <VcSectionWidget :title="$t('pages.product.related_product_section_title')" icon="cube">
        <div v-if="isMobile" class="flex flex-wrap items-stretch gap-x-7 gap-y-8 px-2">
          <ProductCardRelated
            v-for="(item, index) in relatedProducts.slice(0, 4)"
            :key="index"
            :product="item"
            class="w-[calc((100%-1.75rem)/2)] sm:w-[calc((100%-2*1.75rem)/3)] md:w-[calc((100%-3*1.75rem)/4)]"
            @link-click="ga.selectItem(item)"
          />
        </div>

        <VcCarousel v-else class="-mt-3" :slides="relatedProducts" :options="relatedProductsCarouselOptions" navigation>
          <template #slide="{ slide: item }">
            <div class="h-full px-2 py-3">
              <ProductCardRelated class="h-full" :product="item" @link-click="ga.selectItem(item)" />
            </div>
          </template>
        </VcCarousel>
      </VcSectionWidget>
    </div>

    <div class="hidden flex-none xl:block xl:w-3/12"></div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { useGoogleAnalytics } from "@/core/composables";
import { BREAKPOINTS } from "@/core/constants";
import { ProductCardRelated } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  relatedProducts: Product[];
}
defineProps<IProps>();

const breakpoints = useBreakpoints(BREAKPOINTS);
const ga = useGoogleAnalytics();

const isMobile = breakpoints.smaller("lg");

const relatedProductsCarouselOptions: CarouselOptions = {
  spaceBetween: 16,
  slidesPerView: 4,
  slidesPerGroup: 4,
  breakpoints: {
    1024: {
      spaceBetween: 0,
    },
    1500: {
      spaceBetween: 16,
    },
  },
};
</script>
