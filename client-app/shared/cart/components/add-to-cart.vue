<template>
  <!-- @deprecated Replace VcInput with VcAddToCart https://virtocommerce.atlassian.net/browse/VCST-1657 -->
  <VcInput
    v-model.number="enteredQuantity"
    class="add-to-cart"
    size="sm"
    type="number"
    :aria-label="$t('common.labels.product_quantity')"
    :disabled="disabled"
    :max="maxQty"
    :min="minQty"
    :error="!!errorMessage"
    :message="errorMessage"
    single-line-message
    center
    show-empty-details
    select-on-click
    @input="onInput"
    @keypress="onKeypress"
    @blur="onBlur"
  >
    <template #append>
      <VcButton
        class="add-to-cart__icon-button"
        :variant="countInCart ? 'solid' : 'outline'"
        :loading="loading"
        :disabled="disabled || !!errorMessage"
        :title="buttonText"
        size="sm"
        :icon="icon"
        @click="onChange"
      >
        {{ buttonText }}
      </VcButton>

      <VcButton
        class="add-to-cart__text-button"
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
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { clone } from "lodash";
import { useField } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator, useGoogleAnalytics } from "@/core/composables";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
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

const isInStock = computed(
  () => props.product.availabilityData?.isInStock && props.product.availabilityData?.isBuyable,
);
const availableQuantity = computed(() => props.product.availabilityData?.availableQuantity);
const minQuantity = computed(() => props.product.minQuantity);
const maxQuantity = computed(() => props.product.maxQuantity);

const { cart, addToCart, changeItemQuantity } = useShortCart();
const { t } = useI18n();
const ga = useGoogleAnalytics();
const { getTranslation } = useErrorsTranslator("validation_error");
const { quantitySchema } = useQuantityValidationSchema({
  isInStock,
  availableQuantity,
  minQuantity,
  maxQuantity,
});

const loading = ref(false);

const countInCart = computed<number>(() => getLineItem(cart.value?.items)?.quantity || 0);
const minQty = computed<number>(() => minQuantity.value || 1);
const maxQty = computed<number>(() =>
  Math.min(
    props.product.availabilityData?.availableQuantity || LINE_ITEM_QUANTITY_LIMIT,
    maxQuantity.value || LINE_ITEM_QUANTITY_LIMIT,
  ),
);

const disabled = computed<boolean>(() => loading.value || !props.product.availabilityData?.isAvailable);

const icon = computed<"refresh" | "cart">(() => (countInCart.value ? "refresh" : "cart"));

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
  if (!/\d/.test(event.key)) {
    event.preventDefault();
  }
}

/**
 * Limit max value.
 */
function onInput() {
  if (!enteredQuantity.value) {
    enteredQuantity.value = undefined;
  } else if (enteredQuantity.value > LINE_ITEM_QUANTITY_LIMIT) {
    enteredQuantity.value = LINE_ITEM_QUANTITY_LIMIT;
  } else {
    setValue(enteredQuantity.value);
  }
}

function onBlur() {
  if (!enteredQuantity.value || enteredQuantity.value < 1) {
    enteredQuantity.value = countInCart.value || minQty.value;
  }
}
</script>

<style lang="scss">
.add-to-cart {
  @apply @container w-full flex-none;

  &__icon-button.vc-button {
    @apply w-24;

    @container (width > theme("containers.xxs")) {
      @apply hidden;
    }
  }

  &__text-button.vc-button {
    @apply hidden;

    @container (width > theme("containers.xxs")) {
      @apply block w-32;
    }
  }
}
</style>
