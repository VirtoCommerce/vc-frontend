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
        class="-mr-px h-9 w-full min-w-0 flex-1 appearance-none rounded-l rounded-r-none border border-gray-300 px-1 text-center text-base leading-9 outline-none focus:border-gray-400 lg:text-sm"
        @input="onInput"
        @keypress="onKeypress"
        @click="onClick"
        @blur="onBlur"
      />

      <VcButton
        class="w-28 !rounded-l-none"
        :variant="countInCart ? 'solid' : 'outline'"
        :loading="loading"
        :disabled="disabled || !!errorMessage"
        :title="buttonText"
        size="sm"
        truncate
        @click="onChange"
      >
        {{ buttonText }}
      </VcButton>
    </div>

    <!-- Info hint -->
    <VcTooltip v-if="errorMessage" class="!block" :x-offset="28" placement="bottom-start" strategy="fixed">
      <template #trigger>
        <div class="line-clamp-1 pt-0.5 text-11 text-[color:var(--color-danger)]">
          {{ errorMessage }}
        </div>
      </template>

      <template #content>
        <div class="w-52 rounded-sm bg-white px-3.5 py-1.5 text-xs text-tooltip shadow-sm-x-y">
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
import { computed, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { number } from "yup";
import { useGoogleAnalytics } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import { useCart } from "../composables/useCart";
import type { Product, LineItemType, VariationType } from "@/core/api/graphql/types";

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const notifications = useNotifications();

interface IEmits {
  (event: "update:lineItem", lineItem: LineItemType): void;
}

interface IProps {
  product: Product | VariationType;
  reservedSpace?: boolean;
}

// Define max qty available to add
const MAX_VALUE = 999999999;

const { cart, addToCart, changeItemQuantity } = useCart();
const { t } = useI18n();
const ga = useGoogleAnalytics();

const loading = ref(false);
const inputElement = shallowRef<HTMLInputElement>();

const isDigital = computed<boolean>(() => props.product.productType === ProductType.Digital);

const countInCart = computed<number>(() => getLineItem(cart.value?.items)?.quantity || 0);
const minQty = computed<number>(() => props.product.minQuantity || 1);
const maxQty = computed<number>(() =>
  Math.min(props.product.availabilityData?.availableQuantity || MAX_VALUE, props.product.maxQuantity || MAX_VALUE),
);

const disabled = computed<boolean>(
  () =>
    loading.value ||
    (!isDigital.value && (!props.product.availabilityData?.isAvailable || !props.product.availabilityData?.isInStock)),
);

const buttonText = computed<string>(() =>
  countInCart.value ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart"),
);

const rules = computed(() =>
  toTypedSchema(
    number().typeError(t("shared.cart.add_to_cart.errors.enter_correct_number_message")).integer().positive(),
  ),
);

const enteredQuantity = ref(!disabled.value ? countInCart.value || minQty.value : undefined);

const { errorMessage, validate, setValue, setErrors } = useField("quantity", rules, {
  initialValue: enteredQuantity,
});

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

  const isRemoving = !!getLineItem(cart.value?.items) && !enteredQuantity.value;
  let lineItem = clone(getLineItem(cart.value?.items));

  let updatedCart;

  if (lineItem) {
    updatedCart = await changeItemQuantity(lineItem.id, enteredQuantity.value || 0);
  } else {
    const inputQuantity = enteredQuantity.value || minQty.value;

    updatedCart = await addToCart(props.product.id!, inputQuantity);

    /**
     * Send Google Analytics event for an item added to cart.
     */
    ga.addItemToCart(props.product, inputQuantity);
  }

  if (isRemoving) {
    lineItem!.quantity = 0;
    enteredQuantity.value = minQty.value;
    setValue(enteredQuantity.value);
  } else {
    lineItem = clone(getLineItem(updatedCart?.items));
  }

  if (!lineItem) {
    Logger.error(onChange.name, 'The variable "lineItem" must be defined');
    notifications.error({
      text: t("common.messages.fail_add_product_to_cart"),
      duration: 4000,
      single: true,
    });
  } else {
    emit("update:lineItem", lineItem);
  }

  loading.value = false;
}

function getLineItem(items?: LineItemType[]): LineItemType | undefined {
  return items?.find((item) => item.productId === props.product.id);
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
function onInput(): void {
  if (!enteredQuantity.value) {
    enteredQuantity.value = undefined;
  } else if (enteredQuantity.value > MAX_VALUE) {
    enteredQuantity.value = MAX_VALUE;
  }

  if (!enteredQuantity.value) {
    return;
  }

  if (
    props.product.minQuantity &&
    props.product.maxQuantity &&
    (enteredQuantity.value < props.product.minQuantity || enteredQuantity.value > props.product.maxQuantity)
  ) {
    setErrors(t("shared.cart.add_to_cart.errors.min_max", [props.product.minQuantity, props.product.maxQuantity]));
  } else if (props.product.minQuantity && enteredQuantity.value < props.product.minQuantity) {
    setErrors(t("shared.cart.add_to_cart.errors.min", [props.product.minQuantity]));
  } else if (props.product.maxQuantity && enteredQuantity.value > props.product.maxQuantity) {
    setErrors(t("shared.cart.add_to_cart.errors.max", [props.product.maxQuantity]));
  } else {
    setValue(enteredQuantity.value);
  }
}

function onBlur() {
  if (!enteredQuantity.value || enteredQuantity.value < 1) {
    enteredQuantity.value = countInCart.value || minQty.value;
  }
}

/**
 * Select input value.
 */
function onClick() {
  inputElement.value!.select();
}
</script>
