<template>
  <VcWidget
    :title="$t('shared.checkout.shipping_details_section.title')"
    prepend-icon="truck"
    size="lg"
    class="shipping-details-section"
    data-test-id="checkout.shipping-details-section"
  >
    <div class="shipping-details-section__content">
      <div
        v-if="xPickupEnabled && hasBOPIS && !onlyOneDeliveryMethod"
        class="shipping-details-section__delivery-option"
      >
        <VcLabel>
          {{ $t("shared.checkout.shipping_details_section.labels.delivery_option") }}
        </VcLabel>

        <div class="shipping-details-section__switcher-container">
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

      <div v-if="mode === SHIPPING_OPTIONS.shipping" class="shipping-details-section__shipping-section">
        <div
          class="shipping-details-section__address-section"
          data-test-id="checkout.shipping-details-section.shipping-address-section"
        >
          <VcLabel required>
            {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
          </VcLabel>

          <div
            :class="[
              'shipping-details-section__address-container',
              {
                'shipping-details-section__address-container--disabled': disabled,
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
          class="shipping-details-section__method-select"
          required
          test-id-dropdown="checkout.shipping-details-section.shipping-method-selector"
          @change="onShipmentMethodChange"
        >
          <template #placeholder>
            <div class="shipping-details-section__method-item">
              <VcImage
                class="shipping-details-section__method-image shipping-details-section__method-image--placeholder"
                src="select-shipping.svg"
              />

              {{ $t("common.placeholders.select_delivery_method") }}
            </div>
          </template>

          <template #selected="{ item }">
            <div class="shipping-details-section__method-item" :data-selected-shipping-method-id="item.id">
              <VcImage class="shipping-details-section__method-image" :src="item.logoUrl" />

              {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
            </div>
          </template>

          <template #item="{ item }">
            <VcImage class="shipping-details-section__method-image" :src="item.logoUrl" />

            <span :data-shipping-method-id="item.id">{{ $t(`common.methods.delivery_by_id.${item.id}`) }}</span>
          </template>
        </VcSelect>
      </div>

      <div
        v-else
        class="shipping-details-section__pickup-section"
        data-test-id="checkout.shipping-details-section.pickup-point-section"
      >
        <VcLabel required>
          {{ $t("shared.checkout.shipping_details_section.labels.pickup_point") }}
        </VcLabel>

        <div
          :class="[
            'shipping-details-section__pickup-container',
            {
              'shipping-details-section__pickup-container--disabled': disabled,
            },
          ]"
        >
          <VcLoaderOverlay
            v-if="isLoadingBopisAddresses && isOpeningBopisAddresses"
            class="shipping-details-section__pickup-loader"
          />

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
import omit from "lodash/omit";
import { computed, ref, watch } from "vue";
import { useUser } from "@/shared/account/composables/useUser";
import { useFullCart } from "@/shared/cart";
import { BOPIS_CODE, useBopis } from "@/shared/checkout/composables/useBopis";
import { useCheckout } from "@/shared/checkout/composables/useCheckout";
import { AddressSelection } from "@/shared/common/components";
import { useShipToLocation } from "@/shared/ship-to-location/composables/useShipToLocation";
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

const {
  deliveryAddress,
  shipmentMethod,
  onDeliveryAddressChange,
  billingAddressEqualsShipping,
  initialized: checkoutInitialized,
} = useCheckout();

const { cart, availableShippingMethods, updateShipment, shipment, changing: cartChanging } = useFullCart();
const {
  hasBOPIS,
  openSelectAddressModal,
  loading: isLoadingBopisAddresses,
  modalOpening: isOpeningBopisAddresses,
  bopisMethod,
} = useBopis();
const { xPickupEnabled } = useXPickup();

const { isAuthenticated } = useUser();
const { selectedAddress } = useShipToLocation();

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
  [mode, shipment, checkoutInitialized],
  (currentValue, previousValue) => {
    const newMode = currentValue[0];
    const checkoutInitializedValue = currentValue[2];
    const [previousMode, previousShipment] = previousValue;

    if (!checkoutInitializedValue || !previousShipment) {
      return;
    }

    const isSameMode = newMode === previousMode;

    if (isSameMode) {
      // trigger watch only if mode changed
      return;
    }

    const shippingMethod = newMode === SHIPPING_OPTIONS.pickup ? bopisMethod.value : shippingMethods.value[0];
    const hasSelectedShippingMethod = !!shippingMethod;

    if (!hasSelectedShippingMethod) {
      return;
    }

    const isBopis = shippingMethod?.code === BOPIS_CODE;

    if (isBopis) {
      billingAddressEqualsShipping.value = false;
    }

    const isAnonymous = !isAuthenticated.value;
    const hasSelectedDeliveryAddress = !!selectedAddress.value;
    const hasShipmentDeliveryAddress = !!shipment.value?.deliveryAddress;
    const isShippingMode = newMode === SHIPPING_OPTIONS.shipping;
    const hasToApplySelectedAddress = !hasShipmentDeliveryAddress || previousMode !== newMode;

    if (
      isAnonymous &&
      hasSelectedShippingMethod &&
      hasSelectedDeliveryAddress &&
      isShippingMode &&
      hasToApplySelectedAddress
    ) {
      void updateShipment({
        id: shipment.value?.id,
        deliveryAddress: omit(selectedAddress.value, ["isDefault", "isFavorite"]),
        shipmentMethodCode: shippingMethod.code,
        shipmentMethodOption: shippingMethod.optionName,
        price: shippingMethod.price?.amount,
      });

      return;
    }

    const isSameShippingMethod = shippingMethod?.code === shipment.value?.shipmentMethodCode;

    if (isSameShippingMethod) {
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
    deliveryAddress: shipment.value?.deliveryAddress,
    shipmentMethodCode: method.code,
    shipmentMethodOption: method.optionName,
    price: method.price.amount,
  });
}
</script>

<style lang="scss">
.shipping-details-section {
  @apply @container;

  &__content {
    @apply flex flex-col flex-wrap gap-4;

    @container (min-width: theme("containers.xl")) {
      @apply flex-row gap-y-6;
    }

    @container (min-width: theme("containers.4xl")) {
      @apply flex-nowrap gap-8;
    }
  }

  &__delivery-option {
    @apply flex-shrink-0;
  }

  &__switcher-container {
    @apply flex min-h-18 items-center gap-2 rounded-[--vc-radius] border p-4;
  }

  &__shipping-section {
    @apply flex w-full flex-col gap-4;

    @container (min-width: theme("containers.xl")) {
      @apply flex-row gap-6;
    }
  }

  &__address-section {
    @apply grow;
  }

  &__address-container {
    @apply flex min-h-18 grow flex-col justify-center divide-y rounded-[--vc-radius] border px-3 py-1.5;

    &--disabled {
      @apply cursor-not-allowed bg-neutral-50;
    }
  }

  &__method-select {
    @apply flex-none;

    @container (min-width: theme("containers.5xl")) {
      @apply w-4/12;
    }
  }

  &__method-item {
    @apply flex items-center gap-3 p-[0.688rem] text-sm;
  }

  &__method-image {
    @apply size-12 rounded;

    &--placeholder {
      @apply bg-neutral-100;
    }
  }

  &__pickup-section {
    @apply grow;
  }

  &__pickup-loader {
    @apply rounded-[--vc-radius];
  }

  &__pickup-container {
    @apply relative flex min-h-18 grow flex-col justify-center rounded-[--vc-radius] border px-3 py-1.5;

    &--disabled {
      @apply cursor-not-allowed bg-neutral-50;
    }
  }
}
</style>
