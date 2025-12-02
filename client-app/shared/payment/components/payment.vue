<template>
  <div class="p-5 md:p-6">
    <PaymentProcessingCyberSource
      v-if="paymentTypeName === 'CyberSourcePaymentMethod'"
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
    />

    <!-- TODO: Add support for AuthorizeNet, Skyflow, Datatrans, and extension point payment methods for cart payments when available. -->
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { IPaymentMethodParameters } from "./types";
import PaymentProcessingCyberSource from "@/shared/payment/components/payment-processing-cyber-source.vue";

const props = defineProps<IPaymentMethodParameters>();

const paymentTypeName = computed<string | undefined>(
  () =>
    props.payment?.paymentGatewayCode ||
    props.order?.inPayments[0].paymentMethod?.typeName ||
    props.cart?.payments[0]?.paymentGatewayCode,
);
</script>
