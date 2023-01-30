<template>
  <VcSectionWidget :title="$t('shared.checkout.shipping_details_section.title')" icon="truck">
    <div class="flex flex-col gap-6 p-4 border rounded sm:flex-row sm:gap-7">
      <ShippingAddress class="sm:grow" :address="shipment?.deliveryAddress" @change:address="$emit('change:address')" />

      <VcSelect
        class="sm:grow sm:max-w-[18.75rem]"
        :label="$t('shared.checkout.shipping_details_section.labels.shipping_method')"
        :items="availableShippingMethods"
        :modelValue="selectedShippingMethod"
      >
        <template #placeholder>
          <SelectItem
            image="/static/icons/placeholder/select-shipping.svg"
            :title="$t('common.placeholders.not_selected_shippping_method')"
          />
        </template>
        <template #selected="{ item }">
          <SelectItem image="" :title="`${item?.code} ${item?.optionName}`" />
        </template>
        <template #item="{ item }">
          <SelectItem image="" :title="`${item?.code} ${item?.optionName}`" />
        </template>
      </VcSelect>
    </div>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ShipmentType, ShippingMethodType } from "@/xapi";
import { SelectItem, ShippingAddress } from "@/shared/checkout";

interface Props {
  disabled?: boolean;
  shipment?: ShipmentType;
  availableShippingMethods?: ShippingMethodType[];
}

interface Emits {
  (event: "change:address"): void;
  (event: "change:method"): void;
}

const selectedShippingMethod = ref<"">("");

defineProps<Props>();
defineEmits<Emits>();
</script>
