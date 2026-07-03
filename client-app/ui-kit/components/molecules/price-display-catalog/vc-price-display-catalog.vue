<template>
  <div :class="['vc-price-display-catalog', { 'vc-price-display-catalog--sign-last': !isSignFirst }]">
    <div class="vc-price-display-catalog__symbol">{{ value?.currency?.symbol }}</div>

    <div :class="{ 'vc-price-display-catalog__amount--old': isOldPrice }" class="vc-price-display-catalog__amount">
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

<style lang="scss">
.vc-price-display-catalog {
  @apply flex [word-break:break-word];

  &--sign-last {
    @apply flex-row-reverse;
  }

  &__symbol {
    @apply -mt-0.5 text-[60%];
  }

  &__amount {
    &--old {
      @apply line-through;
    }
  }
}
</style>
