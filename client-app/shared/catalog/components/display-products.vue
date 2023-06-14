<template>
  <div>
    <template v-if="loading">
      <component :is="skeletonComponent" v-for="i in itemsPerPage" :key="i" />
    </template>

    <template v-else>
      <component
        :is="cardComponent"
        v-for="(item, index) in products"
        :key="item.id + index"
        :product="item"
        @link-click="$emit('itemLinkClick', item, $event)"
      >
        <template #add-to-list-handler>
          <slot name="add-to-list-handler" v-bind="{ item }" />
        </template>
        <template #cart-handler>
          <slot name="cart-handler" v-bind="{ item }" />
        </template>
      </component>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import ProductCardGrid from "./product-card-grid.vue";
import ProductCardList from "./product-card-list.vue";
import ProductSkeletonGrid from "./product-skeleton-grid.vue";
import ProductSkeletonList from "./product-skeleton-list.vue";
import type { Product } from "@/core/api/graphql/types";

defineEmits<{ (eventName: "itemLinkClick", product: Product, globalEvent: PointerEvent): void }>();

const props = withDefaults(defineProps<IProps>(), {
  itemsPerPage: DEFAULT_PAGE_SIZE,
  products: () => [],
  viewMode: "grid",
});

interface IProps {
  loading: boolean;
  products?: Product[];
  itemsPerPage?: number;
  viewMode?: string;
}

const cardComponent = computed(() => (props.viewMode === "list" ? ProductCardList : ProductCardGrid));
const skeletonComponent = computed(() => (props.viewMode === "list" ? ProductSkeletonList : ProductSkeletonGrid));
</script>
