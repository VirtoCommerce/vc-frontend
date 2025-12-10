<template>
  <ProceedTo :disabled="isDisabled" @click="createOrderFromCart">
    {{ $t("common.buttons.place_order") }}
  </ProceedTo>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";
import { usePayment } from "@/shared/payment/composables";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

const { hasOnlyUnselectedLineItems } = useFullCart();
const { paymentMethod, isValidCheckout, createOrderFromCart } = useCheckout();
const { isCanFinalizePayment } = usePayment();

const isDisabled = computed(() => {
  return (
    hasOnlyUnselectedLineItems.value ||
    !isValidCheckout.value ||
    (paymentMethod.value?.allowCartPayment && !isCanFinalizePayment.value)
  );
});
</script>
