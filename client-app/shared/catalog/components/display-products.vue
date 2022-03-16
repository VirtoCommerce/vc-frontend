<template>
  <div>
    <template v-if="loading">
      <component :is="skeletonComponent" v-for="i in itemsPerPage" :key="i" />
    </template>

    <template v-else>
      <component :is="cardComponent" v-for="(item, index) in products" :key="item.id + index" :product="item">
        <template #cart-handler>
          <slot name="cart-handler" v-bind="{ item }" />
        </template>
      </component>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ProductCardGrid, ProductCardList, ProductSkeletonGrid, ProductSkeletonList } from "@/shared/catalog";
import { computed, PropType } from "vue";
import { Product as ProductType } from "@core/api/graphql/types";
import { defaultPageSize } from "@core/constants";

const props = defineProps({
  loading: Boolean,

  itemsPerPage: {
    type: Number,
    default: defaultPageSize,
  },

  products: {
    type: Array as PropType<ProductType[]>,
    default: () => [],
  },

  viewMode: {
    type: String as PropType<"grid" | "list">,
    default: "grid",
  },
});

const cardComponent = computed(() => (props.viewMode === "list" ? ProductCardList : ProductCardGrid));
const skeletonComponent = computed(() => (props.viewMode === "list" ? ProductSkeletonList : ProductSkeletonGrid));
</script>
