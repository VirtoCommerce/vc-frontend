<template>
  <div
    v-if="countInCart > 0"
    class="whitespace-nowrap rounded-full bg-[color:var(--color-add-to-cart-in-cart-bg)] px-[0.677rem] py-0.5 text-[13px] leading-5 text-[color:var(--color-add-to-cart-in-cart)] lg:px-[0.53rem] lg:py-px lg:text-[11px]"
  >
    <span class="inline-block text-center font-bold">{{ countInCart }}</span>
    {{ $t("shared.cart.add_to_cart.errors.in_cart") }}
  </div>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import { computed } from "vue";
import { useCart } from "@/shared/cart";
import type { LineItemType } from "@/xapi/types";

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
});

const { cart } = useCart();

const lineItemInCart = computed<LineItemType | undefined>(() =>
  cart.value?.items?.find((item) => item.productId === props.productId)
);
const countInCart = eagerComputed<number>(() => lineItemInCart.value?.quantity || 0);
</script>
