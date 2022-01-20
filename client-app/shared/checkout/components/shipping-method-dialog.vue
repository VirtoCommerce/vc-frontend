<template>
  <Popup title="Select Shipment method">
    <template v-for="method in methods" :key="method.id">
      <div class="border-b border-gray-300 px-5 py-3 flex justify-between items-center space-x-4">
        <img :src="method.logoUrl || '/static/images/checkout/shipping.svg'" class="h-10 w-10 object-center" />
        <span class="flex-grow">{{ method.optionName }}</span>
      </div>
    </template>
  </Popup>
</template>

<script setup lang="ts">
import { Popup } from "@/components";
import { ShippingMethodType } from "@/core/api/graphql/types";
import { getAvailShippingMethods } from "@core/api/graphql/cart";
import { onMounted, ref } from "vue";

const methods = ref<ShippingMethodType[]>([]);
const loading = ref(true);

onMounted(async () => {
  const result = await getAvailShippingMethods();
  methods.value = result;
  loading.value = false;
});
</script>
