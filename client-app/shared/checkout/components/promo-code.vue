<template>
  <p class="text-base pb-2 font-extrabold">Promotion code</p>
  <div class="flex space-x-3" :class="[!couponValidationError && 'mb-8']">
    <input
      v-model="coupon"
      class="border rounded text-sm leading-8 flex-1 w-full border-gray-300 h-8 px-2 outline-none focus:border-gray-400"
      type="text"
      placeholder="Enter your code"
      :disabled="cartCouponApplied"
    />
    <!-- todo: use VcButton -->
    <button
      v-if="!cartCouponApplied"
      class="rounded uppercase w-10 border-2 font-roboto-condensed font-bold text-sm"
      :class="[
        coupon.length === 0 ? 'border-gray-300 bg-gray-50 text-gray-300' : 'border-yellow-500 bg-yellow-500 text-white',
      ]"
      :disabled="coupon.length === 0"
      @click="$emit('click:couponUsed')"
    >
      <i class="fas fa-check"></i>
    </button>
    <button
      v-if="cartCouponApplied"
      class="rounded uppercase w-10 border-2 font-roboto-condensed font-bold text-sm text-red-500 border-red-500 hover:text-white hover:bg-red-500"
      @click="$emit('click:couponRemoved')"
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
  <p v-if="couponValidationError" class="text-red-500 text-sm mb-3">
    This code did not match any active coupon. Was it entered correctly?
  </p>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  couponValidationError: {
    type: Boolean,
    required: true,
  },

  cartCouponApplied: {
    type: Boolean,
    required: true,
  },

  modelValue: {
    type: String,
    default: "",
  },
});
const coupon = computed({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue),
});
const emit = defineEmits(["update:modelValue", "click:couponUsed", "click:couponRemoved"]);
</script>

<style scoped></style>
