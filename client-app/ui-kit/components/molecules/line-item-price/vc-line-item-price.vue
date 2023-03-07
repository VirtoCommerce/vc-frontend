<template>
  <div class="vc-line-item-price">
    <VcPriceDisplay
      class="vc-line-item-price__actual"
      :value="listPrice?.amount > actualPrice?.amount ? actualPrice : listPrice"
    />
    <VcPriceDisplay
      v-if="listPrice?.amount > actualPrice?.amount"
      class="vc-line-item-price__list"
      :value="listPrice"
    />
  </div>
</template>

<script setup lang="ts">
import { MoneyType } from "@/xapi/types";

interface Props {
  listPrice?: MoneyType;
  actualPrice?: MoneyType;
}

defineProps<Props>();
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
