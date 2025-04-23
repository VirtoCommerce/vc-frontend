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
import { toRef, watch } from "vue";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { ProductCardRecommended } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";

const props = defineProps<IProps>();

const LIST_NAME = "recommended_products";

interface IProps {
  recommendedProducts?: Product[];
  title: string;
  model: string;
  productId: string;
}
const recommendedProducts = toRef(props, "recommendedProducts");

const { analytics } = useAnalytics();

watch(
  recommendedProducts,
  () => {
    if (!recommendedProducts.value?.length) {
      return;
    }

    analytics("viewItemList", recommendedProducts.value, {
      item_list_name: `${LIST_NAME}_${props.model.toLowerCase()}`,
      item_list_id: `${LIST_NAME}_${props.productId}`,
    });
  },
  {
    immediate: true,
  },
);

const selectItemEvent = (item: Product) => {
  analytics("selectItem", item, {
    item_list_id: `${LIST_NAME}_${props.productId}`,
    item_list_name: `${LIST_NAME}_${props.model.toLowerCase()}`,
  });
};
</script>
