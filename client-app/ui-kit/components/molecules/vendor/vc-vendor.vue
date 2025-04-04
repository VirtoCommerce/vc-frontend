<template>
  <div :class="['vc-vendor', { 'vc-vendor--not-available': !vendor?.name }]">
    <VcIcon name="vendor" size="sm" class="vc-vendor__icon" />

    <span class="vc-vendor__title">
      {{ $t("ui_kit.labels.vendor") }}:

      <span class="vc-vendor__name">
        {{ vendor?.name || $t("ui_kit.labels.not_available") }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { CommonVendor } from "@/core/api/graphql/types";

interface IProps {
  vendor?: CommonVendor;
}

defineProps<IProps>();

console.log("[UI-kit] VcVendor is deprecated. Use VendorName instead.");
</script>

<style lang="scss">
.vc-vendor {
  $notAvailable: "";

  @apply flex gap-x-1.5 items-center min-w-0 text-primary-600;

  &--not-available {
    $notAvailable: &;
  }

  &__icon {
    @apply flex-none fill-primary;
  }

  &__title {
    @apply font-bold uppercase text-base truncate;
  }

  &__name {
    #{$notAvailable} & {
      @apply text-neutral-400;
    }
  }
}
</style>
