<template>
  <div>
    <PaymentProcessingCyberSource
      v-if="paymentTypeName === 'CyberSourcePaymentMethod'"
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
    />

    <PaymentProcessingAuthorizeNet
      v-else-if="paymentTypeName === 'AuthorizeNetPaymentMethod'"
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
    />

    <PaymentProcessingSkyflow
      v-else-if="paymentTypeName === 'SkyflowPaymentMethod'"
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
    />

    <!-- TODO: Add support for Datatrans, and extension point payment methods for cart payments when available. -->
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { IPaymentMethodParameters } from "./types";
import PaymentProcessingAuthorizeNet from "@/shared/payment/components/payment-processing-authorize-net.vue";
import PaymentProcessingCyberSource from "@/shared/payment/components/payment-processing-cyber-source.vue";

// Loaded only when the Skyflow method is the active payment type, so the skyflow-js SDK
// (~80 KB gzip) stays out of the eager bundle shared across checkout/account routes.
const PaymentProcessingSkyflow = defineAsyncComponent(
  () => import("@/shared/payment/components/payment-processing-skyflow.vue"),
);

const props = defineProps<IPaymentMethodParameters>();

const paymentTypeName = computed<string | undefined>(
  () =>
    props.payment?.paymentGatewayCode ||
    props.order?.inPayments[0].paymentMethod?.typeName ||
    props.cart?.payments[0]?.paymentGatewayCode,
);
</script>
