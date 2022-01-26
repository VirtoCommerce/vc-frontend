<template>
  <Popup title="Select shipping method">
    <template #actions="{ close }">
      <VcButton
        class="w-1/2 lg:w-auto uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-5"
        kind="secondary"
        outline
        @click="close"
      >
        Cancel
      </VcButton>
      <VcButton
        class="w-1/2 lg:w-auto uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-10"
        @click="
          $emit('result', selectedMethod);
          close();
        "
      >
        OK
      </VcButton>
    </template>

    <template v-for="method in availableMethods" :key="method.id">
      <div class="border-b border-gray-300 px-5 py-6 lg:py-4 flex justify-between items-center space-x-4">
        <img :src="method.logoUrl || '/static/images/checkout/shipping.svg'" class="h-10 w-10 object-center" />
        <div class="flex-grow flex flex-col lg:flex-row">
          <div class="lg:w-2/6">{{ method.code }} {{ method.optionName }}</div>
          <div class="lg:w-3/6">{{ method.optionDescription }}</div>
          <div class="lg:w-1/6 lg:text-right text-sm lg:text-base">
            <span class="font-bold lg:hidden mr-1">Price:</span>{{ method.price?.formattedAmount }}
          </div>
        </div>
        <div class="w-20 flex items-center justify-end lg:justify-center">
          <div
            v-if="method.id === selectedMethod?.id"
            class="flex items-center justify-center rounded-full w-6 h-6 bg-green-600 text-white text-sm"
          >
            <i class="fas fa-check"></i>
          </div>
          <VcButton v-else outline class="uppercase flex-grow px-3" @click="setMethod(method)"> Select </VcButton>
        </div>
      </div>
    </template>
  </Popup>
</template>

<script setup lang="ts">
import { Popup, Button as VcButton } from "@/components";
import { ShippingMethodType } from "@/core/api/graphql/types";
import { PropType, ref } from "vue";

const props = defineProps({
  currentMethodCode: {
    type: String,
    default: undefined,
  },

  currentMethodOption: {
    type: String,
    default: undefined,
  },

  availableMethods: {
    type: Array as PropType<ShippingMethodType[]>,
    default: () => [],
  },

  onResult: {
    type: Function,
    default: undefined,
  },
});

defineEmits(["result"]);

const currentMethod = props.availableMethods.find(
  (item) => item.code === props.currentMethodCode && item.optionName === props.currentMethodOption
);
const selectedMethod = ref(currentMethod);

function setMethod(method: ShippingMethodType): void {
  selectedMethod.value = method;
}
</script>
