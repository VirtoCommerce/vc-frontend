<template>
  <div class="flex relative z-0">
    <input
      ref="input"
      type="number"
      v-model.number="enteredQuantity"
      :disabled="disabled"
      :max="maxQty"
      :min="minQty"
      :class="{
        'border-[color:var(--color-danger)] focus:border-[color:var(--color-danger-hover)] z-10': !!errorMessage,
      }"
      class="appearance-none rounded-l rounded-r-none flex-1 w-full text-base lg:text-sm -mr-px border border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9 min-w-0 text-center"
      @input="onInput"
      @keypress="onKeypress"
      @click="onClick"
    />

    <VcButton
      class="!rounded-l-none !border uppercase px-3 !text-13 min-w-[52%]"
      :is-outline="!countInCart"
      :is-waiting="loading"
      :is-disabled="disabled || !!errorMessage"
      :title="buttonText"
      @click="onChange"
    >
      {{ buttonText }}
    </VcButton>
  </div>

  <!-- Info hint -->
  <VcTooltip v-if="errorMessage" :xOffset="28" placement="bottom-start" strategy="fixed">
    <template #trigger>
      <div class="pt-0.5 text-11 text-[color:var(--color-danger)] xs:line-clamp-1">
        {{ errorMessage }}
      </div>
    </template>

    <template #content>
      <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5 w-52">
        {{ errorMessage }}
      </div>
    </template>
  </VcTooltip>

  <div v-else-if="reservedSpace" class="h-2.5 lg:h-4"></div>
</template>

<script setup lang="ts">
import { LineItemType, Product, VariationType } from "@/xapi/types";
import { useCart } from "@/shared/cart";
import { useField } from "vee-validate";
import { computed, PropType, ref, watchEffect } from "vue";
import { eagerComputed } from "@vueuse/core";
import { clone } from "lodash";
import { useI18n } from "vue-i18n";
import * as yup from "yup";

const emit = defineEmits(["update:lineitem"]);

const input = ref<HTMLInputElement>();

const props = defineProps({
  product: {
    type: Object as PropType<Product | VariationType>,
    required: true,
  },
  reservedSpace: {
    type: Boolean,
    default: false,
  },
});

// Define max qty available to add
const MAX_VALUE = 999999;

const { cart, addToCart, changeItemQuantity } = useCart();
const { t } = useI18n();

const loading = ref(false);
const initialValue = ref();

const lineItemInCart = computed<LineItemType | undefined>(() =>
  cart.value?.items?.find((item) => item.productId === props.product.id)
);
const countInCart = eagerComputed<number>(() => lineItemInCart.value?.quantity || 0);
const minQty = eagerComputed<number>(() => props.product.minQuantity || 1);
const maxQty = eagerComputed<number>(() =>
  Math.min(props.product.availabilityData?.availableQuantity, props.product.maxQuantity || MAX_VALUE)
);

const disabled = eagerComputed<boolean>(
  () =>
    loading.value ||
    !(
      props.product.availabilityData?.isAvailable &&
      props.product.availabilityData?.isInStock &&
      props.product.availabilityData?.isBuyable &&
      props.product.availabilityData?.availableQuantity
    )
);

const buttonText = computed<string>(() =>
  countInCart.value ? t("shared.cart.add_to_cart.update_cart_button") : t("shared.cart.add_to_cart.add_to_cart_button")
);

const rules = computed(() =>
  yup
    .number()
    .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
    .integer()
    .positive()
    .min(minQty.value, ({ min }) => t("shared.cart.add_to_cart.errors.min", [min]))
    .max(maxQty.value, ({ max }) => t("shared.cart.add_to_cart.errors.max", [max]))
);

const { value: enteredQuantity, validate, errorMessage, setValue } = useField("qty", rules, { initialValue });

/**
 * Process button click to add/update cart line item.
 */
async function onChange() {
  if (!countInCart.value && (!enteredQuantity.value || isNaN(enteredQuantity.value))) {
    setValue(minQty.value);
  }

  const { valid } = await validate();

  if (!valid || disabled.value) {
    return;
  }

  loading.value = true;

  const isRemoving = !!lineItemInCart.value && !enteredQuantity.value;
  let lineItem = clone(lineItemInCart.value);

  if (lineItem) {
    await changeItemQuantity(lineItem.id, enteredQuantity.value || 0);
  } else {
    await addToCart(props.product.id!, enteredQuantity.value || minQty.value);
  }

  if (isRemoving) {
    lineItem!.quantity = 0;
    initialValue.value = minQty.value;
    setValue(initialValue.value);
  } else {
    lineItem = clone(lineItemInCart.value);
  }

  emit("update:lineitem", lineItem);

  loading.value = false;
}

/**
 * Ignore non-numeric keys.
 */
function onKeypress(event: KeyboardEvent) {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
}

/**
 * Limit max value.
 */
function onInput() {
  if (!enteredQuantity.value) {
    enteredQuantity.value = undefined;
  } else if (enteredQuantity.value > MAX_VALUE) {
    enteredQuantity.value = MAX_VALUE;
  }
}

/**
 * Select input value.
 */
function onClick() {
  (input.value as HTMLInputElement).select();
}

watchEffect(() => {
  if (!disabled.value) {
    initialValue.value = countInCart.value || minQty.value;
    setValue(initialValue.value);
  }
});
</script>
