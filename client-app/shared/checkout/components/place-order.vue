<template>
  <ExtensionPoint v-if="isExternalCheckout" :name="EXTENSION_NAMES.checkout.placeOrder" category="checkout" />

  <ProceedTo v-else :disabled="isDisabled" @click="createOrderFromCart">
    {{ $t("common.buttons.place_order") }}
  </ProceedTo>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUser } from "@/shared/account";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables/useCheckout";
import { useCheckoutGuards } from "@/shared/checkout/composables/useCheckoutGuards";
import { useExternalCheckout } from "@/shared/checkout/composables/useExternalCheckout";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";
import { usePayment } from "@/shared/payment/composables";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

const { hasOnlyUnselectedLineItems } = useFullCart();
const { canPayFromCart, isValidCheckout, createOrderFromCart } = useCheckout();
const { canPlaceOrder } = useCheckoutGuards();
const { isCanFinalizePayment } = usePayment();
const { isAuthenticated } = useUser();
const { isExternalCheckout } = useExternalCheckout();

const isDisabled = computed(() => {
  return (
    hasOnlyUnselectedLineItems.value ||
    !isValidCheckout.value ||
    !canPlaceOrder.value ||
    (isAuthenticated.value && canPayFromCart.value && !isCanFinalizePayment.value)
  );
});
</script>
