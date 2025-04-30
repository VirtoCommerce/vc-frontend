<template>
  <!-- Related products section -->
  <VcWidget
    v-if="relatedProducts?.length"
    :title="$t('pages.product.related_product_section_title')"
    prepend-icon="cube"
    size="lg"
    class="order-last max-md:-mx-4.5"
  >
    <VcProductsGrid v-if="lg" short :columns="{ default: 2, xs: 2, sm: 3, md: 3 }">
      <ProductCardRelated
        v-for="(item, index) in relatedProducts"
        :key="index"
        :product="item"
        @link-click="analytics('selectItem', item)"
      />
    </VcProductsGrid>

    <VcCarousel v-else :slides="relatedProducts" :options="relatedProductsCarouselOptions" navigation>
      <template #slide="{ slide: item }">
        <div class="h-full p-2">
          <ProductCardRelated class="h-full" :product="item" @link-click="analytics('selectItem', item)" />
        </div>
      </template>
    </VcCarousel>
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { useAnalytics } from "@/core/composables";
import { BREAKPOINTS } from "@/core/constants";
import { extractNumberFromString } from "@/core/utilities";
import { ProductCardRelated } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  relatedProducts?: Product[];
}
defineProps<IProps>();

const breakpoints = useBreakpoints(BREAKPOINTS);
const { analytics } = useAnalytics();

const lg = breakpoints.smaller("lg");

const xlScreenWidth = extractNumberFromString(BREAKPOINTS.xl);

const relatedProductsCarouselOptions: CarouselOptions = {
  slidesPerView: 4,
  slidesPerGroup: 4,
  breakpoints: {
    [xlScreenWidth]: {
      slidesPerView: 5,
      slidesPerGroup: 5,
    },
  },
};
</script>
