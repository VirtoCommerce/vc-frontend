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

    <!--
      TODO: Add support for Datatrans, and an extension point for cart payments when available.
      Unlike the checkout/order payment pages (paymentPage/orderPaymentPage extension points),
      this cart-stage payment step has no extension point yet, so Skyflow is still imported
      directly here — a known, intentional exception to modules/README.md's "Core never imports
      a module" rule until this extension point exists (VCST-5757).
    -->
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { IPaymentMethodParameters } from "./types";
import PaymentProcessingAuthorizeNet from "@/shared/payment/components/payment-processing-authorize-net.vue";
import PaymentProcessingCyberSource from "@/shared/payment/components/payment-processing-cyber-source.vue";

const props = defineProps<IPaymentMethodParameters>();

// Loaded only when the Skyflow method is the active payment type, so the skyflow-js SDK
// (~80 KB gzip) stays out of the eager bundle shared across checkout/account routes.
const PaymentProcessingSkyflow = defineAsyncComponent(
  () => import("@/modules/skyflow/components/payment-processing-skyflow.vue"),
);

const paymentTypeName = computed<string | undefined>(
  () =>
    props.payment?.paymentGatewayCode ||
    props.order?.inPayments[0].paymentMethod?.typeName ||
    props.cart?.payments[0]?.paymentGatewayCode,
);
</script>
