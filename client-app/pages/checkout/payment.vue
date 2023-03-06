<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <div class="rounded border bg-white shadow-sm">
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

      <div v-if="order" class="p-5 md:p-6">
        <PaymentProcessingRedirection
          v-if="paymentMethodType === PaymentMethod.Redirection"
          :order="order"
          :disabled="loading"
        />

        <PaymentProcessingAuthorizeNet
          v-else-if="paymentMethodType === PaymentMethod.PreparedForm"
          ref="paymentMethodComponent"
          :order="order"
          :disabled="loading"
          @success="onPaymentResult(true)"
          @fail="onPaymentResult(false)"
        />
      </div>
    </div>

    <template #sidebar>
      <OrderSummary v-if="order" :cart="order" />
    </template>
  </VcLayoutWithRightSidebar>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserOrder } from "@/shared/account";
import { OrderSummary, useCheckout } from "@/shared/checkout";
import { PaymentMethod, PaymentProcessingAuthorizeNet } from "@/shared/payment";
import { PaymentInType } from "@/xapi";

const paymentMethodComponent = ref<InstanceType<typeof PaymentProcessingAuthorizeNet> | null>(null);

const router = useRouter();
const { loading, order } = useUserOrder();
const { orderPaymentResult } = useCheckout();

const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments[0]);
const paymentMethodType = computed<PaymentMethod | undefined>(() => payment.value?.paymentMethod?.paymentMethodType);

async function onPaymentResult(paymentResult: boolean) {
  orderPaymentResult.value = paymentResult;

  await router.replace({
    name: "OrderPaymentResult",
  });
}
</script>
