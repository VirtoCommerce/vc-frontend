<template>
  <VcProductCard v-if="item.product" :background="false">
    <VcProductImage :img-src="item.imageUrl" :alt="item.product.name" />

    <VcProductTitle
      lines-number="2"
      fix-height
      :to="link"
      :target="browserTarget"
      :title="item.product.name"
      @click="$emit('linkClick', $event)"
    >
      {{ item.product.name }}
    </VcProductTitle>

    <VcProductPrice :actual-price="item.product.price.actual" :list-price="item.product.price.list" single-line />

    <VcProductButton
      v-if="item.id"
      icon="arrow-up"
      :button-text="$t('pages.cart.move_to_cart')"
      :loading="loading"
      @link-click="$emit('addToCart', item.id)"
    />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useBrowserTarget } from "@/core/composables";
import { getProductRoute } from "@/core/utilities";
import type { SavedForLaterListFragment, SavedForLaterLineItemFragment } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
  (event: "addToCart", lineItemId: string): void;
}

interface IProps {
  savedForLaterList: SavedForLaterListFragment | undefined;
  item: SavedForLaterLineItemFragment;
  loading?: boolean;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const item = toRef(props, "item");

const { browserTarget } = useBrowserTarget();

const link = computed<RouteLocationRaw | undefined>(
  () => item.value.product && getProductRoute(item.value.product.id, item.value.product.slug),
);
</script>
