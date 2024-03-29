<template>
  <div class="vc-line-item-price">
    <VcPriceDisplay
      class="vc-line-item-price__actual"
      :value="shouldUseActualPrice(listPrice, actualPrice) ? actualPrice : listPrice"
    />
    <VcPriceDisplay
      v-if="shouldUseActualPrice(listPrice, actualPrice)"
      class="vc-line-item-price__list"
      :value="listPrice"
    />
  </div>
</template>

<script setup lang="ts">
import { shouldUseActualPrice } from "@/ui-kit/utilities/price";
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  listPrice?: MoneyType;
  actualPrice?: MoneyType;
}
defineProps<IProps>();

console.warn("[UIKit][warn] VcLineItemPrice is deprecated, use VcProductPrice instead.");
</script>

<style lang="scss">
.vc-line-item-price {
  --actual-color: var(--vc-line-item-price-actual-color, var(--color-neutral-900));
  --list-color: var(--vc-line-item-price-list-color, var(--color-neutral-400));

  @apply flex flex-col items-end;

  &__actual {
    @apply max-w-full text-xs font-bold text-[--actual-color] truncate [word-break:break-word];

    @media (min-width: theme("screens.2xl")) {
      @apply text-sm font-normal;
    }
  }

  &__list {
    @apply max-w-full text-xs line-through text-[--list-color] font-normal truncate;
  }
}
</style>
