<template>
  <div class="p-5 md:p-6">
    <!-- <PaymentProcessingAuthorizeNet
      :order="order"
      :hide-payment-button="hidePaymentButton"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    /> -->
    <!-- <PaymentProcessingSkyflow
      v-else-if="paymentTypeName === 'SkyflowPaymentMethod'"
      :order="placedOrder"
      @success="onPaymentResult(true)"
      @fail="onPaymentResult(false)"
    />
    <PaymentProcessingCyberSource
      v-else-if="paymentTypeName === 'CyberSourcePaymentMethod'"
      :order="placedOrder"
      @success="onPaymentResult(true)"
      @fail="onPaymentResult(false)"
    /> -->
    <PaymentProcessingDatatrans
      v-if="paymentTypeName === 'DatatransPaymentMethod'"
      ref="datatrans"
      :order="order"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    />
    <div>
      {{ props }}
    </div>
    <!-- <ExtensionPointList
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
import { computed, onMounted, useTemplateRef, watch } from "vue";
import PaymentProcessingDatatrans from "./payment-processing-datatrans.vue";
import type { CartType, CustomerOrderType, PaymentInType } from "@/core/api/graphql/types";

interface IProps {
  hidePaymentButton?: boolean;
  order?: CustomerOrderType;
  payment?: PaymentInType;
  cart?: CartType;
  disabled?: boolean;
}

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const datatrans = useTemplateRef<typeof PaymentProcessingDatatrans>("datatrans");

console.log(datatrans);

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
