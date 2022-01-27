<template>
  <Popup :variant="variant" :title="title">
    <template #actions="{ close }">
      <button
        class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded focus:outline-none"
        @click="close"
      >
        Continue shopping
      </button>
      <router-link
        to="/checkout"
        class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold rounded bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none"
        @click="close"
        >View cart</router-link
      >
    </template>

    <div class="hidden lg:block">
      <table class="w-full">
        <thead class="border-b border-gray-200">
          <tr>
            <th class="px-5 py-3 text-sm font-bold">Product</th>
            <th class="px-5 py-3 text-sm font-bold text-center">Quantity</th>
            <th class="px-5 py-3 text-sm font-bold text-right">Total</th>
          </tr>
        </thead>
        <tbody class="border-b border-gray-200">
          <tr>
            <td class="px-5 py-3">
              <div class="flex items-center">
                <Image class="border object-contain rounded-sm" :src="lineItem.imageUrl" width="72" height="72" />
                <div class="ml-4 font-bold text-blue-700">{{ lineItem.name }}</div>
              </div>
            </td>
            <td class="px-5 py-3 text-center">{{ lineItem.quantity }}</td>
            <td class="px-5 py-3 text-right text-green-700 font-bold">
              <PriceDisplay :value="lineItem.extendedPrice" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="block lg:hidden">
      <div class="flex items-center border-b border-gray-200 p-5">
        <Image class="border object-contain rounded-sm" :src="lineItem.imageUrl" width="72" height="72" />
        <div class="ml-4 font-bold text-blue-700">{{ lineItem.name }}</div>
      </div>

      <div class="flex items-center justify-between px-5 py-3">
        <div>
          Quantity: <span class="font-bold">{{ lineItem.quantity }}</span>
        </div>
        <div>
          Total:
          <span class="font-bold text-green-700">
            <PriceDisplay :value="lineItem.extendedPrice" />
          </span>
        </div>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { LineItemType } from "@/core/api/graphql/types";
import { Popup, Image, PriceDisplay } from "@/components";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },

  lineItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },
});

const variant = computed(() => (props.lineItem.quantity === 0 ? "warn" : "success"));
const title = computed(() =>
  props.lineItem.quantity === 0 ? "1 Product removed from cart" : "1 Product added to cart"
);
</script>
