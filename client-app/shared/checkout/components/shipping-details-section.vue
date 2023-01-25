<template>
  <VcSectionWidget :title="$t('shared.checkout.shipping_details_section.title')" icon="truck">
    <VcAddress
      :label="$t('shared.checkout.shipping_details_section.labels.shipping_address')"
      :address="shipment?.deliveryAddress"
      @change="$emit('change:address')"
    />

    <CheckoutLabeledBlock :label="$t('shared.checkout.shipping_details_section.labels.shipping_method')">
      <div class="flex flex-row items-center space-x-4">
        <template v-if="shipment?.shipmentMethodCode">
          <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" lazy />
          <span>
            {{ shipment.shipmentMethodCode }}
            {{ shipment.shipmentMethodOption }}
            (<VcPriceDisplay :value="shipment.price" />)
          </span>
        </template>

        <span v-else class="text-gray-600">
          {{ $t("common.messages.not_defined") }}
        </span>
      </div>

      <div>
        <VcButton :is-disabled="disabled" size="sm" is-outline class="px-3 uppercase" @click="$emit('change:method')">
          {{ shipment?.shipmentMethodCode ? $t("common.buttons.change") : $t("common.buttons.select") }}
        </VcButton>
      </div>
    </CheckoutLabeledBlock>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { ShipmentType } from "@/xapi";
import { CheckoutLabeledBlock } from "@/shared/checkout";

interface Props {
  disabled?: boolean;
  shipment?: ShipmentType;
}

interface Emits {
  (event: "change:address"): void;
  (event: "change:method"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>
