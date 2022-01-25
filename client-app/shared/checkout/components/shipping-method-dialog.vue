<template>
  <Popup title="Select Shipment method">
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

    <template v-for="method in methods" :key="method.id">
      <div class="border-b border-gray-300 px-5 py-3 flex justify-between items-center space-x-4">
        <img :src="method.logoUrl || '/static/images/checkout/shipping.svg'" class="h-10 w-10 object-center" />
        <span class="flex-grow">{{ method.optionName }} ({{ method.price?.formattedAmount }})</span>
        <div class="w-20 flex items-center justify-center">
          <div
            v-if="method.id === selectedMethod?.id"
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
import { ShippingMethodType } from "@/core/api/graphql/types";
import { getAvailShippingMethods } from "@core/api/graphql/cart";
import { onMounted, ref } from "vue";

const props = defineProps({
  currentMethod: {
    type: String,
    default: undefined,
  },
  onResult: {
    type: Function,
    default: undefined,
  },
});

defineEmits(["result"]);

const methods = ref<ShippingMethodType[]>([]);
const loading = ref(true);
const selectedMethod = ref();

function setMethod(method: ShippingMethodType): void {
  selectedMethod.value = method;
}

onMounted(async () => {
  selectedMethod.value = props.currentMethod;
  const result = await getAvailShippingMethods();
  methods.value = result;
  loading.value = false;
});
</script>
