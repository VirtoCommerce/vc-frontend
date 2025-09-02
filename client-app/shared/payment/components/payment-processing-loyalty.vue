<template>
  <div>
    <VcButton @click="onPay">Pay</VcButton>
    <p>your amount {{ amount }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
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

onMounted(() => {
  console.log(props.order)
})

const amount = computed(() => {
  // take from props.order
  return 10000
})

function onPay() {
  console.log('payed')
  emit('success')
}
</script>
