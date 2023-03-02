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

      <div class="p-5 md:p-6">
        <PaymentProcessingAuthorizeNet
          v-if="order"
          ref="paymentMethodComponent"
          :order="order"
          :disabled="loading"
          @success="onPaymentResult"
          @fail="onPaymentResult"
        />
      </div>
    </div>

    <template #sidebar>
      <OrderSummary v-if="order" :cart="order" />
    </template>
  </VcLayoutWithRightSidebar>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useUserOrder } from "@/shared/account";
import { OrderSummary } from "@/shared/checkout";
import { PaymentProcessingAuthorizeNet } from "@/shared/payment";
import { PaymentInType } from "@/xapi";

const props = defineProps({
  orderId: {
    type: String,
    default: "",
  },
});

const paymentMethodComponent = ref<InstanceType<typeof PaymentProcessingAuthorizeNet> | null>(null);

const router = useRouter();
const { loading, order, fetchOrder } = useUserOrder();

const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments[0]);

async function onPaymentResult() {
  await router.replace({
    name: "OrderCompleted",
    params: {
      orderId: order.value!.id,
      orderNumber: order.value!.number,
    },
  });
}
watchEffect(() => {
  if (props.orderId) {
    fetchOrder({ id: props.orderId });
  }
});
</script>
