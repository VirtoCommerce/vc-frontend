<template>
  <BillingDetailsSection
    v-model:address-equals-shipping-address="billingAddressEqualsShippingAddress"
    :payment="payment"
    :disabled="loading"
    @change:address="onBillingAddressChange"
    @change:method="openSelectPaymentMethodModal"
  />
</template>

<script setup lang="ts">
import { BillingDetailsSection, useCheckout } from "@/shared/checkout";

const { billingAddressEqualsShippingAddress, loading, payment, openSelectPaymentMethodModal, onBillingAddressChange } =
  useCheckout();
</script>
