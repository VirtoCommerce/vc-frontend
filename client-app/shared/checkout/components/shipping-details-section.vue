<template>
  <VcWidget :title="$t('shared.checkout.shipping_details_section.title')" prepend-icon="truck" size="lg">
    <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div class="lg:w-3/5">
        <VcLabel required>
          {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
        </VcLabel>

        <div :class="['grow divide-y rounded border', { 'cursor-not-allowed bg-neutral-50': disabled }]">
          <VcAddressSelection
            :placeholder="$t('shared.checkout.shipping_details_section.links.select_address')"
            :address="deliveryAddress"
            :disabled="disabled"
            class="min-h-18 px-3 py-1.5"
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
        item-size="lg"
        class="lg:w-2/5"
        required
        @change="(value) => setShippingMethod(value)"
      >
        <template #placeholder>
          <div class="flex items-center gap-3 p-3 text-sm">
            <VcImage class="size-12 rounded-sm bg-neutral-100" src="/static/icons/placeholders/select-shipping.svg" />

            {{ $t("common.placeholders.select_delivery_method") }}
          </div>
        </template>

        <template #selected="{ item }">
          <div class="flex items-center gap-3 p-3 text-sm">
            <VcImage class="size-12 rounded-sm" :src="item.logoUrl" />

            {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
          </div>
        </template>

        <template #item="{ item }">
          <VcImage class="size-12 rounded-sm" :src="item.logoUrl" />

          {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
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
