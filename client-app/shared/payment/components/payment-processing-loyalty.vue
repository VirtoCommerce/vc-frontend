<template>
  <div v-if="!loading && (!resultBalance || resultBalance < 0)">
    <p class="font-bold text-danger md:text-left">
      {{ $t("shared.payment.loyalty.errors.insufficient_points", { currentBalance: currentBalance }) }}   
    </p>

    <VcButton 
      @click="fail">{{ $t("shared.payment.loyalty.okay_button") }}</VcButton>
  </div>

  <div v-else-if="!loading && (resultBalance && resultBalance > 0)">
    <p class="md:py-3 md:text-left">{{ $t("shared.payment.loyalty.text", { currentBalance: currentBalance, resultBalance: resultBalance }) }}</p>
    <VcButton 
      @click="onPay"
      :loading="paymentLoading"
      class="flex-1 md:order-first md:flex-none"
      >{{ $t("shared.payment.loyalty.pay_now_button") }}</VcButton>
  </div>

  <!-- Loader -->
  <VcLoaderWithText v-else-if="loading" />
</template>

<script setup lang="ts">

import { onMounted, ref } from "vue";
import { authorizePayment } from "@/core/api/graphql";
import { useLoyaltyBalance } from "@/shared/payment";
import { Logger } from "@/core/utilities";
import type { CustomerOrderType } from "@/core/api/graphql/types";

interface IProps {
  order: CustomerOrderType;
}

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

const paymentLoading = ref(false);
const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { loading, currentBalance, resultBalance, loadLoyaltyBalance } = useLoyaltyBalance({ orderId: props.order.id });

async function makePayment() {
  paymentLoading.value = true;

  const {
    isSuccess,
    errorMessage = "",
  } = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0].id,
  });

  paymentLoading.value = false;

  if (isSuccess) {
    emit('success')
  } else {
    emit('fail', errorMessage)
  }
}

onMounted(async () => {
  try {
    await loadLoyaltyBalance();
  } catch (e) {
    Logger.error(onMounted.name, e);
  }
})

async function onPay() {
  await makePayment()
}

function fail() {
  emit('fail', "Insufficient points balance")
}
</script>
