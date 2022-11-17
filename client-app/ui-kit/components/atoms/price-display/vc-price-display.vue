<template>
  <div class="flex" :class="{ 'flex-row-reverse': !isSignFirst }">
    <div class="-mt-0.5 text-[60%] no-underline">{{ value?.currency?.symbol }}</div>
    <div>{{ value?.formattedAmountWithoutCurrency ?? "N/A" }}</div>
  </div>
</template>

<script setup lang="ts">
import { MoneyType } from "@/xapi/types";
import { PropType, computed } from "vue";

const props = defineProps({
  value: {
    type: Object as PropType<MoneyType>,
    default: undefined,
  },
});

const isSignFirst = computed<boolean>(
  () => (props.value?.formattedAmount.search(/\d/) && props.value?.formattedAmount.search(/\d/) > 0) || false
);
</script>
