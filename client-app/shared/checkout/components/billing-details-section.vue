<template>
  <VcSectionWidget :title="$t('shared.checkout.billing_details_section.title')" icon="cash">
    <div class="flex flex-col gap-6 md:flex-row md:gap-8">
      <div class="flex flex-col md:grow">
        <VcLabel>
          {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
        </VcLabel>

        <div :class="['grow rounded border divide-y', { 'bg-gray-50 cursor-not-allowed': disabled }]">
          <VcCheckbox
            class="p-3"
            v-model="billingAddressEqualsShipping"
            :disabled="disabled"
            name="billingAddressEqualsShipping"
          >
            {{ $t("shared.checkout.billing_details_section.labels.same_as_shipping_address") }}
          </VcCheckbox>

          <VcAddressSelection
            :placeholder="$t('shared.checkout.billing_details_section.links.select_address')"
            :address="billingAddressEqualsShipping ? shipment?.deliveryAddress : payment?.billingAddress"
            :disabled="disabled"
            @change="$emit('change:address')"
            class="px-3 py-1.5 min-h-[3.313rem]"
            :readonly="shipment?.deliveryAddress && billingAddressEqualsShipping"
          />
        </div>
      </div>
    </div>

    <CheckoutLabeledBlock :label="$t('shared.checkout.billing_details_section.labels.shipping_method')">
      <div class="flex flex-row items-center space-x-4">
        <template v-if="payment?.paymentGatewayCode">
          <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" lazy />
          <span>{{ payment.paymentGatewayCode }}</span>
        </template>

        <span v-else class="text-gray-600">
          {{ $t("common.messages.not_defined") }}
        </span>
      </div>

      <div>
        <VcButton :is-disabled="disabled" size="sm" is-outline class="px-3 uppercase" @click="$emit('change:method')">
          {{ payment?.paymentGatewayCode ? $t("common.buttons.change") : $t("common.buttons.select") }}
        </VcButton>
      </div>
    </CheckoutLabeledBlock>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { PaymentType, ShipmentType } from "@/xapi";
import { CheckoutLabeledBlock } from "@/shared/checkout";

interface Props {
  disabled?: boolean;
  addressEqualsShippingAddress?: boolean;
  payment?: PaymentType;
  shipment?: ShipmentType;
}

interface Emits {
  (event: "change:address"): void;
  (event: "change:method"): void;
  (event: "update:addressEqualsShippingAddress"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const billingAddressEqualsShipping = useVModel(props, "addressEqualsShippingAddress", emit);
</script>
