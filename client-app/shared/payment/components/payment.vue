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

    <!-- TODO: Add support for Datatrans at the cart-payment stage. -->

    <ExtensionPointList
      v-else-if="paymentTypeName"
      category="cartPayment"
      :condition-params="{ paymentTypeName }"
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { IPaymentMethodParameters } from "./types";
import PaymentProcessingAuthorizeNet from "@/shared/payment/components/payment-processing-authorize-net.vue";
import PaymentProcessingCyberSource from "@/shared/payment/components/payment-processing-cyber-source.vue";

const props = defineProps<IPaymentMethodParameters>();

const paymentTypeName = computed<string | undefined>(
  () =>
    props.payment?.paymentGatewayCode ||
    props.order?.inPayments[0].paymentMethod?.typeName ||
    props.cart?.payments[0]?.paymentGatewayCode,
);
</script>
