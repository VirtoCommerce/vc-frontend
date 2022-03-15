<template>
  <div class="bg-white border shadow-sm rounded">
    <div class="border-b px-5 py-4 md:px-7">
      <h2 class="text-xl font-extrabold uppercase" v-t="'shared.catalog.product_details.price_block.title'"></h2>
    </div>
    <div class="border-b px-5 py-8 md:px-7 md:py-5">
      <slot></slot>
    </div>
    <div class="flex text-center">
      <div
        class="flex items-center justify-center flex-1 py-4 px-1 border-r space-x-2 cursor-pointer hover:bg-gray-100"
      >
        <i class="fas fa-plus text-base text-[color:var(--color-primary)]"></i>
        <span
          class="text-sm text-blue-800 font-bold"
          v-t="'shared.catalog.product_details.price_block.add_to_list_button'"
        ></span>
      </div>
      <div
        class="flex items-center justify-center flex-1 py-4 px-1 border-r space-x-2 cursor-pointer hover:bg-gray-100"
      >
        <i class="fas fa-envelope fa-xl text-[color:var(--color-primary)]"></i
        ><span
          class="text-sm text-blue-800 font-bold"
          v-t="'shared.catalog.product_details.price_block.send_email_button'"
        ></span>
      </div>
      <div class="flex items-center justify-center flex-1 py-4 px-1 space-x-2 cursor-pointer hover:bg-gray-100">
        <i class="fas fa-print text-[color:var(--color-primary)]"></i>
        <span
          class="text-sm text-blue-800 font-bold"
          @click="print()"
          v-t="'shared.catalog.product_details.price_block.print_button'"
        ></span>
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
