<template>
  <Popup title="Select Payment method">
    <template #actions="{ close }">
      <button
        class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold border-2 border-black text-black hover:bg-black hover:text-white rounded focus:outline-none"
        @click="close"
      >
        Cancel
      </button>
      <button
        class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 rounded focus:outline-none"
        @click="
          $emit('result', selectedMethod);
          close();
        "
      >
        OK
      </button>
    </template>
    <template v-for="method in availableMethods" :key="method.code">
      <div class="border-b border-gray-300 px-5 py-3 flex justify-between items-center space-x-4">
        <img :src="method.logoUrl || '/static/images/checkout/invoice.svg'" class="h-10 w-10 object-center" />
        <span class="flex-grow">{{ method.code }} ({{ method.price?.formattedAmount }})</span>
        <div class="w-20 flex items-center justify-center">
          <div
            v-if="method.code === selectedMethod?.code"
            class="flex items-center justify-center rounded-full w-6 h-6 bg-green-600 text-white text-sm"
          >
            <i class="fas fa-check"></i>
          </div>
          <button
            v-else
            class="uppercase flex-grow flex items-center justify-center h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded focus:outline-none"
            @click="setMethod(method)"
          >
            Choose
          </button>
        </div>
      </div>
    </template>
  </Popup>
</template>

<script setup lang="ts">
import { Popup } from "@/components";
import { PaymentMethodType } from "@/core/api/graphql/types";
import { PropType, ref } from "vue";

const props = defineProps({
  currentMethodCode: {
    type: String,
    default: undefined,
  },

  availableMethods: {
    type: Array as PropType<PaymentMethodType[]>,
    default: () => [],
  },

  onResult: {
    type: Function,
    default: undefined,
  },
});

defineEmits(["result"]);

const currentMethod = props.availableMethods.find((item) => item.code === props.currentMethodCode);
const selectedMethod = ref(currentMethod);

function setMethod(method: PaymentMethodType): void {
  selectedMethod.value = method;
}
</script>
