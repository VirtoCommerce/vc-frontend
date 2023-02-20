<template>
  <div class="vc-line-item-price">
    <div class="vc-line-item-price__actual">
      <VcPriceDisplay :value="listPrice?.amount > actualPrice?.amount ? actualPrice : listPrice" />
    </div>
    <div v-if="listPrice?.amount > actualPrice?.amount" class="vc-line-item-price__list">
      <VcPriceDisplay :value="listPrice" />
    </div>
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
  &__actual {
    @apply text-13 font-semibold text-[color:var(--color-body-text)];

    @media (min-width: theme("screens.md")) {
      @apply font-normal;
    }

    @media (min-width: theme("screens.lg")) {
      @apply text-xs;
    }

    @media (min-width: theme("screens.xl")) {
      @apply font-medium;
    }
  }

  &__list {
    @apply text-11 leading-3 line-through text-[color:var(--color-price-old)];
  }
}
</style>
