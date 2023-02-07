<template>
  <VcSectionWidget :title="$t('shared.checkout.shipping_details_section.title')" icon="truck">
    <div class="flex flex-col gap-6 md:flex-row md:gap-8">
      <div class="flex flex-col md:grow">
        <VcLabel>
          {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
        </VcLabel>

        <div :class="['grow rounded border divide-y', { 'bg-gray-50 cursor-not-allowed': disabled }]">
          <VcAddressSelection
            :placeholder="$t('shared.checkout.shipping_details_section.links.select_address')"
            :address="address"
            :disabled="disabled"
            class="p-3 min-h-[4.625rem]"
            @change="$emit('change:address')"
          />
        </div>
      </div>

      <VcSelect
        v-model="method"
        :label="$t('shared.checkout.shipping_details_section.labels.shipping_method')"
        :items="methods"
        :disabled="disabled"
        size="auto"
        class="md:w-2/5"
      >
        <template #placeholder>
          <VcSelectItem>
            <VcSelectItemImage src="/static/icons/placeholder/select-shipping.svg" />
            <VcSelectItemText>
              {{ $t("common.placeholders.select_delivery_method") }}
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
import { CartAddressType, ShipmentType, ShippingMethodType } from "@/xapi";

interface IEmits {
  (event: "change:address"): void;
  (event: "change:method", method: ShippingMethodType): void;
}

interface IProps {
  methods: ShippingMethodType[];
  shipment?: ShipmentType;
  disabled?: boolean;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  methods: () => [],
});

const address = computed<CartAddressType | undefined>(() => props.shipment?.deliveryAddress);

const method = computed<ShippingMethodType | undefined>({
  get: () =>
    props.methods.find(
      (item) => item.id === props.shipment?.shipmentMethodCode + "_" + props.shipment?.shipmentMethodOption
    ),

  set: (value?: ShippingMethodType) => value && emit("change:method", value),
});
</script>
