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

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn("[VcPriceDisplayCatalog] This component is deprecated. Use VcPriceDisplay or VcProductPrice instead.");
}

const isSignFirst = computed<boolean>(
  () => (props.value?.formattedAmount.search(/\d/) && props.value?.formattedAmount.search(/\d/) > 0) || false,
);
</script>
