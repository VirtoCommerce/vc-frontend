<template>
  <div v-if="!balanceLoading">
    <p class="md:py-3 md:text-left">{{ $t("loyalty.payment.loyalty.text", { currentBalance: currentBalance }) }}</p>

    <VcButton
      v-if="resultBalance !== null && resultBalance !== undefined && resultBalance >= 0"
      :loading="loading"
      @click="onPay"
    >
      {{ $t("loyalty.payment.loyalty.pay_now_button") }}
    </VcButton>

    <VcButton v-else-if="resultBalance !== null && resultBalance !== undefined && resultBalance < 0" @click="fail">
      {{ $t("loyalty.payment.loyalty.pay_now_button") }}
    </VcButton>
  </div>

  <!-- Loader -->
  <VcLoaderWithText v-else />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { authorizePayment } from "@/core/api/graphql";
import { useLoyaltyBalance } from "../composables/useLoyaltyBalance";
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
const { t } = useI18n();
const loading = ref(false);
const { fetchLoyaltyBalance, loading: balanceLoading, currentBalance, resultBalance } = useLoyaltyBalance();

async function makePayment() {
  loading.value = true;

  const { isSuccess, errorMessage = "" } = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0].id,
  });

  loading.value = false;

  if (isSuccess) {
    emit("success");
  } else {
    emit("fail", errorMessage);
  }
}

onMounted(async () => {
  await fetchLoyaltyBalance(props.order.id);
});

async function onPay() {
  await makePayment();
}

function fail() {
  emit("fail", t("loyalty.payment.loyalty.errors.insufficient_points", { currentBalance: currentBalance.value }));
}
</script>
