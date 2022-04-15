<template>
  <div class="w-20 py-1 text-center rounded-sm border" :class="depositClass">{{ amout }}</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  isDeposit: {
    type: Boolean,
    default: false,
  },
  amout: {
    type: Number,
    default: 0,
  },
});

const isDepositClass = "border-green-500 text-green-500";
const isDebitClass = "border-red-400 text-red-400";

const depositClass = computed(() => {
  return {
    [isDepositClass]: props.isDeposit,
    [isDebitClass]: !props.isDeposit,
  };
});
</script>
