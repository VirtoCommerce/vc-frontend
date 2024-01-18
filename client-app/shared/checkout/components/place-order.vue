<template>
  <ProceedTo :disabled="!isValidCheckout" @click="createOrderFromCart">
    {{ $t("common.buttons.place_order") }}
  </ProceedTo>
</template>

<script setup lang="ts">
import { useCheckout } from "@/shared/checkout/composables";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

const { isValidCheckout, createOrderFromCart } = useCheckout();
</script>
