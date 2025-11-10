<template>
  <div class="p-5 md:p-6">
    <PaymentProcessingCyberSource
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
      :init-payment="initCurrentPayment"
      :authorize-payment="authorizeCurrentPayment"
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
import { computed, onMounted, watch } from "vue";
import { authorizePayment, initializePayment, initializeCartPayment } from "@/core/api/graphql";
import type { IPaymentMethodExpose } from "./types";
import type {
  CartType,
  CustomerOrderType,
  InputAuthorizePaymentType,
  InputInitializeCartPaymentType,
  InputInitializePaymentType,
  PaymentType,
} from "@/core/api/graphql/types";
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
defineExpose<IPaymentMethodExpose>();

// const datatrans = useTemplateRef<typeof PaymentProcessingDatatrans>("datatrans");

// const currentPayment = computed<PaymentInType | PaymentType | undefined>(() => {
//   return props.payment || props.order?.inPayments[0] || props.cart?.payments[0];
// });
const paymentTypeName = computed<string | undefined>(
  () =>
    props.payment?.paymentGatewayCode ||
    props.order?.inPayments[0].paymentMethod?.typeName ||
    props.cart?.payments[0]?.paymentGatewayCode,
);

async function initCurrentPayment(payload?: Partial<InputInitializePaymentType | InputInitializeCartPaymentType>) {
  if (props.order) {
    const parameters = {
      orderId: props.order.id,
      paymentId: props.order.inPayments[0].id,
      ...payload,
    };
    return await initializePayment(parameters);
  } else if (props.payment || props.cart) {
    const payment = props.payment || props.cart!.payments[0];
    const parameters = {
      cartId: props.cart ? props.cart.id : undefined,
      paymentId: payment.id,
      ...payload,
    };
    return await initializeCartPayment(parameters);
  }
  throw new Error("Either order, payment, or cart must be provided to initialize payment.");
}

async function authorizeCurrentPayment(payload?: Partial<InputAuthorizePaymentType>) {
  return await authorizePaymentWithOrder(payload, props.order);
}

async function authorizePaymentWithOrder(payload?: Partial<InputAuthorizePaymentType>, order?: CustomerOrderType) {
  const orderToPayment = order || props.order;

  if (!orderToPayment) {
    throw new Error("Order must be provided to authorize payment.");
  }

  return await authorizePayment({
    orderId: orderToPayment.id,
    paymentId: orderToPayment.inPayments[0].id,
    ...payload,
  });
}

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
