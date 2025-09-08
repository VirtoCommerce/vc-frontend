<template>
  <div v-if="!loading">
    <p class="md:py-3 md:text-left">{{ $t("shared.payment.loyalty.text", { currentBalance: currentBalance }) }}</p>

    <VcButton
v-if="resultBalance && resultBalance >= 0" 
      :loading="loading"
      @click="onPay">
      {{ $t("shared.payment.loyalty.pay_now_button") }}
    </VcButton>

    <VcButton
v-else-if="resultBalance && resultBalance < 0"
      @click="fail">
      {{ $t("shared.payment.loyalty.okay_button") }}
    </VcButton>
  </div>

  <!-- Loader -->
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">

import { onMounted, ref } from "vue";
import { authorizePayment } from "@/core/api/graphql";
import { Logger } from "@/core/utilities";
import { useLoyaltyBalance } from "@/shared/payment";
import type { CustomerOrderType } from "@/core/api/graphql/types";

interface IProps {
  order: CustomerOrderType;
}

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const loading = ref(false);
const resultBalance = ref<number>();
const currentBalance = ref<number>();
const { getLoyaltyBalance } = useLoyaltyBalance();

async function makePayment() {
  loading.value = true;

  const {
    isSuccess,
    errorMessage = "",
  } = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0].id,
  });

  loading.value = false;

  if (isSuccess) {
    emit('success')
  } else {
    emit('fail', errorMessage)
  }
}

onMounted(async () => {
  try {
    loading.value = true;

    var loyaltyBalanceResult = await getLoyaltyBalance(props.order.id);
    currentBalance.value = loyaltyBalanceResult?.currentBalance;
    resultBalance.value = loyaltyBalanceResult?.resultBalance;

    loading.value = false;
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
