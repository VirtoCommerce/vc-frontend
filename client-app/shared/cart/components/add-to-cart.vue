<template>
  <VcAddToCart
    :model-value="enteredQuantity"
    :name="product.id"
    :count-in-cart="countInCart"
    :min-quantity="product.minQuantity"
    :max-quantity="maxQty"
    :pack-size="product.packSize"
    :is-available="product.availabilityData?.isAvailable"
    :is-buyable="product.availabilityData?.isBuyable"
    :is-in-stock="product.availabilityData?.isInStock"
    :available-quantity="product.availabilityData?.availableQuantity"
    :message="errorMessage"
    :disabled="disabled"
    :loading="loading"
    show-empty-details
    validate-on-mount
    :is-add-only="isConfigurable"
    @update:model-value="onInput"
    @update:cart-item-quantity="onChange"
    @update:validation="onValidationUpdate"
  >
    <slot />
  </VcAddToCart>
</template>

<script setup lang="ts">
import { isDefined } from "@vueuse/core";
import { clone } from "lodash";
import { computed, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator, useGoogleAnalytics, useHistoricalEvents } from "@/core/composables";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { ValidationErrorObjectType } from "@/core/enums";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { useConfigurableProduct } from "@/shared/catalog";
import { useNotifications } from "@/shared/notification";
import { AddToCartModeType } from "@/ui-kit/enums";
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

const product = toRef(props, "product");
const { cart, addToCart, changeItemQuantity } = useShortCart();
const { t } = useI18n();
const ga = useGoogleAnalytics();
const { translate } = useErrorsTranslator<ValidationErrorType>("validation_error");
const { selectedConfigurationInput } = useConfigurableProduct(product.value.id);

const loading = ref(false);
const errorMessage = ref<string | undefined>();

const isConfigurable = computed<boolean>(() => "isConfigurable" in product.value && product.value.isConfigurable);
const disabled = computed<boolean>(() => loading.value || !product.value.availabilityData?.isAvailable);
const countInCart = computed<number>(() => getLineItem(cart.value?.items)?.quantity || 0);
const minQty = computed<number>(() => product.value.minQuantity || 1);
const maxQty = computed<number>(() =>
  Math.min(
    product.value.availabilityData?.availableQuantity || LINE_ITEM_QUANTITY_LIMIT,
    isDefined(product.value.maxQuantity) ? product.value.maxQuantity : LINE_ITEM_QUANTITY_LIMIT,
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
  const mode = isAlreadyExistsInTheCart && !isConfigurable.value ? AddToCartModeType.Update : AddToCartModeType.Add;

  if (mode === AddToCartModeType.Update) {
    updatedCart = await changeItemQuantity(lineItem!.id, enteredQuantity.value || 0);
  } else {
    const inputQuantity = enteredQuantity.value || minQty.value;
    const configurationSections = isConfigurable.value ? selectedConfigurationInput.value : undefined;
    updatedCart = await addToCart(product.value.id!, inputQuantity, configurationSections);

    /**
     * Send Google Analytics event for an item added to cart.
     */
    ga.addItemToCart(product.value, inputQuantity);
    void pushHistoricalEvent({
      eventType: "addToCart",
      sessionId: cart.value?.id,
      productId: product.value.id,
      storeId: globals.storeId,
    });
  }

  lineItem = clone(getLineItem(updatedCart?.items));

  if (!lineItem) {
    Logger.error(onChange.name, 'The variable "lineItem" must be defined');
    notifications.error({
      text: t(
        mode === AddToCartModeType.Update
          ? "common.messages.fail_to_change_quantity_in_cart"
          : "common.messages.fail_add_product_to_cart",
        {
          reason: updatedCart?.validationErrors
            ?.filter(
              (validationError) =>
                validationError.objectId === product.value.id &&
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
  return items?.find((item) => item.productId === product.value.id);
}

function onValidationUpdate(validation: { isValid: true } | { isValid: false; errorMessage: string }) {
  if (product.value.availabilityData?.isBuyable && !validation.isValid) {
    errorMessage.value = validation.errorMessage;
  } else {
    errorMessage.value = undefined;
  }
}
</script>
