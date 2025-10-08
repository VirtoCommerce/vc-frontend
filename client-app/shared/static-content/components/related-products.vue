<template>
  <!-- Related products section -->
  <VcWidget
    v-if="relatedProducts?.length"
    :title="$t('pages.product.related_product_section_title')"
    prepend-icon="cube"
    size="lg"
  >
    <VcProductsGrid v-if="lg" short :columns="{ default: 2, xs: 3, sm: 4 }">
      <ProductCardRelated
        v-for="(item, index) in relatedProducts"
        :key="index"
        :product="item"
        @link-click="selectItem(item)"
      />
    </VcProductsGrid>

    <VcCarousel v-else :slides="relatedProducts" :options="relatedProductsCarouselOptions" navigation>
      <template #slide="{ slide: item }">
        <div class="h-full p-3">
          <ProductCardRelated class="h-full" :product="item" @link-click="selectItem(item)" />
        </div>
      </template>
    </VcCarousel>
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/core/composables";
import { BREAKPOINTS } from "@/core/constants";
import { extractNumberFromString } from "@/core/utilities";
import { ProductCardRelated } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  relatedProducts?: Product[];
  productId: string;
  productName: string;
}

const props = defineProps<IProps>();

const relatedProducts = toRef(props, "relatedProducts");

const relatedProductsListProperties = computed(() => ({
  item_list_id: "related_products",
  item_list_name: `${t("pages.product.related_product_section_title")} ${props.productName}`,
  related_id: props.productId,
  related_type: "product",
}));

const { t } = useI18n();
const breakpoints = useBreakpoints(BREAKPOINTS);
const { analytics } = useAnalytics();

const lg = breakpoints.smaller("lg");

const xlScreenWidth = extractNumberFromString(BREAKPOINTS.xl);

const relatedProductsCarouselOptions: ICarouselOptions = {
  slidesPerView: 5,
  slidesPerGroup: 5,
  breakpoints: {
    [xlScreenWidth]: {
      slidesPerView: 6,
      slidesPerGroup: 6,
    },
  },
};

function selectItem(item: Product) {
  analytics("selectItem", item, relatedProductsListProperties.value);
}

watch(
  relatedProducts,
  (relatedProductsValue) => {
    if (!relatedProductsValue?.length) {
      return;
    }

    analytics("viewItemList", relatedProductsValue, relatedProductsListProperties.value);
  },
  {
    immediate: true,
  },
);
</script>
