<template>
  <div class="bg-white rounded border shadow-sm">
    <div class="px-4 py-2 border-b uppercase font-extrabold text-sm">
      <div class="flex">
        <div class="flex-grow text-xl font-extrabold">Order summary</div>
      </div>
    </div>
    <div class="p-4">
      <slot name="coupons"></slot>

      <!-- Totals block -->
      <div>
        <div class="flex justify-between font-extrabold text-base mb-4">
          <span>Subtotal</span>
          <span>{{ cart.subTotal?.formattedAmount }}</span>
        </div>
        <div class="py-2 border-t border-b font-normal text-base">
          <div class="flex justify-between" @click="discountsCollapsed = !discountsCollapsed">
            <span class="flex items-center" :class="{ 'cursor-pointer': cart.discounts && cart.discounts.length > 0 }"
              >Discount
              <i
                v-if="cart.discounts && cart.discounts.length > 0 && !discountsCollapsed"
                class="fas fa-caret-down ml-1 text-yellow-500"
              ></i
              ><i
                v-if="cart.discounts && cart.discounts.length > 0 && discountsCollapsed"
                class="fas fa-caret-up ml-1 text-yellow-500"
              ></i>
            </span>
            <span>{{ cart.discountTotal?.formattedAmount }}</span>
          </div>
          <div v-if="cart.discounts && cart.discounts.length > 0 && discountsCollapsed">
            <ul v-for="(discount, index) in cart.discounts" :key="index" class="list-disc pl-5 text-gray-400">
              <li>
                <div class="flex justify-between">
                  <span class="text-sm">{{ discount?.description }}</span>
                  <span>{{ cart.currency?.symbol }}{{ discount?.amount }}</span>
                </div>
              </li>
            </ul>
          </div>
          <div class="flex justify-between">
            <span>Tax</span>
            <span>{{ cart.taxTotal?.formattedAmount }}</span>
          </div>
          <div class="flex justify-between">
            <span>Shipping cost</span>
            <span>{{ cart.shippingTotal?.formattedAmount }}</span>
          </div>
        </div>
        <div class="flex justify-between font-extrabold text-base mt-4">
          <span>Total</span>
          <span class="text-green-700">{{ cart.total?.formattedAmount }}</span>
        </div>
      </div>

      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CartType } from "@/core/api/graphql/types";
import { PropType, ref } from "vue";

defineProps({
  cart: {
    type: Object as PropType<CartType>,
    required: true,
  },
});

const discountsCollapsed = ref(false);
</script>

<style scoped></style>
