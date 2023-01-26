<template>
  <div class="vc-vendor">
    <VcIcon name="vendor" size="sm" />
    <span class="vc-vendor__title"> {{ $t("common.labels.vendor") }}: {{ vendor?.name }} </span>
  </div>
</template>

<script setup lang="ts">
import { Vendor } from "@/xapi/types";

export interface Props {
  vendor?: Vendor;
}

withDefaults(defineProps<Props>(), {
  vendor: undefined,
});
</script>

<style lang="scss">
.vc-vendor {
  @apply flex items-center text-primary;

  &__title {
    @apply ml-1.5 font-bold uppercase text-base;
  }
}
</style>
