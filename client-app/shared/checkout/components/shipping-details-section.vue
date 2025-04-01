<template>
  <VcWidget :title="$t('shared.checkout.shipping_details_section.title')" prepend-icon="truck" size="lg">
    <div class="flex flex-col flex-wrap gap-4 xs:flex-row xs:gap-y-6 lg:gap-8">
      <div v-if="hasBOPIS">
        <VcLabel>
          {{ $t("shared.checkout.shipping_details_section.labels.delivery_option") }}
        </VcLabel>

        <div class="flex min-h-18 items-center gap-2 rounded border p-4">
          <VcTabSwitch
            v-model="mode"
            :value="SHIPPING_OPTIONS.pickup"
            icon="cube"
            :label="$t('shared.checkout.shipping_details_section.switchers.pickup')"
            :disabled="cartChanging"
            @change="switchShippingOptions($event)"
          />

          <VcTabSwitch
            v-model="mode"
            :value="SHIPPING_OPTIONS.shipping"
            icon="truck"
            :label="$t('shared.checkout.shipping_details_section.switchers.shipping')"
            :disabled="cartChanging"
            @change="switchShippingOptions($event)"
          />
        </div>
        {{ deliveryAddress }}
      </div>

      <template v-if="mode === SHIPPING_OPTIONS.shipping">
        <div class="grow">
          <VcLabel required>
            {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
          </VcLabel>

          <div
            :class="[
              'flex min-h-18 grow flex-col justify-center divide-y rounded border px-3 py-1.5',
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
          :class="hasBOPIS ? 'lg:w-3/12' : 'lg:w-4/12'"
          required
          test-id-dropdown="shipping-method-select"
          @change="(value) => setShippingMethod(value)"
        >
          <template #placeholder>
            <div class="flex items-center gap-3 p-[0.688rem] text-sm">
              <VcImage class="size-12 rounded-sm bg-neutral-100" src="select-shipping.svg" />

              {{ $t("common.placeholders.select_delivery_method") }}
            </div>
          </template>

          <template #selected="{ item }">
            <div class="flex items-center gap-3 p-[0.688rem] text-sm">
              <VcImage class="size-12 rounded-sm" :src="item.logoUrl" />

              {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
            </div>
          </template>

          <template #item="{ item }">
            <VcImage class="size-12 rounded-sm" :src="item.logoUrl" />

            {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
          </template>
        </VcSelect>
      </template>

      <div v-else class="grow">
        <VcLabel required>
          {{ $t("shared.checkout.shipping_details_section.labels.pickup_point") }}
        </VcLabel>

        <div
          :class="[
            'relative flex min-h-18 grow flex-col justify-center divide-y rounded border px-3 py-1.5',
            {
              'cursor-not-allowed bg-neutral-50': disabled,
            },
          ]"
        >
          <VcLoaderOverlay v-if="isLoadingBopisAddresses" />

          <AddressSelection
            :disabled="isLoadingBopisAddresses || disabled"
            :address="deliveryAddress"
            :placeholder="$t('shared.checkout.shipping_details_section.links.select_pickup_point')"
            @change="openSelectAddressModal"
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
import { useBopis, BOPIS_CODE } from "@/shared/checkout/composables/useBopis";
import { AddressSelection } from "@/shared/common";

interface IProps {
  disabled?: boolean;
}

defineProps<IProps>();

const SHIPPING_OPTIONS = {
  pickup: "pickup",
  shipping: "shipping",
} as const;

type ShippingOptionType = keyof typeof SHIPPING_OPTIONS;

const { deliveryAddress, shipmentMethod, onDeliveryAddressChange, setShippingMethod } = useCheckout();

const mode = ref<ShippingOptionType>(shipmentMethod.value?.code === BOPIS_CODE ? "pickup" : "shipping");

const { availableShippingMethods, updateShipment, shipment, removeShipment, changing: cartChanging } = useFullCart();
const { hasBOPIS, openSelectAddressModal, loading: isLoadingBopisAddresses, bopisMethod } = useBopis();

const shippingMethods = computed(() => availableShippingMethods.value.filter((method) => method.code !== BOPIS_CODE));

function switchShippingOptions(_mode: ShippingOptionType) {
  mode.value = _mode;
}

watch(
  mode,
  async (newMode, previousMode) => {
    if (!previousMode) {
      return;
    }

    const shippingMethod = newMode === SHIPPING_OPTIONS.pickup ? bopisMethod.value : shippingMethods.value[0];

    if (!shippingMethod || shippingMethod.code === shipment.value?.shipmentMethodCode) {
      return;
    }

    if (shipment.value?.id) {
      await removeShipment(shipment.value.id);
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
</script>
