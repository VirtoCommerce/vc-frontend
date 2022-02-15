<template>
  <div class="bg-white border shadow-sm rounded">
    <div class="border-b px-5 py-4 md:px-7">
      <h2 class="text-xl font-extrabold uppercase">Price &amp; Delivery</h2>
    </div>
    <div class="border-b px-5 py-8 md:px-7 md:py-5">
      <slot></slot>
    </div>
    <div class="flex text-center">
      <div
        class="flex items-center justify-center flex-1 py-4 px-1 border-r space-x-2 cursor-pointer hover:bg-gray-100"
      >
        <i class="fas fa-plus text-base text-yellow-500"></i>
        <span class="text-sm text-blue-800 font-bold">Add to list</span>
      </div>
      <div
        class="flex items-center justify-center flex-1 py-4 px-1 border-r space-x-2 cursor-pointer hover:bg-gray-100"
      >
        <i class="fas fa-envelope fa-xl text-yellow-500"></i><span class="text-sm text-blue-800 font-bold">Email</span>
      </div>
      <div class="flex items-center justify-center flex-1 py-4 px-1 space-x-2 cursor-pointer hover:bg-gray-100">
        <i class="fas fa-print text-yellow-500"></i>
        <span class="text-sm text-blue-800 font-bold" @click="print()">Print</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Product } from "@/core/api/graphql/types";
import { PropType } from "vue";

defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

function print() {
  window.print();
}
</script>
