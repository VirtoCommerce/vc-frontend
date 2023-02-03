<template>
  <VcSelect
    size="auto"
    :label="$t('shared.checkout.shipping_details_section.labels.shipping_method')"
    :items="availableMethods"
    :modelValue="selectedMethod"
    @change="setMethod"
  >
    <template #placeholder>
      <VcSelectItem>
        <VcSelectImage src="/static/icons/placeholder/select-shipping.svg" />
        <VcSelectText>
          {{ $t("common.placeholders.not_selected_shippping_method") }}
        </VcSelectText>
      </VcSelectItem>
    </template>
    <template #selected="{ item }">
      <VcSelectItem>
        <VcSelectImage :src="item.logoUrl" />
        <VcSelectText>
          {{ `${item?.code} ${item?.optionName}` }}
        </VcSelectText>
      </VcSelectItem>
    </template>
    <template #item="{ item }">
      <VcSelectItem bordered>
        <VcSelectImage :src="item.logoUrl" />
        <VcSelectText>
          {{ `${item?.code} ${item?.optionName}` }}
        </VcSelectText>
      </VcSelectItem>
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { ShipmentType, ShippingMethodType } from "@/xapi/types";
import { ref } from "vue";

interface Props {
  currentMethodId?: string;
  availableMethods?: ShippingMethodType[];
}

interface Emits {
  (event: "result", selectedMethod: ShipmentType): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const currentMethod = props.availableMethods?.find((item) => item.id === props.currentMethodId) || "";
const selectedMethod = ref(currentMethod);

function setMethod(method: ShippingMethodType): void {
  selectedMethod.value = method;
  emit("result", selectedMethod.value);
}
</script>
