<template>
  <div class="vc-vendor">
    <VcIcon name="vendor" size="sm" class="vc-vendor__icon" />
    <span v-if="vendor.name" class="vc-vendor__title">{{ $t("common.labels.vendor") }}: {{ vendor.name }}</span>
    <span v-else class="vc-vendor__title">{{ $t("common.labels.empty_vendor_label") }}</span>
  </div>
</template>

<script setup lang="ts">
import { Vendor } from "@/xapi/types";

interface Props {
  vendor: Vendor;
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
}
</style>
