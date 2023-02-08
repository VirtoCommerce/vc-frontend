<template>
  <VcSectionWidget :title="$t('shared.checkout.billing_details_section.title')" icon="cash">
    <div class="flex flex-col gap-6 md:flex-row md:gap-8">
      <div class="flex flex-col md:grow">
        <VcLabel>
          {{ $t("shared.checkout.billing_details_section.labels.billing_address") }}
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
            :address="address"
            :disabled="disabled"
            @change="$emit('change:address')"
            class="px-3 py-1.5 min-h-[3.313rem]"
            :readonly="shipment?.deliveryAddress && billingAddressEqualsShipping"
          />
        </div>
      </div>

      <VcSelect
        v-model="method"
        :label="$t('shared.checkout.billing_details_section.labels.payment_method')"
        :items="methods"
        :disabled="disabled"
        size="auto"
        class="md:w-2/5"
      >
        <template #placeholder>
          <VcSelectItem>
            <VcSelectItemImage src="/static/icons/placeholder/select-payment.svg" />
            <VcSelectItemText>
              {{ $t("common.placeholders.select_payment_method") }}
            </VcSelectItemText>
          </VcSelectItem>
        </template>

        <template #selected="{ item }">
          <VcSelectItem>
            <VcSelectItemImage :src="item.logoUrl" />
            <VcSelectItemText>{{ item.code }} {{ item.optionName }}</VcSelectItemText>
          </VcSelectItem>
        </template>

        <template #item="{ item }">
          <VcSelectItem bordered>
            <VcSelectItemImage :src="item.logoUrl" />
            <VcSelectItemText>{{ item.code }} {{ item.optionName }}</VcSelectItemText>
          </VcSelectItem>
        </template>
      </VcSelect>
    </div>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useVModel } from "@vueuse/core";
import { PaymentType, PaymentMethodType, ShipmentType, CartAddressType } from "@/xapi";

interface IProps {
  methods: PaymentMethodType[];
  disabled?: boolean;
  addressEqualsShippingAddress?: boolean;
  payment?: PaymentType;
  shipment?: ShipmentType;
}

interface IEmits {
  (event: "change:address"): void;
  (event: "change:method", method: PaymentMethodType): void;
  (event: "update:addressEqualsShippingAddress"): void;
}

const props = withDefaults(defineProps<IProps>(), {
  methods: () => [],
});
const emit = defineEmits<IEmits>();

const billingAddressEqualsShipping = useVModel(props, "addressEqualsShippingAddress", emit);

const address = computed<CartAddressType | undefined>(() =>
  props.addressEqualsShippingAddress ? props.shipment?.deliveryAddress : props.payment?.billingAddress
);

const method = computed<PaymentMethodType | undefined>({
  get: () => props.methods.find((item) => item.code === props.payment?.paymentGatewayCode),

  set: (value?: PaymentMethodType) => value && emit("change:method", value),
});
</script>
