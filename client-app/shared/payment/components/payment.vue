<template>
  <div class="p-5 md:p-6">
    <PaymentProcessingCyberSource
      v-if="paymentTypeName === 'CyberSourcePaymentMethod'"
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
      @validate="onValidate"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    />
    <!-- <PaymentProcessingAuthorizeNet
      v-if="paymentTypeName === 'AuthorizeNetPaymentMethod'"
      :hide-payment-button="hidePaymentButton"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    />
    <PaymentProcessingSkyflow
      v-else-if="paymentTypeName === 'SkyflowPaymentMethod'"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    />
    <PaymentProcessingCyberSource
      v-else-if="paymentTypeName === 'CyberSourcePaymentMethod'"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    />
    <PaymentProcessingDatatrans
      v-else-if="paymentTypeName === 'DatatransPaymentMethod'"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    />
    <ExtensionPointList
      v-else-if="
        paymentTypeName &&
        $canRenderExtensionPoint('paymentPage', 'payment-methods', {
          order: order ?? null,
          paymentTypeName: paymentTypeName,
        })
      "
      category="paymentPage"
      :order="order ?? null"
      :payment-type-name="paymentTypeName"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { IPaymentMethodParameters, IPaymentMethodEmits } from "./types";
import PaymentProcessingCyberSource from "@/shared/payment/components/payment-processing-cyber-source.vue";
// import PaymentProcessingAuthorizeNet from "@/shared/payment/components/payment-processing-authorize-net.vue";
// import PaymentProcessingSkyflow from "@/shared/payment/components/payment-processing-skyflow.vue";
// import PaymentProcessingDatatrans from "@/shared/payment/components/payment-processing-datatrans.vue";

const emit = defineEmits<IPaymentMethodEmits>();
const props = defineProps<IPaymentMethodParameters>();

const paymentTypeName = computed<string | undefined>(
  () =>
    props.payment?.paymentGatewayCode ||
    props.order?.inPayments[0].paymentMethod?.typeName ||
    props.cart?.payments[0]?.paymentGatewayCode,
);

function onValidate(isValid: boolean) {
  emit("validate", isValid);
}

async function onPaymentSuccess() {
  emit("success");
}

async function onPaymentFail() {
  emit("fail");
}
</script>
