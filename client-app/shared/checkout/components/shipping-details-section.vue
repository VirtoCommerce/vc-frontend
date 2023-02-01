<template>
  <VcSectionWidget :title="$t('shared.checkout.shipping_details_section.title')" icon="truck">
    <div class="flex flex-col gap-6 p-4 border rounded sm:flex-row sm:gap-7">
      <ShippingAddress class="sm:grow" :address="deliveryAddress" @change:address="$emit('change:address')" />

      <SelectShippingMethod
        class="sm:grow sm:max-w-[18.75rem]"
        :available-methods="availableMethods"
        :current-method-id="currentMethodId"
        @result="(method) => $emit('change:method', method)"
      />
    </div>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { ShippingMethodType, CartAddressType } from "@/xapi";
import { ShippingAddress, SelectShippingMethod } from "@/shared/checkout";

interface Props {
  disabled?: boolean;
  deliveryAddress?: CartAddressType;
  currentMethodId?: string;
  availableMethods?: ShippingMethodType[];
}

interface Emits {
  (event: "change:address"): void;
  (event: "change:method", method: ShippingMethodType): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>
