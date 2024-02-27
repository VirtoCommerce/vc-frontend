<template>
  <ProceedTo :disabled="hasOnlyUnselectedLineItems || !isValidCheckout" @click="createOrderFromCart">
    {{ $t("common.buttons.place_order") }}
  </ProceedTo>
</template>

<script setup lang="ts">
import { useFullCart } from "@/shared/cart/composables/useFullCart";
import { useCheckout } from "@/shared/checkout/composables";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

const { hasOnlyUnselectedLineItems } = useFullCart();
const { isValidCheckout, createOrderFromCart } = useCheckout();
</script>
