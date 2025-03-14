<template>
  <VcWidget :title="$t('shared.checkout.shipping_details_section.title')" prepend-icon="truck" size="lg">
    <div class="flex flex-col flex-wrap gap-4 xs:flex-row xs:gap-y-6 lg:gap-8">
      <div>
        <VcLabel>
          {{ $t("shared.checkout.shipping_details_section.labels.delivery_option") }}
        </VcLabel>

        <div class="flex min-h-18 items-center gap-2 rounded border p-4">
          <VcTabSwitch
            v-model="mode"
            value="pickup"
            icon="cube"
            :label="$t('shared.checkout.shipping_details_section.switchers.pickup')"
            @change="switchShippingOptions($event)"
          />

          <VcTabSwitch
            v-model="mode"
            value="shipping"
            icon="truck"
            :label="$t('shared.checkout.shipping_details_section.switchers.shipping')"
            @change="switchShippingOptions($event)"
          />
        </div>
      </div>

      <template v-if="mode === 'shipping'">
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
          :items="availableShippingMethods"
          :disabled="disabled"
          size="auto"
          item-size="lg"
          class="lg:w-3/12"
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
            'flex min-h-18 grow flex-col justify-center divide-y rounded border px-3 py-1.5',
            {
              'cursor-not-allowed bg-neutral-50': disabled,
            },
          ]"
        >
          <AddressSelection
            :placeholder="$t('shared.checkout.shipping_details_section.links.select_pickup_point')"
            :disabled="disabled"
            @change="onDeliveryAddressChange"
          />
        </div>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";
import { AddressSelection } from "@/shared/common";

interface IProps {
  disabled?: boolean;
}

defineProps<IProps>();

const mode = ref<"pickup" | "shipping">("shipping");

const { availableShippingMethods } = useFullCart();
const { deliveryAddress, shipmentMethod, onDeliveryAddressChange, setShippingMethod } = useCheckout();

function switchShippingOptions(_mode: "pickup" | "shipping") {
  mode.value = _mode;
}
</script>
