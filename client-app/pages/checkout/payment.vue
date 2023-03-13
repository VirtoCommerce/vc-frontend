<template>
  <VcLayoutWithRightSidebar v-if="placedOrder" is-sidebar-sticky>
    <div class="z-10 bg-white shadow-md lg:rounded lg:border lg:shadow-sm">
      <div class="flex flex-row items-center justify-between space-x-3 p-4 shadow-lg md:p-6">
        <div class="min-w-0 truncate">
          <VcImage
            :src="payment?.paymentMethod?.logoUrl"
            class="mr-3.5 inline-block h-8 w-8 object-center md:h-9 md:w-9"
            lazy
          />

          <span>{{ payment?.paymentMethod?.typeName }}</span>
        </div>
      </div>

      <div class="p-5 md:p-6">
        <PaymentProcessingRedirection v-if="paymentMethodType === PaymentActionType.Redirection" :order="placedOrder" />

        <PaymentProcessingAuthorizeNet
          v-else-if="paymentMethodType === PaymentActionType.PreparedForm"
          :order="placedOrder"
          @success="onPaymentResult(true)"
          @fail="onPaymentResult(false)"
        />
      </div>
    </div>

    <template #sidebar>
      <OrderSummary :cart="placedOrder" />
    </template>
  </VcLayoutWithRightSidebar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { OrderSummary, useCheckout } from "@/shared/checkout";
import { PaymentActionType, PaymentProcessingAuthorizeNet, PaymentProcessingRedirection } from "@/shared/payment";
import type { PaymentInType } from "@/xapi/types";

const router = useRouter();
const { placedOrder } = useCheckout();

const payment = computed<PaymentInType | undefined>(() => placedOrder.value!.inPayments[0]);
const paymentMethodType = computed<number | undefined>(() => payment.value?.paymentMethod?.paymentMethodType);

async function onPaymentResult(success: boolean) {
  await router.replace({
    name: "CheckoutPaymentResult",
    params: { status: success ? "success" : "failure" },
  });
}
</script>
