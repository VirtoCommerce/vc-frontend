<template>
  <div class="p-5 md:p-6">
    <PaymentProcessingCyberSource
      :order="order"
      :cart="cart"
      :hide-payment-button="hidePaymentButton"
      :disabled="disabled"
      :payment="payment"
      :init-payment="initializeCurrentPayment"
      ref="paymentMethodComponent"
      @validate="onValidate"
      @success="onPaymentSuccess()"
      @fail="onPaymentFail()"
    />
    <PaymentProcessingAuthorizeNet
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
    />
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { authorizePayment, initializePayment, initializeCartPayment } from "@/core/api/graphql";
import { useAnalytics } from "@/core/composables";
import { Logger } from "@/core/utilities";
import type {
  CartType,
  CustomerOrderType,
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
  (event: "validate", isValid: boolean): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { analytics } = useAnalytics();
const paymentMethodComponent = useTemplateRef("paymentMethodComponent");

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

async function initializeCurrentPayment(
  payload?: Partial<InputInitializePaymentType | InputInitializeCartPaymentType>,
) {
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

/**
 * Authorize current payment with the provided order, this is the exposed method
 * @param order
 */
async function authorizeCurrentPaymentWithOrder(order?: CustomerOrderType) {
  const orderToPayment = order || props.order;

  if (!orderToPayment) {
    throw new Error("Order must be provided to authorize payment.");
  }

  try {
    const payload = await paymentMethodComponent.value?.executeNativePayment?.(orderToPayment);

    if (!payload) {
      emit("fail");
      return;
    }

    const { isSuccess } = await authorizePayment({
      orderId: orderToPayment.id,
      paymentId: orderToPayment.inPayments[0].id,
      ...payload,
    });

    if (isSuccess) {
      analytics("purchase", orderToPayment);
      emit("success");
    } else {
      emit("fail");
    }
  } catch (error) {
    Logger.error(authorizeCurrentPaymentWithOrder.name, error);
    emit("fail");
  }
}

defineExpose({
  authorizeCurrentPaymentWithOrder,
});

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
