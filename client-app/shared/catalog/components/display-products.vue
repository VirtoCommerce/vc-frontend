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
        @link-click="$emit('item-link-click', item, $event)"
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
import { ProductCardGrid, ProductCardList, ProductSkeletonGrid, ProductSkeletonList } from "@/shared/catalog";
import { computed, PropType } from "vue";
import { Product } from "@/xapi/types";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";

defineEmits<{ (eventName: "item-link-click", product: Product, globalEvent: PointerEvent): void }>();

const props = defineProps({
  loading: Boolean,

  itemsPerPage: {
    type: Number,
    default: DEFAULT_PAGE_SIZE,
  },

  products: {
    type: Array as PropType<Product[]>,
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
