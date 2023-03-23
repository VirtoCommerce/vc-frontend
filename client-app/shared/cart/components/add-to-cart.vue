<template>
  <div>
    <div class="relative z-0 flex">
      <input
        ref="inputElement"
        v-model.number="enteredQuantity"
        type="number"
        :disabled="disabled"
        :max="maxQty"
        :min="minQty"
        :class="{
          'z-10 border-[color:var(--color-danger)] focus:border-[color:var(--color-danger-hover)]': !!errorMessage,
        }"
        class="-mr-px h-9 w-full min-w-0 flex-1 appearance-none rounded-l rounded-r-none border border-gray-300 px-3 text-center text-base leading-9 outline-none focus:border-gray-400 lg:text-sm"
        @input="onInput"
        @keypress="onKeypress"
        @click="onClick"
      />

      <VcButton
        class="min-w-[52%] !rounded-l-none !border px-3 !text-13 uppercase"
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
    <VcTooltip v-if="errorMessage" class="!block" :x-offset="28" placement="bottom-start" strategy="fixed">
      <template #trigger>
        <div class="pt-0.5 text-11 text-[color:var(--color-danger)] xs:line-clamp-1">
          {{ errorMessage }}
        </div>
      </template>

      <template #content>
        <div class="w-52 rounded-sm bg-white py-1.5 px-3.5 text-xs text-tooltip shadow-sm-x-y">
          {{ errorMessage }}
        </div>
      </template>
    </VcTooltip>

    <div v-else-if="reservedSpace" class="h-2.5 lg:h-4"></div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { clone } from "lodash";
import { useField } from "vee-validate";
import { computed, ref, shallowRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { useGoogleAnalytics } from "@/core/composables";
import useCart from "../composables/useCart";
import type { LineItemType, Product, VariationType } from "@/xapi/types";

interface IEmits {
  (event: "update:lineItem", lineItem: LineItemType): void;
}

interface IProps {
  product: Product | VariationType;
  reservedSpace?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

// Define max qty available to add
const MAX_VALUE = 999999;

const { cart, addToCart, changeItemQuantity } = useCart();
const { t } = useI18n();
const ga = useGoogleAnalytics();

const loading = ref(false);
const initialValue = ref();
const inputElement = shallowRef<HTMLInputElement>();

const lineItemInCart = computed<LineItemType | undefined>(() =>
  cart.value?.items?.find((item) => item.productId === props.product.id)
);
const countInCart = computed<number>(() => lineItemInCart.value?.quantity || 0);
const minQty = computed<number>(() => props.product.minQuantity || 1);
const maxQty = computed<number>(() =>
  Math.min(props.product.availabilityData?.availableQuantity, props.product.maxQuantity || MAX_VALUE)
);

const disabled = computed<boolean>(
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
  countInCart.value ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart")
);

const rules = computed(() =>
  toTypedSchema(
    number()
      .typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message"))
      .integer()
      .positive()
      .min(minQty.value, ({ min }) => t("shared.cart.add_to_cart.errors.min", [min]))
      .max(maxQty.value, ({ max }) => t("shared.cart.add_to_cart.errors.max", [max]))
  )
);

const { value: enteredQuantity, validate, errorMessage, setValue } = useField("quantity", rules, { initialValue });

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
    const inputQuantity = enteredQuantity.value || minQty.value;

    await addToCart(props.product.id!, inputQuantity);

    /**
     * Send Google Analytics event for an item added to cart.
     */
    ga.addItemToCart(props.product, inputQuantity);
  }

  if (isRemoving) {
    lineItem!.quantity = 0;
    initialValue.value = minQty.value;
    setValue(initialValue.value);
  } else {
    lineItem = clone(lineItemInCart.value);
  }

  if (!lineItem) {
    throw new ReferenceError(`The variable "lineItem" must be defined`);
  }

  emit("update:lineItem", lineItem);

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
  inputElement.value!.select();
}

watchEffect(() => {
  if (!disabled.value) {
    initialValue.value = countInCart.value || minQty.value;
    setValue(initialValue.value);
  }
});
</script>
