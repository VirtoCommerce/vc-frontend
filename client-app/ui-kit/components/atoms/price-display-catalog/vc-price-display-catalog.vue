<template>
  <div class="flex" :class="{ 'flex-row-reverse': !isSignFirst }">
    <div class="-mt-0.5 text-[60%]">{{ value?.currency?.symbol }}</div>
    <div :class="{ 'line-through': isOldPrice }">
      {{ value?.formattedAmountWithoutCurrency ?? "N/A" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MoneyType } from "@/core/api/graphql/types";
import type { PropType } from "vue";

const props = defineProps({
  value: {
    type: Object as PropType<MoneyType>,
    default: undefined,
  },

  isOldPrice: {
    type: Boolean,
    default: false,
  },
});

const isSignFirst = computed<boolean>(
  () => (props.value?.formattedAmount.search(/\d/) && props.value?.formattedAmount.search(/\d/) > 0) || false,
);
</script>
