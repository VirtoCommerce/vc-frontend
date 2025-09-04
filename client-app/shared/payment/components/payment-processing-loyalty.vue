<template>
  <div>
    <VcButton @click="onPay">Pay with points</VcButton>
    <p>your amount {{ amount }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { authorizePayment } from "@/core/api/graphql";
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

async function makePayment() {
  const {
    isSuccess,
    errorMessage = "",
  } = await authorizePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0].id,
  });

  if (isSuccess) {
    emit('success')
  } else {
    emit('fail', errorMessage)
  }
}

onMounted(() => {
  console.log(props.order)
})

const amount = computed(() => {
  // take from props.order
  return 10000
})

async function onPay() {
  await makePayment()
}
</script>
