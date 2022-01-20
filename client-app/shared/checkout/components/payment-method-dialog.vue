<template>
  <Popup title="Select Payment method">
    <template #actions>
      <button
        class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded focus:outline-none"
        @click="$emit('result', 42)"
      >
        Close
      </button>
    </template>

    <template v-for="method in methods" :key="method.id">
      <div class="border-b border-gray-300 px-5 py-3 flex justify-between items-center space-x-4">
        <img :src="method.logoUrl || '/static/images/checkout/invoice.svg'" class="h-10 w-10 object-center" />
        <span class="flex-grow">{{ method.name }}</span>
      </div>
    </template>
  </Popup>
</template>

<script setup lang="ts">
import { Popup } from "@/components";
import { PaymentMethodType } from "@/core/api/graphql/types";
import { getAvailPaymentMethods } from "@core/api/graphql/cart";
import { onMounted, ref } from "vue";

const methods = ref<PaymentMethodType[]>([]);
const loading = ref(true);

defineEmits(["result"]);

onMounted(async () => {
  const result = await getAvailPaymentMethods();
  methods.value = result;
  loading.value = false;
});
</script>
