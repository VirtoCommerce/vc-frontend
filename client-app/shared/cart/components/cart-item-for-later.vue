<template>
  <VcProductCard :background="false">
    <VcProductImage :img-src="item.imageUrl" :alt="item.product!.name" />

    <VcProductTitle lines-number="2" fix-height :to="link" :title="item.product!.name" @click="$emit('linkClick', $event)">
      {{ item.product!.name }}
    </VcProductTitle>

    <VcProductPrice
      :actual-price="item.product!.price?.actual"
      :list-price="item.product!.price?.list"
      single-line />

    <VcProductButton
      v-if="item?.id"
      icon="arrow-up"
      :button-text="$t('pages.cart.move_to_cart')"
      @link-click="$emit('addToCart', item!.id)" />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { getProductRoute } from "@/core/utilities";
import type { CartType, LineItemType } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
  (event: "addToCart", lineItemId: string): void;
}

interface IProps {
  savedForLaterList: CartType | undefined;
  item: LineItemType;
}

defineEmits<IEmits>();

const props = defineProps<IProps>(); 

const item = toRef(props, "item"); 
 
const link = computed<RouteLocationRaw>(() => getProductRoute(item.value.product!.id, item.value.product!.slug));
</script>
