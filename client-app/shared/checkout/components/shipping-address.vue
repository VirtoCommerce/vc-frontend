<template>
  <div class="shipping-address">
    <VcLabel>
      {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
    </VcLabel>

    <div class="shipping-address__body">
      <VcAddress :address="address" @change="$emit('change:address')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { OrderAddressType } from "@/xapi";

interface Props {
  label?: string;
  address?: OrderAddressType;
}

interface Emits {
  (event: "change:address"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss">
.shipping-address {
  $readonly: "";

  @apply flex flex-col gap-0.5;

  &__body {
    @apply flex flex-col min-h-[4.625rem] rounded border text-15;
  }
}
</style>
