<template>
  <VcLayout sidebar-position="right" sticky-sidebar>
    <VcWidget size="lg">
      <template #default-container>
        <div class="flex flex-row items-center justify-between space-x-3 p-4 shadow-lg md:p-6">
          <div class="min-w-0 truncate">
            <VcImage
              :src="payment?.paymentMethod?.logoUrl"
              class="mr-3.5 inline-block size-8 object-center md:size-9"
              lazy
            />

            <span>{{ $t(`common.methods.payment_by_code.${payment?.paymentMethod?.code}`) }}</span>
          </div>
        </div>

        <div class="p-5 md:p-6">
          <PaymentProcessingRedirection
            v-if="paymentMethodType === PaymentActionType.Redirection"
            :order="placedOrder"
          />

          <PaymentProcessingAuthorizeNet
            v-else-if="paymentTypeName === 'AuthorizeNetPaymentMethod'"
            :order="placedOrder"
            @success="onPaymentResult(true)"
            @fail="onPaymentResult(false)"
          />
          <PaymentProcessingSkyflow
            v-else-if="paymentTypeName === 'SkyflowPaymentMethod'"
            :order="placedOrder"
            @success="onPaymentResult(true)"
            @fail="onPaymentResult(false)"
          />
        </div>
      </template>
    </VcWidget>

    <template #sidebar>
      <OrderSummary :cart="placedOrder" :no-shipping="allOrderItemsAreDigital" />
    </template>
  </VcLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { OrderSummary, useCheckout } from "@/shared/checkout";
import { PaymentActionType, PaymentProcessingRedirection } from "@/shared/payment";
import type { PaymentInType } from "@/core/api/graphql/types";
import PaymentProcessingAuthorizeNet from "@/shared/payment/components/payment-processing-authorize-net.vue";
import PaymentProcessingSkyflow from "@/shared/payment/components/payment-processing-skyflow.vue";

const router = useRouter();
const { placedOrder, allOrderItemsAreDigital } = useCheckout();

const payment = computed<PaymentInType | undefined>(() => placedOrder.value!.inPayments[0]);
const paymentMethodType = computed<number | undefined>(() => payment.value?.paymentMethod?.paymentMethodType);
const paymentTypeName = computed<string | undefined>(() => payment.value?.paymentMethod?.typeName);

async function onPaymentResult(success: boolean) {
  await router.replace({
    name: "CheckoutPaymentResult",
    params: { status: success ? "success" : "failure" },
  });
}
</script>
