<template>
  <div class="flex relative">
    <!-- Updating spinner -->
    <div v-if="updating" class="absolute z-10 flex items-center justify-center w-full h-full bg-white bg-opacity-70">
      <i class="fas fa-spinner fa-spin text-[color:var(--color-primary)]"></i>
    </div>

    <!-- Input with only numbers restrictions -->
    <input
      v-model="value"
      type="number"
      pattern="\d*"
      :max="maxQty"
      :min="minQty"
      class="appearance-none border rounded-none rounded-l border-r-0 flex-1 w-full text-base lg:text-sm border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9 min-w-0"
      :class="[
        !!errorMessage
          ? 'border-[color:var(--color-danger)] focus:border-[color:var(--color-danger)] border-r -mr-px z-10'
          : '',
      ]"
      :disabled="disabled"
      @input="onInput"
      @keypress="onKeypress"
    />

    <!-- Confirm button -->
    <!-- todo: Use VcButton -->
    <button
      class="rounded-r uppercase px-3 border font-roboto-condensed font-bold text-sm"
      :class="[
        disabled || !!errorMessage
          ? 'border-gray-300 text-gray-300 cursor-default'
          : count && +count > 0
          ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)] hover:border-[color:var(--color-primary-hover)]'
          : 'border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:text-white hover:bg-[color:var(--color-primary)]',
      ]"
      :disabled="disabled || !!errorMessage"
      @click="onChange"
    >
      <span class="hidden lg:inline">
        {{
          count && +count > 0
            ? $t("shared.cart.add_to_cart.update_cart_button")
            : $t("shared.cart.add_to_cart.add_to_cart_button")
        }}
      </span>
      <i class="inline lg:hidden fas fa-shopping-cart"></i>
    </button>
  </div>

  <!-- Info hint -->
  <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">{{ errorMessage }}</div>
  <div v-else-if="count && +count > 0" class="text-xs text-gray-400">
    {{ $t("shared.cart.add_to_cart.already_in_cart_message", [count]) }}
  </div>
  <div v-else class="mb-4"></div>
</template>

<script setup lang="ts">
import { Product, VariationType } from "@/core/api/graphql/types";
import { useCart } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import { useField } from "vee-validate";
import { computed, PropType, ref } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { CartAddInfo } from ".";

const { t } = useI18n();

// Define max qty available to add
const max = 999999;

const props = defineProps({
  product: {
    type: Object as PropType<Product | VariationType>,
    required: true,
  },
});

const isProduct = "variations" in (props.product as Product);
const minQty = (props.product as Product).minQuantity || 1;
const maxQty = Math.min(
  props.product.availabilityData?.availableQuantity,
  (props.product as Product).maxQuantity || max
);

const emit = defineEmits(["update:lineitem"]);

const { addToCart, itemInCart, changeItemQuantity } = useCart();
const { openPopup, closePopup } = usePopup();

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

let rules = yup
  .number()
  .typeError(t("shared.cart.add_to_cart.enter_correct_number_message"))
  .integer()
  .optional()
  .moreThan(0);

if (isProduct) {
  rules = rules.min(minQty);
}

rules = rules.max(maxQty);

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

      closePopup();
      openPopup({
        component: CartAddInfo,
        props: {
          lineItem: { ...(lineItem.value ?? {}) },
        },
      });
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
