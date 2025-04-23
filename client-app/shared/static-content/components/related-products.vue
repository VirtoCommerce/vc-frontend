<template>
  <!-- Related products section -->
  <VcWidget
    v-if="relatedProducts?.length"
    :title="$t('pages.product.related_product_section_title')"
    prepend-icon="cube"
    size="lg"
    class="order-last max-md:-mx-4.5"
  >
    <div v-if="lg" class="-mb-2 flex flex-wrap items-stretch gap-x-7 gap-y-4">
      <ProductCardRelated
        v-for="(item, index) in mobileProducts"
        :key="index"
        :product="item"
        class="w-[calc((100%-1.75rem)/2)] sm:w-[calc((100%-2*1.75rem)/3)] md:w-[calc((100%-1.75rem)/2)]"
        @link-click="
          analytics('selectItem', item, {
            item_list_id: `related_products_${props.productId}`,
            item_list_name: 'related_products',
          })
        "
      />
    </div>

    <VcCarousel v-else :slides="relatedProducts" :options="relatedProductsCarouselOptions" navigation>
      <template #slide="{ slide: item }">
        <div class="h-full px-4 py-3 xl:px-3">
          <ProductCardRelated
            class="h-full"
            :product="item"
            @link-click="
              analytics('selectItem', item, {
                item_list_id: `related_products_${props.productId}`,
                item_list_name: 'related_products',
              })
            "
          />
        </div>
      </template>
    </VcCarousel>
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { useAnalytics } from "@/core/composables";
import { BREAKPOINTS } from "@/core/constants";
import { extractNumberFromString } from "@/core/utilities";
import { ProductCardRelated } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  relatedProducts?: Product[];
  productId: string;
}
const props = defineProps<IProps>();

const breakpoints = useBreakpoints(BREAKPOINTS);
const { analytics } = useAnalytics();

const sm = breakpoints.smaller("sm");
const md = breakpoints.smaller("md");
const lg = breakpoints.smaller("lg");

const lgScreenWidth = extractNumberFromString(BREAKPOINTS.lg);
const xlScreenWidth = extractNumberFromString(BREAKPOINTS.xl);

const mobileProductsNumber = computed(() => {
  if (sm.value) {
    return 4;
  }

  if (md.value) {
    return 3;
  }

  if (lg.value) {
    return 2;
  }

  return 4;
});

const mobileProducts = computed(() => props.relatedProducts?.slice(0, mobileProductsNumber.value));

const relatedProductsCarouselOptions: CarouselOptions = {
  slidesPerView: 4,
  slidesPerGroup: 4,
  breakpoints: {
    [lgScreenWidth]: {
      slidesPerView: 3,
      slidesPerGroup: 3,
    },
    [xlScreenWidth]: {
      slidesPerView: 4,
      slidesPerGroup: 4,
    },
  },
};
</script>
