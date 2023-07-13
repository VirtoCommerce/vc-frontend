<template>
  <div class="vc-line-item-price">
    <VcPriceDisplay
      :value="listPrice?.amount > actualPrice?.amount ? actualPrice : listPrice"
      class="vc-line-item-price__actual"
    />
    <VcPriceDisplay
      v-if="listPrice?.amount > actualPrice?.amount"
      :value="listPrice"
      class="vc-line-item-price__list"
    />
  </div>
</template>

<script setup lang="ts">
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  listPrice?: MoneyType;
  actualPrice?: MoneyType;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-line-item-price {
  @apply flex flex-col items-end;

  &__actual {
    @apply text-xs font-bold text-[color:var(--color-body-text)] [word-break:break-word];

    @media (min-width: theme("screens.2xl")) {
      @apply font-normal;
    }
  }

  &__list {
    @apply text-11 leading-3 line-through text-[color:var(--color-price-old)];
  }
}
</style>
