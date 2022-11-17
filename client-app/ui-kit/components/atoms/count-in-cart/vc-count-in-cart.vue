<template>
  <div
    v-if="countInCart > 0"
    class="py-0.5 px-[0.677rem] bg-[color:var(--color-add-to-cart-in-cart-bg)] text-[color:var(--color-add-to-cart-in-cart)] whitespace-nowrap rounded-full text-[13px] leading-5 lg:py-px lg:px-[0.53rem] lg:text-[11px]"
  >
    <span class="inline-block font-bold text-center">{{ countInCart }}</span>
    {{ $t("shared.cart.add_to_cart.errors.in_cart") }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { eagerComputed } from "@vueuse/core";
import { LineItemType } from "@/xapi/types";
import { useCart } from "@/shared/cart";

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
