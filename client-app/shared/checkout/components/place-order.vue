<template>
  <ProceedTo
    :disabled="hasOnlyUnselectedLineItems || !isValidCheckout"
    test-id="checkout.place-order-button"
    @click="createOrderFromCart"
  >
    {{ $t("common.buttons.place_order") }}
  </ProceedTo>
</template>

<script setup lang="ts">
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

const { hasOnlyUnselectedLineItems } = useFullCart();
const { isValidCheckout, createOrderFromCart } = useCheckout();
</script>
