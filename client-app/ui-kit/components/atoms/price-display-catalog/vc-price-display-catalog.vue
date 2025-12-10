<template>
  <div :class="{ 'flex-row-reverse': !isSignFirst }" class="flex [word-break:break-word]">
    <div class="-mt-0.5 text-[60%]">{{ value?.currency?.symbol }}</div>

    <div :class="{ 'line-through': isOldPrice }">
      {{ value?.formattedAmountWithoutCurrency ?? "N/A" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  value?: MoneyType;
  isOldPrice?: boolean;
}

const props = defineProps<IProps>();

const isSignFirst = computed<boolean>(
  () => (props.value?.formattedAmount.search(/\d/) && props.value?.formattedAmount.search(/\d/) > 0) || false,
);
</script>
