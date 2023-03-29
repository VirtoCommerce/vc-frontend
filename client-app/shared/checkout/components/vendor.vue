<template>
  <router-link :to="link" :class="['vc-vendor', { 'vc-vendor--not-available': !vendor?.name }]">
    <VcIcon name="vendor" size="sm" class="vc-vendor__icon" />

    <span class="vc-vendor__title">
      {{ $t("common.labels.vendor") }}:

      <span class="vc-vendor__name">
        {{ vendor?.name || $t("common.labels.not_available") }}
      </span>
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CommonVendor } from "@/xapi/types";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  vendor?: CommonVendor;
}

const props = defineProps<IProps>();

const link = computed<RouteLocationRaw>(() => ({ name: "Vendor", params: { vendorId: props.vendor?.id } }));
</script>

<style lang="scss">
.vc-vendor {
  $notAvailable: "";

  @apply flex gap-x-1.5 items-center min-w-0 text-[color:var(--color-primary)];

  &--not-available {
    $notAvailable: &;
  }

  &__icon {
    @apply flex-none;
  }

  &__title {
    @apply font-bold uppercase text-base truncate;
  }

  &__name {
    #{$notAvailable} & {
      @apply text-gray-400;
    }
  }
}
</style>
