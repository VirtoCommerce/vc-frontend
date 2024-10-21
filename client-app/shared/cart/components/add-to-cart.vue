<template>
  <VcAddToCart
    :model-value="enteredQuantity"
    :name="product.id"
    :count-in-cart="countInCart"
    :min-quantity="product.minQuantity"
    :max-quantity="maxQty"
    :is-available="product.availabilityData?.isAvailable"
    :is-buyable="product.availabilityData?.isBuyable"
    :is-in-stock="product.availabilityData?.isInStock"
    :available-quantity="product.availabilityData?.availableQuantity"
    :message="errorMessage"
    :disabled="disabled"
    :loading="loading"
    show-empty-details
    validate-on-mount
    @update:model-value="onInput"
    @update:cart-item-quantity="onChange"
    @update:validation="onValidationUpdate"
  />

  <div v-if="$slots.default" class="vc-add-to-cart__badges">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { isDefined } from "@vueuse/core";
import { clone } from "lodash";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator, useGoogleAnalytics, useHistoricalEvents } from "@/core/composables";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { ValidationErrorObjectType } from "@/core/enums";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { useNotifications } from "@/shared/notification";
import type {
  Product,
  ShortCartFragment,
  ShortLineItemFragment,
  VariationType,
  ValidationErrorType,
} from "@/core/api/graphql/types";

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const notifications = useNotifications();
const { pushHistoricalEvent } = useHistoricalEvents();

interface IEmits {
  (event: "update:lineItem", lineItem: ShortLineItemFragment): void;
}

interface IProps {
  product: Product | VariationType;
  reservedSpace?: boolean;
}

const { cart, addToCart, changeItemQuantity } = useShortCart();
const { t } = useI18n();
const ga = useGoogleAnalytics();
const { translate } = useErrorsTranslator<ValidationErrorType>("validation_error");

const loading = ref(false);
const errorMessage = ref<string | undefined>();

const disabled = computed<boolean>(() => loading.value || !props.product.availabilityData?.isAvailable);
const countInCart = computed<number>(() => getLineItem(cart.value?.items)?.quantity || 0);
const minQty = computed<number>(() => props.product.minQuantity || 1);
const maxQty = computed<number>(() =>
  Math.min(
    props.product.availabilityData?.availableQuantity || LINE_ITEM_QUANTITY_LIMIT,
    isDefined(props.product.maxQuantity) ? props.product.maxQuantity : LINE_ITEM_QUANTITY_LIMIT,
  ),
);

const enteredQuantity = ref(!disabled.value ? countInCart.value || minQty.value : undefined);

function onInput(value: number): void {
  if (!value) {
    enteredQuantity.value = undefined;
  } else if (value > LINE_ITEM_QUANTITY_LIMIT) {
    enteredQuantity.value = LINE_ITEM_QUANTITY_LIMIT;
  } else {
    enteredQuantity.value = value;
  }
}

/**
 * Process button click to add/update cart line item.
 */
async function onChange() {
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
    void pushHistoricalEvent({
      eventType: "addToCart",
      sessionId: cart.value?.id,
      productId: props.product.id,
      storeId: globals.storeId,
    });
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
              return translate(el);
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

function onValidationUpdate(validation: { isValid: true } | { isValid: false; errorMessage: string }) {
  if (props.product.availabilityData?.isBuyable && !validation.isValid) {
    errorMessage.value = validation.errorMessage;
  } else {
    errorMessage.value = undefined;
  }
}
</script>
