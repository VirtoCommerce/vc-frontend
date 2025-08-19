<template>
  <ProceedTo
    :disabled="hasOnlyUnselectedLineItems || !isValidCheckout"
    test-id="checkout.place-order-button"
    :cart-id="cartId"
    @click="createOrderFromCart"
  >
    {{ $t("common.buttons.place_order") }}
  </ProceedTo>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

interface IProps {
  cartId?: string;
}

const props = defineProps<IProps>();

const cartId = toRef(props, "cartId");

const { hasOnlyUnselectedLineItems } = useFullCart(cartId.value);
const { isValidCheckout, createOrderFromCart } = useCheckout(cartId.value);
</script>
