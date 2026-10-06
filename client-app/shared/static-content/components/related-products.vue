<template>
  <!-- Related products section -->
  <VcWidget
    v-if="relatedProducts?.length"
    :title="$t('pages.product.related_product_section_title')"
    prepend-icon="cube"
    size="lg"
    data-name="product-list"
    data-list-id="related_products"
    :data-list-name="`${$t('pages.product.related_product_section_title')} ${productName}`"
    :data-related-id="productId"
    data-related-type="product"
  >
    <VcProductsGrid v-if="lg" short :columns="{ default: 2, xs: 3, sm: 4 }">
      <ProductCardRelated v-for="(item, index) in relatedProducts" :key="index" :product="item" />
    </VcProductsGrid>

    <VcCarousel v-else :slides="relatedProducts" :options="relatedProductsCarouselOptions" navigation>
      <template #slide="{ slide: item }">
        <div class="h-full p-3">
          <ProductCardRelated class="h-full" :product="item" />
        </div>
      </template>
    </VcCarousel>
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { extractNumberFromString } from "@/core/utilities";
import { ProductCardRelated } from "@/shared/catalog";
import { BREAKPOINTS } from "@/ui-kit/constants";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  relatedProducts?: Product[];
  productId: string;
  productName: string;
}

defineProps<IProps>();

const breakpoints = useBreakpoints(BREAKPOINTS);

const lg = breakpoints.smaller("lg");

const xlScreenWidth = extractNumberFromString(BREAKPOINTS.xl);
const xxlScreenWidth = extractNumberFromString(BREAKPOINTS["2xl"]);

const relatedProductsCarouselOptions: ICarouselOptions = {
  slidesPerView: 5,
  slidesPerGroup: 5,
  breakpoints: {
    [xlScreenWidth]: {
      slidesPerView: 6,
      slidesPerGroup: 6,
    },
    [xxlScreenWidth]: {
      slidesPerView: 7,
      slidesPerGroup: 7,
    },
  },
};
</script>
