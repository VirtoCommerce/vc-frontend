<template>
  <VcWidget :title="$t('shared.checkout.billing_details_section.title')" prepend-icon="cash" size="lg">
    <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div class="lg:w-3/5">
        <VcLabel required>
          {{ $t("shared.checkout.billing_details_section.labels.billing_address") }}
        </VcLabel>

        <div :class="['grow divide-y rounded border', { 'cursor-not-allowed bg-gray-50': disabled }]">
          <VcCheckbox
            v-if="shipment"
            v-model="billingAddressEqualsShipping"
            :disabled="disabled"
            name="billingAddressEqualsShipping"
            class="p-3"
          >
            {{ $t("shared.checkout.billing_details_section.labels.same_as_shipping_address") }}
          </VcCheckbox>

          <VcAddressSelection
            :placeholder="
              shipment && billingAddressEqualsShipping
                ? $t('shared.checkout.shipping_details_section.links.select_address')
                : $t('shared.checkout.billing_details_section.links.select_address')
            "
            :address="address"
            :disabled="disabled"
            :readonly="shipment?.deliveryAddress && billingAddressEqualsShipping"
            class="min-h-[3.313rem] px-3 py-1.5"
            @change="$emit('change:address')"
          />
        </div>
      </div>

      <div class="space-y-3 lg:w-2/5">
        <VcSelect
          v-model="method"
          :label="$t('shared.checkout.billing_details_section.labels.payment_method')"
          :items="methods"
          :disabled="disabled"
          size="auto"
          required
        >
          <template #placeholder>
            <VcSelectItem>
              <VcSelectItemImage src="/static/icons/placeholders/select-payment.svg" class="bg-gray-100/80" />
              <VcSelectItemText>
                {{ $t("common.placeholders.select_payment_method") }}
              </VcSelectItemText>
            </VcSelectItem>
          </template>

          <template #selected="{ item }">
            <VcSelectItem>
              <VcSelectItemImage :src="item.logoUrl" />
              <VcSelectItemText>{{ $t(`common.methods.payment_by_code.${item.code}`) }}</VcSelectItemText>
            </VcSelectItem>
          </template>

          <template #item="{ item }">
            <VcSelectItem bordered>
              <VcSelectItemImage :src="item.logoUrl" />
              <VcSelectItemText>{{ $t(`common.methods.payment_by_code.${item.code}`) }}</VcSelectItemText>
            </VcSelectItem>
          </template>
        </VcSelect>

        <transition name="slide-fade-top" mode="in-out">
          <VcInput
            v-if="purchaseOrderNumberEnabled"
            v-model.trim="poNumber"
            :placeholder="$t('common.placeholders.purchase_order_number')"
            :disabled="disabled"
            name="purchaseOrderNumber"
          />
        </transition>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { computed } from "vue";
import type { PaymentType, PaymentMethodType, ShipmentType, CartAddressType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "change:address"): void;
  (event: "change:method", method: PaymentMethodType): void;
  (event: "update:addressEqualsShippingAddress"): void;
  (event: "update:purchaseOrderNumber", value: string): void;
}

interface IProps {
  methods: PaymentMethodType[];
  disabled?: boolean;
  addressEqualsShippingAddress?: boolean;
  payment?: PaymentType;
  shipment?: ShipmentType;
  purchaseOrderNumber?: string;
  purchaseOrderNumberEnabled?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  purchaseOrderNumber: "",
});

const billingAddressEqualsShipping = useVModel(props, "addressEqualsShippingAddress", emit);
const poNumber = useVModel(props, "purchaseOrderNumber", emit);

const address = computed<CartAddressType | undefined>(() =>
  !!props.shipment && billingAddressEqualsShipping.value
    ? props.shipment?.deliveryAddress
    : props.payment?.billingAddress,
);

const method = computed<PaymentMethodType | undefined>({
  get: () => props.methods.find((item) => item.code === props.payment?.paymentGatewayCode),
  set: (value?: PaymentMethodType) => value && emit("change:method", value),
});
</script>
