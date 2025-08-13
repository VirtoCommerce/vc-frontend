<template>
  <Cart :cart-id="cartId" :blocks-to-hide hide-breadcrumbs :title="$t('common.buttons.buy_now')" />
</template>

<script setup lang="ts">
import Cart from "@/shared/cart/components/cart.vue";

interface IProps {
  cartId: string;
}

defineProps<IProps>();

const blocksToHide = ["quotes", "recently-browsed-products"];
</script>
