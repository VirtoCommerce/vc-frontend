<template>
  <VcWidget v-if="recommendedProducts?.length" :title="title" prepend-icon="cube" size="lg">
    <VcProductsGrid short>
      <ProductCardRecommended
        v-for="(item, index) in recommendedProducts"
        :key="index"
        :product="item"
        @link-click="selectItemEvent(item)"
      />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import { toRef, watch, computed } from "vue";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { ProductCardRecommended } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

const props = defineProps<IProps>();

interface IProps {
  recommendedProducts?: Product[];
  title: string;
  model: string;
  productId: string;
  productName: string;
}
const recommendedProducts = toRef(props, "recommendedProducts");

const { analytics } = useAnalytics();

const recommendedProductsListProperties = computed(() => ({
  item_list_id: `recommended_products_${props.model}`,
  item_list_name: `${props.title} ${props.productName}`,
  related_id: props.productId,
  related_type: "product",
}));

function selectItemEvent(item: Product) {
  analytics("selectItem", item, recommendedProductsListProperties.value);
}

watch(
  recommendedProducts,
  () => {
    if (!recommendedProducts.value?.length) {
      return;
    }

    analytics("viewItemList", recommendedProducts.value, recommendedProductsListProperties.value);
  },
  {
    immediate: true,
  },
);
</script>
