<template>
  <div class="flex">
    <input
      v-model="value"
      type="text"
      class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9"
      :class="[!!errorMessage ? 'border-red-500 focus:border-red-500 border-r -mr-px z-10' : '']"
      :disabled="disabled"
    />
    <button
      class="rounded-r uppercase px-3 border font-roboto-condensed font-bold text-sm"
      :class="[
        disabled || !!errorMessage
          ? 'border-gray-300 text-gray-300 cursor-default'
          : count && +count > 0
          ? 'border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 hover:border-yellow-600'
          : 'border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500',
      ]"
      :disabled="disabled || !!errorMessage"
      @click="onChange"
    >
      <span class="hidden lg:inline">
        {{ count && +count > 0 ? "Update cart" : "Add to cart" }}
      </span>
      <i class="inline lg:hidden fas fa-shopping-cart"></i>
    </button>
  </div>
  <div v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</div>
  <div v-else-if="count && +count > 0" class="text-xs text-gray-400">Already in cart</div>
  <div v-else class="text-xs text-gray-300">Enter number</div>
</template>

<script setup lang="ts">
import { Product } from "@/core/api/graphql/types";
import { useCart } from "@/shared/cart";
import { useField } from "vee-validate";
import { computed, PropType } from "vue";
import * as yup from "yup";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const emit = defineEmits(["update:lineitem"]);

const { addToCart, itemInCart, changeItemQuantity } = useCart();

const disabled = computed(() => !props.product.availabilityData?.isBuyable);
const lineItem = itemInCart(props.product.id);
const count = computed(() => lineItem?.quantity);

let rules = yup
  .number()
  .typeError("enter correct number")
  .integer()
  .optional()
  .min(0)
  .transform((_, val) => (isNaN(val) ? (count.value ? 0 : null) : +val));

if (props.product.availabilityData?.availableQuantity) {
  rules = rules.lessThan(props.product.availabilityData?.availableQuantity);
}

const { value, validate, errorMessage, setValue } = useField("qty", rules, {
  initialValue: count,
});

async function onChange() {
  if (!value.value || isNaN(value.value)) {
    setValue(1);
  }
  if (value.value && (await validate())) {
    if (lineItem) {
      changeItemQuantity(lineItem.id, value.value);
    } else {
      addToCart(props.product.id, value.value);
    }
    emit("update:lineitem", lineItem);
  }
}
</script>
