<template>
  <div class="vc-vendor">
    <VcIcon name="vendor" size="sm" class="vc-vendor__icon" />
    <span class="vc-vendor__title">{{ $t("common.labels.vendor") }}: {{ vendor?.name }}</span>
  </div>
</template>

<script setup lang="ts">
import { Vendor } from "@/xapi/types";

interface Props {
  vendor?: Vendor;
}

defineProps<Props>();
</script>

<style lang="scss">
.vc-vendor {
  @apply flex items-center text-[color:var(--color-primary)];

  &__icon {
    @apply flex-none;
  }

  &__title {
    @apply ml-1.5 font-bold uppercase text-base truncate;
  }
}
</style>
