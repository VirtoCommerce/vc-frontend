<template>
  <div :class="['price', { 'price--loading': loading }]">
    <VcLoaderOverlay v-if="loading" />

    <VcPriceDisplay v-if="shouldUseActualPrice(value?.list, value?.actual)" class="price__list" :value="value?.list" />

    <VcPriceDisplay
      v-if="shouldUseActualPrice(value?.list, value?.actual)"
      class="price__actual"
      :value="value?.actual"
    />

    <VcPriceDisplay v-else class="price__value" :value="value?.list" />
  </div>
</template>

<script setup lang="ts">
import { shouldUseActualPrice } from "@/ui-kit/utilities/price";
import type { MoneyType, PriceType } from "@/core/api/graphql/types";

interface IProps {
  value?: PriceType | { list: MoneyType; actual: MoneyType };
  loading?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.price {
  @apply relative flex flex-wrap items-center gap-x-1;

  &__list {
    @apply mt-0.5 text-xs font-bold text-neutral-400 line-through;
  }

  &__actual {
    @apply font-black text-[--price-color];
  }

  &__value {
    @apply font-bold text-[--price-color];
  }
}
</style>
