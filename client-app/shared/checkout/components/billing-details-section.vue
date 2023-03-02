<template>
  <VcSectionWidget :title="$t('shared.checkout.billing_details_section.title')" icon="cash">
    <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div class="lg:w-3/5">
        <VcLabel>
          {{ $t("shared.checkout.billing_details_section.labels.billing_address") }}
        </VcLabel>

        <div :class="['grow divide-y rounded border', { 'cursor-not-allowed bg-gray-50': disabled }]">
          <VcCheckbox
            v-model="billingAddressEqualsShipping"
            :disabled="disabled"
            name="billingAddressEqualsShipping"
            class="p-3"
          >
            {{ $t("shared.checkout.billing_details_section.labels.same_as_shipping_address") }}
          </VcCheckbox>

          <VcAddressSelection
            :placeholder="
              billingAddressEqualsShipping
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

      <VcSelect
        v-model="method"
        :label="$t('shared.checkout.billing_details_section.labels.payment_method')"
        :items="methods"
        :disabled="disabled"
        size="auto"
        class="lg:w-2/5"
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
            <VcSelectItemText>{{ item.code }}</VcSelectItemText>
          </VcSelectItem>
        </template>

        <template #item="{ item }">
          <VcSelectItem bordered>
            <VcSelectItemImage :src="item.logoUrl" />
            <VcSelectItemText>{{ item.code }}</VcSelectItemText>
          </VcSelectItem>
        </template>
      </VcSelect>
    </div>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { computed } from "vue";
import { PaymentType, PaymentMethodType, ShipmentType, CartAddressType } from "@/xapi";

interface IEmits {
  (event: "change:address"): void;
  (event: "change:method", method: PaymentMethodType): void;
  (event: "update:addressEqualsShippingAddress"): void;
}

interface IProps {
  methods: PaymentMethodType[];
  disabled?: boolean;
  addressEqualsShippingAddress?: boolean;
  payment?: PaymentType;
  shipment?: ShipmentType;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const billingAddressEqualsShipping = useVModel(props, "addressEqualsShippingAddress", emit);

const address = computed<CartAddressType | undefined>(() =>
  billingAddressEqualsShipping.value ? props.shipment?.deliveryAddress : props.payment?.billingAddress
);

const method = computed<PaymentMethodType | undefined>({
  get: () => props.methods.find((item) => item.code === props.payment?.paymentGatewayCode),
  set: (value?: PaymentMethodType) => value && emit("change:method", value),
});
</script>
