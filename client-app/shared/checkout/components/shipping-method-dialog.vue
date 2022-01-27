<template>
  <Popup title="Select shipping method">
    <template #actions="{ close }">
      <button
        class="w-1/2 lg:w-auto uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-5 h-9 font-roboto-condensed text-base font-bold border-2 border-black text-black hover:bg-black hover:text-white rounded focus:outline-none"
        @click="close"
      >
        Cancel
      </button>
      <button
        class="w-1/2 lg:w-auto uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-10 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 hover:border-yellow-600 rounded focus:outline-none"
        @click="
          $emit('result', selectedMethod);
          close();
        "
      >
        OK
      </button>
    </template>

    <template v-for="method in availableMethods" :key="method.id">
      <div class="border-b border-gray-300 px-5 py-6 lg:py-4 flex justify-between items-center space-x-4">
        <Image :src="method.logoUrl" class="h-10 w-10 object-center" />
        <div class="flex-grow flex flex-col lg:flex-row">
          <div class="lg:w-2/6">{{ method.code }} {{ method.optionName }}</div>
          <div class="lg:w-3/6">{{ method.optionDescription }}</div>
          <div class="lg:w-1/6 lg:text-right text-sm lg:text-base">
            <span class="font-bold lg:hidden mr-1">Price:</span><PriceDisplay :value="method.price" />
          </div>
        </div>
        <div class="w-20 flex items-center justify-end lg:justify-center">
          <div
            v-if="method.id === selectedMethod?.id"
            class="flex items-center justify-center rounded-full w-6 h-6 bg-green-600 text-white text-sm"
          >
            <i class="fas fa-check"></i>
          </div>
          <button
            v-else
            class="uppercase flex-grow flex items-center justify-center px-3 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded focus:outline-none"
            @click="setMethod(method)"
          >
            Select
          </button>
        </div>
      </div>
    </template>
  </Popup>
</template>

<script setup lang="ts">
import { Popup, Image, PriceDisplay } from "@/components";
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
