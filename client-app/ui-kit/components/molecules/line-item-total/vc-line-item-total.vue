<template>
  <div class="vc-line-item-total">
    <div class="vc-line-item-total__label">{{ $t("common.labels.total") }}</div>

    <VcPriceDisplay
      class="vc-line-item-total__actual"
      :value="listTotal?.amount > actualTotal?.amount ? actualTotal : listTotal"
    />

    <VcPriceDisplay
      v-if="listTotal?.amount > actualTotal?.amount"
      class="vc-line-item-total__list"
      :value="listTotal"
    />
  </div>
</template>

<script setup lang="ts">
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  listTotal?: MoneyType;
  actualTotal?: MoneyType;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-line-item-total {
  @apply flex flex-col justify-end w-full gap-x-1 text-right;

  &__label {
    @apply text-sm font-bold;

    @media (min-width: theme("screens.md")) {
      @apply hidden;
    }
  }

  &__actual {
    @apply text-base font-bold [word-break:break-word];
  }

  &__list {
    @apply text-xs line-through text-[--color-neutral-500];
  }
}
</style>
