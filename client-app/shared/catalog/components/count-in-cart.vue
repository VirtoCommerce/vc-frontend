<template>
  <VcChip v-if="countInCart > 0" :size="size" variant="outline-dark" color="neutral" rounded>
    <VcIcon name="cart" />

    <span class="inline-block min-w-3 text-center">
      {{ countInCart }}
    </span>
  </VcChip>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import { computed } from "vue";
import { useShortCart } from "@/shared/cart/composables";

export interface IProps {
  productId?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<IProps>(), {
  size: "sm",
});

const { cart } = useShortCart();

const lineItemInCart = computed(() => cart.value?.items.find((item) => item.productId === props.productId));
const countInCart = eagerComputed<number>(() => lineItemInCart.value?.quantity ?? 0);
</script>
