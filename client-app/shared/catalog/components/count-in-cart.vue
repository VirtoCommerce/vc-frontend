<template>
  <VcChip v-if="countInCart > 0" :size="size" variant="outline-dark" color="neutral" rounded>
    {{ countInCart }}
    {{ $t("shared.cart.add_to_cart.errors.in_cart") }}
  </VcChip>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import { computed } from "vue";
import { useCart } from "@/shared/cart";
import type { LineItemType } from "@/core/api/graphql/types";

export interface IProps {
  productId?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<IProps>(), {
  size: "xs",
});

const { cart } = useCart();

const lineItemInCart = computed<LineItemType | undefined>(
  () => cart.value?.items?.find((item) => item.productId === props.productId),
);
const countInCart = eagerComputed<number>(() => lineItemInCart.value?.quantity || 0);
</script>
