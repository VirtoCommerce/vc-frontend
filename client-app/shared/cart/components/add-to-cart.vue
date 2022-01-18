<template>
  <div class="flex relative">
    <!-- Updating spinner -->
    <div v-if="updating" class="absolute z-10 flex items-center justify-center w-full h-full bg-white bg-opacity-70">
      <i class="fas fa-spinner fa-spin text-yellow-500"></i>
    </div>

    <!-- Input with only numbers restrictions -->
    <input
      v-model="value"
      type="number"
      pattern="\d*"
      :max="max"
      :min="0"
      class="appearance-none border rounded-none rounded-l border-r-0 flex-1 w-full text-base lg:text-sm border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9"
      :class="[!!errorMessage ? 'border-red-500 focus:border-red-500 border-r -mr-px z-10' : '']"
      :disabled="disabled"
      @input="onInput"
      @keypress="onKeypress"
    />

    <!-- Confirm button -->
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

  <!-- Info hint -->
  <div v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</div>
  <div v-else-if="count && +count > 0" class="text-xs text-gray-400">{{ count }} already in cart</div>
  <div v-else class="mb-4"></div>
</template>

<script setup lang="ts">
import { Product, VariationType } from "@/core/api/graphql/types";
import { useCart } from "@/shared/cart";
import { useField } from "vee-validate";
import { computed, PropType, ref } from "vue";
import * as yup from "yup";

// Define max qty available to add
const max = 999999;

const props = defineProps({
  product: {
    type: Object as PropType<Product | VariationType>,
    required: true,
  },
});

const isVariation = "variations" in (props.product as Product);
const isProduct = !isVariation;
const minQty = (props.product as Product).minQuantity || 1;

const emit = defineEmits(["update:lineitem"]);

const { addToCart, itemInCart, changeItemQuantity } = useCart();

const disabled = computed(
  () =>
    !(
      props.product.availabilityData?.isAvailable &&
      props.product.availabilityData?.isInStock &&
      props.product.availabilityData?.isBuyable &&
      props.product.availabilityData?.availableQuantity
    )
);
const lineItem = ref(itemInCart(props.product.id!));
const count = computed(() => lineItem.value?.quantity);
const updating = ref(false);

let rules = yup.number().typeError("enter correct number").integer().optional().moreThan(0);

if (isProduct) {
  rules = rules.min(minQty);
}

rules = rules.max(
  Math.min(props.product.availabilityData?.availableQuantity, (props.product as Product).maxQuantity || max)
);

const { value, validate, errorMessage, setValue } = useField("qty", rules, {
  initialValue: count.value || minQty,
});

/**
 * Process button click to add/update cart line item.
 */
const onChange = async () => {
  if (!count.value && (!value.value || isNaN(value.value))) {
    setValue(minQty);
  }
  if (await validate()) {
    updating.value = true;
    try {
      if (lineItem.value) {
        await changeItemQuantity(lineItem.value.id, value.value || 0);
      } else {
        await addToCart(props.product.id!, value.value || minQty);
      }
      lineItem.value = itemInCart(props.product.id!);
      emit("update:lineitem", lineItem.value);
    } finally {
      updating.value = false;
    }
  }
};

/**
 * Ignore non-numeric keys.
 */
const onKeypress = (event: KeyboardEvent) => {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
};

/**
 * Limit max value.
 */
const onInput = () => {
  if (value.value && value.value > max) {
    value.value = max;
  }
  if (!value.value) {
    value.value = undefined;
  }
};
</script>
