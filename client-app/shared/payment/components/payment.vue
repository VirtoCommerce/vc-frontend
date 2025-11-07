<template>
  <div class="p-5 md:p-6">
    <PaymentProcessingCyberSource
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
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
      @success="onPaymentResult(true)"
      @fail="onPaymentResult(false)"
    />
    <PaymentProcessingCyberSource
      v-else-if="paymentTypeName === 'CyberSourcePaymentMethod'"
      :order="placedOrder"
      @success="onPaymentResult(true)"
      @fail="onPaymentResult(false)"
    />
    <PaymentProcessingDatatrans
      v-else-if="paymentTypeName === 'DatatransPaymentMethod'"
      ref="datatrans"
      :order="order"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    />
    <ExtensionPointList
      v-else-if="
        paymentTypeName &&
        $canRenderExtensionPoint('paymentPage', 'payment-methods', {
          order: placedOrder,
          paymentTypeName: paymentTypeName,
        })
      "
      category="paymentPage"
      :order="placedOrder"
      :payment-type-name="paymentTypeName"
      @success="onPaymentResult(true)"
      @fail="onPaymentResult(false)"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { hide } from "@floating-ui/vue";
import { computed, onMounted, useTemplateRef, watch } from "vue";
import type { CartType, CustomerOrderType, PaymentType } from "@/core/api/graphql/types";
import PaymentProcessingCyberSource from "@/shared/payment/components/payment-processing-cyber-source.vue";
// import PaymentProcessingAuthorizeNet from "@/shared/payment/components/payment-processing-authorize-net.vue";
// import PaymentProcessingSkyflow from "@/shared/payment/components/payment-processing-skyflow.vue";
// import PaymentProcessingDatatrans from "@/shared/payment/components/payment-processing-datatrans.vue";

interface IProps {
  hidePaymentButton?: boolean;
  order?: CustomerOrderType;
  payment?: PaymentType;
  cart?: CartType;
  disabled?: boolean;
}

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

// const datatrans = useTemplateRef<typeof PaymentProcessingDatatrans>("datatrans");

const currentPayment = computed<PaymentInType | undefined>(() => {
  return props.payment || props.order?.inPayments[0]; // todo: take from cart?  || props.cart?.payments[0];
});
const paymentTypeName = computed<string | undefined>(
  () => currentPayment.value?.paymentMethod?.typeName || props.cart?.payments[0]?.paymentGatewayCode,
);

watch(paymentTypeName, () => {
  console.log("Payment type changed:", paymentTypeName.value);
});

async function onPaymentSuccess() {
  emit("success");
}

async function onPaymentFail() {
  emit("fail");
}

onMounted(() => {
  console.log("Payment component mounted with payment type:", paymentTypeName.value);
});
</script>
