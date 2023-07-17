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
    @apply text-xs font-bold [word-break:break-word];

    @media (min-width: theme("screens.2xl")) {
      @apply text-sm font-normal;
    }
  }

  &__list {
    @apply text-xs line-through text-[--color-neutral-400] font-normal;
  }
}
</style>
