<template>
  <div class="flex relative z-0">
    <input
      type="number"
      v-model.number="enteredQuantity"
      :disabled="disabled"
      :max="maxQty"
      :min="minQty"
      :class="{
        'border-[color:var(--color-danger)] focus:border-[color:var(--color-danger-hover)] z-10': !!errorMessage,
      }"
      class="appearance-none rounded-l rounded-r-none flex-1 w-full text-base lg:text-sm -mr-px border border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9 min-w-0"
      @input="onInput"
      @keypress="onKeypress"
    />

    <VcButton
      class="!rounded-l-none !border uppercase px-3 !text-sm"
      :is-outline="!countInCart"
      :is-waiting="loading"
      :is-disabled="disabled || !!errorMessage"
      :title="buttonText"
      @click="onChange"
    >
      <span class="hidden xl:inline">
        {{ buttonText }}
      </span>
      <i class="inline xl:hidden fas fa-shopping-cart" />
    </VcButton>
  </div>

  <!-- Info hint -->
  <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">
    {{ errorMessage }}
  </div>

  <div v-else-if="countInCart" class="text-xs text-gray-400">
    {{ $t("shared.cart.add_to_cart.already_in_cart_message", [countInCart]) }}
  </div>

  <div v-else class="mb-4"></div>
</template>

<script setup lang="ts">
import { LineItemType, Product, VariationType } from "@/core/api/graphql/types";
import { useCart } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import { useField } from "vee-validate";
import { computed, PropType, ref, watchEffect } from "vue";
import { eagerComputed } from "@vueuse/core";
import { clone } from "lodash";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { CartAddInfo } from ".";

const emit = defineEmits(["update:lineitem"]);

const props = defineProps({
  product: {
    type: Object as PropType<Product | VariationType>,
    required: true,
  },
});

// Define max qty available to add
const max = 999999;

const { cart, addToCart, changeItemQuantity } = useCart();
const { openPopup } = usePopup();
const { t } = useI18n();

const loading = ref(false);
const initialValue = ref(1);

const lineItemInCart = computed<LineItemType | undefined>(() =>
  cart.value?.items?.find((item) => item.productId === props.product.id)
);
const countInCart = eagerComputed<number>(() => lineItemInCart.value?.quantity || 0);
const minQty = eagerComputed<number>(() => props.product.minQuantity || 1);
const maxQty = eagerComputed<number>(() =>
  Math.min(props.product.availabilityData?.availableQuantity, props.product.maxQuantity || max)
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
    .typeError(t("shared.cart.add_to_cart.enter_correct_number_message"))
    .integer()
    .positive()
    .min(minQty.value)
    .max(maxQty.value)
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

  if (!valid || disabled.value) return;

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

  openPopup({
    component: CartAddInfo,
    props: { lineItem },
  });

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
  } else if (enteredQuantity.value > max) {
    enteredQuantity.value = max;
  }
}

watchEffect(() => {
  initialValue.value = countInCart.value || minQty.value;
  setValue(initialValue.value);
});
</script>
