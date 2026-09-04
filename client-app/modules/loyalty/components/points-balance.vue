<template>
  <div class="points-balance">
    <span class="points-balance__label">
      {{ $t("pages.account.missions.balance_banner.label") }}
    </span>

    <div class="points-balance__value">
      <span v-if="loading" class="points-balance__amount-skeleton"></span>

      <template v-else>
        <span class="points-balance__amount">{{ $n(balance ?? 0, "decimal") }}</span>

        <span class="points-balance__unit">{{ $t("pages.account.missions.balance_banner.points") }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  balance?: number;
  loading?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.points-balance {
  @apply flex min-w-0 flex-col;

  &__label {
    @apply text-xs font-bold uppercase tracking-wide text-neutral-500;
  }

  &__value {
    @apply flex items-baseline gap-1.5;
  }

  &__amount {
    @apply text-2xl font-black text-neutral-900;
  }

  &__amount-skeleton {
    @apply h-7 w-24 animate-pulse rounded bg-neutral-200;
  }

  &__unit {
    @apply text-sm text-neutral-500;
  }
}
</style>
