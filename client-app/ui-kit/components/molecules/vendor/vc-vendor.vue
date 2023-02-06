<template>
  <div class="vc-vendor">
    <VcIcon name="vendor" size="sm" class="vc-vendor__icon" />
    <span class="vc-vendor__title">
      {{ $t("common.labels.vendor") }}:
      <span :class="['vc-vendor__name', { 'vc-vendor__name--not-available': !vendor?.name }]">
        {{ vendor?.name || $t("common.labels.not_available") }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { CommonVendor } from "@/xapi";

interface Props {
  vendor?: CommonVendor;
}

defineProps<Props>();
</script>

<style lang="scss">
.vc-vendor {
  @apply flex gap-x-1.5 items-center text-[color:var(--color-primary)];

  &__icon {
    @apply flex-none;
  }

  &__title {
    @apply font-bold uppercase text-base truncate;
  }

  &__name {
    &--not-available {
      @apply text-gray-400;
    }
  }
}
</style>
