<template>
  <div class="flex relative">
    <div v-if="updating" class="absolute z-10 flex items-center justify-center w-full h-full bg-white bg-opacity-70">
      <i class="fas fa-spinner fa-spin text-yellow-500"></i>
    </div>
    <input
      v-model="value"
      type="number"
      :max="max"
      :min="0"
      class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9"
      :class="[!!errorMessage ? 'border-red-500 focus:border-red-500 border-r -mr-px z-10' : '']"
      :disabled="disabled"
      @input="onInput"
      @keypress="onKeypress"
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
  <div v-else-if="count && +count > 0" class="text-xs text-gray-400">already in cart</div>
  <div v-else class="mb-4"></div>
</template>

<script setup lang="ts">
import { Product } from "@/core/api/graphql/types";
import { useCart } from "@/shared/cart";
import { useField } from "vee-validate";
import { computed, PropType, ref } from "vue";
import * as yup from "yup";

// Define max qty available to add
const max = 999999;

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const emit = defineEmits(["update:lineitem"]);

const { addToCart, itemInCart, changeItemQuantity } = useCart();

const disabled = computed(() => !props.product.availabilityData?.isAvailable);
const lineItem = ref(itemInCart(props.product.id));
const count = computed(() => lineItem.value?.quantity);

let rules = yup.number().typeError("enter correct number").integer().optional().moreThan(0);

if (props.product.availabilityData?.availableQuantity) {
  rules = rules.max(props.product.availabilityData?.availableQuantity);
}

const { value, validate, errorMessage, setValue } = useField("qty", rules, {
  initialValue: count.value || undefined,
});

const updating = ref(false);

// Process button click to add/update cart line item
async function onChange() {
  if (!count.value && (!value.value || isNaN(value.value))) {
    setValue(1);
  }
  if (await validate()) {
    updating.value = true;
    try {
      if (lineItem.value) {
        await changeItemQuantity(lineItem.value.id, value.value || 0);
      } else {
        await addToCart(props.product.id, value.value || 1);
      }
      lineItem.value = itemInCart(props.product.id);
      emit("update:lineitem", lineItem.value);
    } finally {
      updating.value = false;
    }
  }
}

// Ignore non-numeric keys
function onKeypress(event: KeyboardEvent) {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
}

// Limit max value
function onInput() {
  if (value.value && value.value > max) {
    value.value = max;
  }
  if (!value.value) {
    value.value = undefined;
  }
}
</script>
