<template>
  <VcWidget :title="$t('shared.checkout.shipping_details_section.title')" prepend-icon="truck" size="lg">
    <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div class="lg:w-3/5">
        <VcLabel required>
          {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
        </VcLabel>

        <div :class="['grow divide-y rounded border', { 'cursor-not-allowed bg-gray-50': disabled }]">
          <VcAddressSelection
            :placeholder="$t('shared.checkout.shipping_details_section.links.select_address')"
            :address="deliveryAddress"
            :disabled="disabled"
            class="min-h-[4.625rem] px-3 py-1.5"
            @change="onDeliveryAddressChange"
          />
        </div>
      </div>

      <VcSelect
        :model-value="shipmentMethod"
        :label="$t('shared.checkout.shipping_details_section.labels.shipping_method')"
        :items="availableShippingMethods"
        :disabled="disabled"
        size="auto"
        class="lg:w-2/5"
        required
        @change="(value) => setShippingMethod(value)"
      >
        <template #placeholder>
          <VcSelectItem>
            <VcSelectItemImage src="/static/icons/placeholders/select-shipping.svg" class="bg-gray-100/80" />
            <VcSelectItemText>
              {{ $t("common.placeholders.select_delivery_method") }}
            </VcSelectItemText>
          </VcSelectItem>
        </template>

        <template #selected="{ item }">
          <VcSelectItem>
            <VcSelectItemImage :src="item.logoUrl" />
            <VcSelectItemText>
              {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
            </VcSelectItemText>
          </VcSelectItem>
        </template>

        <template #item="{ item }">
          <VcSelectItem bordered>
            <VcSelectItemImage :src="item.logoUrl" />
            <VcSelectItemText>
              {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
            </VcSelectItemText>
          </VcSelectItem>
        </template>
      </VcSelect>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";

interface IProps {
  disabled?: boolean;
}

defineProps<IProps>();

const { availableShippingMethods } = useFullCart();
const { deliveryAddress, shipmentMethod, onDeliveryAddressChange, setShippingMethod } = useCheckout();
</script>
