<template>
  <!-- TODO: Use VcInput https://virtocommerce.atlassian.net/browse/VCST-1095 -->
  <div class="add-to-cart">
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

    <div v-else-if="reservedSpace" class="h-4"></div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { clone } from "lodash";
import { useField } from "vee-validate";
import { computed, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator, useGoogleAnalytics } from "@/core/composables";
import { ValidationErrorObjectType } from "@/core/enums";
import { Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { useNotifications } from "@/shared/notification";
import { useQuantityValidationSchema } from "@/ui-kit/composables";
import type { Product, ShortCartFragment, ShortLineItemFragment, VariationType } from "@/core/api/graphql/types";
import type { NamedValue } from "vue-i18n";

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const notifications = useNotifications();

interface IEmits {
  (event: "update:lineItem", lineItem: ShortLineItemFragment): void;
}

interface IProps {
  product: Product | VariationType;
  reservedSpace?: boolean;
}

// Define max qty available to add
const MAX_VALUE = 999999999;

const availableQuantity = computed(() => props.product.availabilityData?.availableQuantity);
const minQuantity = computed(() => props.product.minQuantity);
const maxQuantity = computed(() => props.product.maxQuantity);

const { cart, addToCart, changeItemQuantity } = useShortCart();
const { t } = useI18n();
const ga = useGoogleAnalytics();
const { getTranslation } = useErrorsTranslator("validation_error");
const { quantitySchema } = useQuantityValidationSchema({
  availableQuantity,
  minQuantity,
  maxQuantity,
});

const loading = ref(false);
const inputElement = shallowRef<HTMLInputElement>();

const countInCart = computed<number>(() => getLineItem(cart.value?.items)?.quantity || 0);
const minQty = computed<number>(() => minQuantity.value || 1);
const maxQty = computed<number>(() =>
  Math.min(props.product.availabilityData?.availableQuantity || MAX_VALUE, maxQuantity.value || MAX_VALUE),
);

const disabled = computed<boolean>(() => loading.value || !props.product.availabilityData?.isAvailable);

const buttonText = computed<string>(() =>
  countInCart.value ? t("common.buttons.update_cart") : t("common.buttons.add_to_cart"),
);

const rules = computed(() => toTypedSchema(quantitySchema.value));

const enteredQuantity = ref(!disabled.value ? countInCart.value || minQty.value : undefined);

const { errorMessage, validate, setValue } = useField("quantity", rules, {
  initialValue: enteredQuantity,
  validateOnMount: true,
});

/**
 * Process button click to add/update cart line item.
 */
async function onChange() {
  const { valid } = await validate();

  if (!valid || disabled.value) {
    return;
  }

  loading.value = true;

  let lineItem = getLineItem(cart.value?.items);

  let updatedCart: ShortCartFragment | undefined;

  const isAlreadyExistsInTheCart = !!lineItem;
  if (isAlreadyExistsInTheCart) {
    updatedCart = await changeItemQuantity(lineItem!.id, enteredQuantity.value || 0);
  } else {
    const inputQuantity = enteredQuantity.value || minQty.value;

    updatedCart = await addToCart(props.product.id!, inputQuantity);

    /**
     * Send Google Analytics event for an item added to cart.
     */
    ga.addItemToCart(props.product, inputQuantity);
  }

  lineItem = clone(getLineItem(updatedCart?.items));

  if (!lineItem) {
    Logger.error(onChange.name, 'The variable "lineItem" must be defined');
    notifications.error({
      text: t(
        isAlreadyExistsInTheCart
          ? "common.messages.fail_to_change_quantity_in_cart"
          : "common.messages.fail_add_product_to_cart",
        {
          reason: updatedCart?.validationErrors
            ?.filter(
              (validationError) =>
                validationError.objectId === props.product.id &&
                validationError.objectType === ValidationErrorObjectType.CatalogProduct,
            )
            .map((el) => {
              return getTranslation({
                code: el.errorCode,
                parameters: el.errorParameters?.reduce((acc, err) => {
                  acc[err.key] = err.value;
                  return acc;
                }, {} as NamedValue),
                description: el.errorMessage,
              });
            })
            .join(" "),
        },
      ),
      duration: 4000,
      single: true,
    });
  } else {
    emit("update:lineItem", lineItem);
  }

  loading.value = false;
}

function getLineItem(items?: ShortLineItemFragment[]): ShortLineItemFragment | undefined {
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
function onInput() {
  if (!enteredQuantity.value) {
    enteredQuantity.value = undefined;
  } else if (enteredQuantity.value > MAX_VALUE) {
    enteredQuantity.value = MAX_VALUE;
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

<style lang="scss">
.add-to-cart {
  .vc-line-item & {
    @apply w-[11.75rem] xs:w-[13rem] 2xl:w-[15.7rem];
  }
}
</style>
