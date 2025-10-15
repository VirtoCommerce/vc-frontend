<template>
  <VcWidget
    :title="$t('shared.checkout.shipping_details_section.title')"
    prepend-icon="truck"
    size="lg"
    data-test-id="checkout.shipping-details-section"
  >
    <div class="flex flex-col flex-wrap gap-4 xs:flex-row xs:gap-y-6 lg:gap-8">
      <div v-if="xPickupEnabled && hasBOPIS && !onlyOneDeliveryMethod">
        <VcLabel>
          {{ $t("shared.checkout.shipping_details_section.labels.delivery_option") }}
        </VcLabel>

        <div class="flex min-h-18 items-center gap-2 rounded-[--vc-radius] border p-4">
          <VcTabSwitch
            v-model="mode"
            :value="SHIPPING_OPTIONS.pickup"
            icon="cube"
            :label="$t('shared.checkout.shipping_details_section.switchers.pickup')"
            :disabled="cartChanging"
            data-test-id="checkout.shipping-details-section.pickup-switcher"
            @change="switchShippingOptions($event)"
          />

          <VcTabSwitch
            v-model="mode"
            :value="SHIPPING_OPTIONS.shipping"
            icon="truck"
            :label="$t('shared.checkout.shipping_details_section.switchers.shipping')"
            :disabled="cartChanging"
            data-test-id="checkout.shipping-details-section.shipping-switcher"
            @change="switchShippingOptions($event)"
          />
        </div>
      </div>

      <template v-if="mode === SHIPPING_OPTIONS.shipping">
        <div class="grow" data-test-id="checkout.shipping-details-section.shipping-address-section">
          <VcLabel required>
            {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
          </VcLabel>

          <div
            :class="[
              'flex min-h-18 grow flex-col justify-center divide-y rounded-[--vc-radius] border px-3 py-1.5',
              {
                'cursor-not-allowed bg-neutral-50': disabled,
              },
            ]"
          >
            <AddressSelection
              :placeholder="$t('shared.checkout.shipping_details_section.links.select_address')"
              :address="deliveryAddress"
              :disabled="disabled"
              @change="onDeliveryAddressChange"
            />
          </div>
        </div>

        <VcSelect
          :model-value="shipmentMethod"
          :label="$t('shared.checkout.shipping_details_section.labels.shipping_method')"
          :items="shippingMethods"
          :disabled="disabled"
          size="auto"
          item-size="lg"
          :class="xPickupEnabled && hasBOPIS ? 'lg:w-3/12' : 'lg:w-4/12'"
          required
          test-id-dropdown="checkout.shipping-details-section.shipping-method-selector"
          @change="onShipmentMethodChange"
        >
          <template #placeholder>
            <div class="flex items-center gap-3 p-[0.688rem] text-sm">
              <VcImage class="size-12 rounded bg-neutral-100" src="select-shipping.svg" />

              {{ $t("common.placeholders.select_delivery_method") }}
            </div>
          </template>

          <template #selected="{ item }">
            <div class="flex items-center gap-3 p-[0.688rem] text-sm" :data-selected-shipping-method-id="item.id">
              <VcImage class="size-12 rounded" :src="item.logoUrl" />

              {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
            </div>
          </template>

          <template #item="{ item }">
            <VcImage class="size-12 rounded" :src="item.logoUrl" />

            <span :data-shipping-method-id="item.id">{{ $t(`common.methods.delivery_by_id.${item.id}`) }}</span>
          </template>
        </VcSelect>
      </template>

      <div v-else class="grow" data-test-id="checkout.shipping-details-section.pickup-point-section">
        <VcLabel required>
          {{ $t("shared.checkout.shipping_details_section.labels.pickup_point") }}
        </VcLabel>

        <div
          :class="[
            'relative flex min-h-18 grow flex-col justify-center divide-y rounded-[--vc-radius] border px-3 py-1.5',
            {
              'cursor-not-allowed bg-neutral-50': disabled,
            },
          ]"
        >
          <VcLoaderOverlay v-if="isLoadingBopisAddresses" />
          <AddressSelection
            :disabled="!cart || isLoadingBopisAddresses || disabled"
            :address="deliveryAddress"
            :placeholder="$t('shared.checkout.shipping_details_section.links.select_pickup_point')"
            @change="openSelectAddressModal(cart!.id)"
          />
        </div>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";
import { BOPIS_CODE, useBopis } from "@/shared/checkout/composables/useBopis";
import { AddressSelection } from "@/shared/common";
import { useXPickup } from "@/shared/x-pickup/composables/useXPickup";
import type { ShippingMethodType } from "@/core/api/graphql/types.ts";

interface IProps {
  disabled?: boolean;
}

defineProps<IProps>();

const SHIPPING_OPTIONS = {
  pickup: "pickup",
  shipping: "shipping",
} as const;

type ShippingOptionType = keyof typeof SHIPPING_OPTIONS;

const { deliveryAddress, shipmentMethod, onDeliveryAddressChange, billingAddressEqualsShipping } = useCheckout();

const { cart, availableShippingMethods, updateShipment, shipment, changing: cartChanging } = useFullCart();
const { hasBOPIS, openSelectAddressModal, loading: isLoadingBopisAddresses, bopisMethod } = useBopis();
const { xPickupEnabled } = useXPickup();

const mode = ref<ShippingOptionType>(getDefaultMode());

const onlyOneDeliveryMethod = computed(() => availableShippingMethods.value.length === 1);
const shippingMethods = computed(() => availableShippingMethods.value.filter((method) => method.code !== BOPIS_CODE));

function switchShippingOptions(_mode: ShippingOptionType) {
  mode.value = _mode;
}

function getDefaultMode() {
  if (shipmentMethod.value?.code) {
    return shipmentMethod.value?.code === BOPIS_CODE ? "pickup" : "shipping";
  }
  if (availableShippingMethods.value.length === 1) {
    return availableShippingMethods.value[0].code === BOPIS_CODE ? "pickup" : "shipping";
  }
  return "shipping";
}

watch(
  mode,
  (newMode, previousMode) => {
    const shippingMethod = newMode === SHIPPING_OPTIONS.pickup ? bopisMethod.value : shippingMethods.value[0];

    if (shippingMethod?.code === BOPIS_CODE) {
      billingAddressEqualsShipping.value = false;
    }

    if (
      !shippingMethod ||
      shippingMethod.code === shipment.value?.shipmentMethodCode ||
      (!previousMode && shippingMethod.code !== BOPIS_CODE)
    ) {
      return;
    }

    void updateShipment({
      id: shipment.value?.id,
      shipmentMethodCode: shippingMethod.code,
      shipmentMethodOption: shippingMethod.optionName,
      price: shippingMethod.price?.amount,
    });
  },
  {
    immediate: true,
  },
);

function onShipmentMethodChange(method: ShippingMethodType) {
  void updateShipment({
    id: shipment.value?.id,
    shipmentMethodCode: method.code,
    shipmentMethodOption: method.optionName,
    price: method.price.amount,
  });
}
</script>
