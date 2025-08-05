<template>
  <VcProductCard :background="false">
    <VcProductImage :img-src="item.imageUrl" :alt="item.product!.name" />

    <VcProductTitle lines-number="2" fix-height :to="link" :title="item.product!.name" @click="$emit('linkClick', $event)">
      {{ item.product!.name }}
    </VcProductTitle>

    <VcProductPrice
      :with-from-label="item.product!.hasVariations || item.product!.isConfigurable"
      :actual-price="price?.actual"
      :list-price="price?.list"
      single-line />

    <VcProductButton
      v-if="cartLineItem?.id"
      icon="arrow-up"
      :button-text="$t('pages.cart.move_to_cart')"
      @link-click="$emit('addToCart', cartLineItem!.id)" />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { useThemeContext } from "@/core/composables";
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

const { themeContext } = useThemeContext();

const item = toRef(props, "item");
const savedForLaterList = toRef(props, "savedForLaterList");

const price = computed(() => (item.value.product!.hasVariations ? item.value.product!.minVariationPrice : item.value.product!.price));
const link = computed<RouteLocationRaw>(() => getProductRoute(item.value.product!.id, item.value.product!.slug));
const cartLineItem = computed(() => savedForLaterList.value?.items.find((x) => x.product!.id === item.value.product!.id));
const countInCart = computed<number>(() => cartLineItem.value?.quantity || 0);

const quantity = ref(getInitialQuantity());

function getInitialQuantity() {
  if (countInCart.value) {
    return countInCart.value;
  }
  if (themeContext.value.settings.product_quantity_control === "stepper") {
    return 0;
  }
  return item.value.product!.minQuantity || 1;
}

watch(countInCart, (newCount) => {
  quantity.value = newCount || item.value.product!.minQuantity || 1;
});
</script>
