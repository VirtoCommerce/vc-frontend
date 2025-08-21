<template>
  <VcWidget
    :title="$t('pages.cart.saved_for_later')"
    prepend-icon="bookmark"
    size="lg">
    <VcProductsGrid short>
      <CartItemForLater
        v-for="(item, index) in savedForLaterList?.items"
        :key="index"
        :item="item"
        :saved-for-later-list="savedForLaterList"
        :background="false"
        @link-click="selectItemEvent(item.product)"
        @add-to-cart="(lineItemId) => $emit('addToCart', lineItemId)" />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import type { SavedForLaterListFragment } from "@/core/api/graphql/types";
import CartItemForLater from "@/shared/cart/components/cart-item-for-later.vue";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
  (event: "addToCart", lineItemId: string): void;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  savedForLaterList: SavedForLaterListFragment | undefined;
}

const savedForLaterList = toRef(props, "savedForLaterList");

function selectItemEvent(item?: SavedForLaterListFragment['items'][number]['product']) {
  if(!item) {
    return;
  }

  // Analytics tracking is now handled automatically by the Analytics Beacon
}
</script>
