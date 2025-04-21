<template>
  <VcAddToCart
    :model-value="enteredQuantity"
    :name="product.id"
    :count-in-cart="countInCart"
    :min-quantity="product.minQuantity"
    :max-quantity="maxQty"
    :pack-size="product.packSize"
    :is-active="product.availabilityData?.isActive"
    :is-available="product.availabilityData?.isAvailable"
    :is-buyable="product.availabilityData?.isBuyable"
    :is-in-stock="product.availabilityData?.isInStock"
    :available-quantity="product.availabilityData?.availableQuantity"
    :message="errorMessage || notAvailableMessage"
    :disabled="disabled"
    :loading="loading"
    :show-empty-details="reservedSpace"
    validate-on-mount
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
import { useErrorsTranslator, useHistoricalEvents } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { LINE_ITEM_ID_URL_SEARCH_PARAM, LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { ValidationErrorObjectType } from "@/core/enums";
import { getUrlSearchParam, Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { useNotifications } from "@/shared/notification";
import { AddToCartModeType } from "@/ui-kit/enums";
import type { Product, ShortLineItemFragment, VariationType, ValidationErrorType } from "@/core/api/graphql/types";

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

const product = toRef(props, "product");
const { cart, addToCart, changeItemQuantity } = useShortCart();
const { t } = useI18n();
const { translate } = useErrorsTranslator<ValidationErrorType>("validation_error");
const configurableLineItemId = getUrlSearchParam(LINE_ITEM_ID_URL_SEARCH_PARAM);
const {
  selectedConfigurationInput,
  changeCartConfiguredItem,
  validateSections: validateConfigurableInput,
} = useConfigurableProduct(product.value.id);
const { trackAddItemToCart } = useAnalyticsUtils();
const { pushHistoricalEvent } = useHistoricalEvents();

const loading = ref(false);
const errorMessage = ref<string | undefined>();

const notAvailableMessage = computed<string | undefined>(() => {
  if (!product.value.availabilityData?.isBuyable || !product.value.availabilityData?.isAvailable) {
    return t("validation_error.CART_PRODUCT_UNAVAILABLE");
  }
  return undefined;
});
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
  const lineItem = getLineItem(cart.value?.items);
  const mode = lineItem ? AddToCartModeType.Update : AddToCartModeType.Add;

  if (isConfigurable.value && !validateConfigurableInput()) {
    displayErrorMessage(mode, t("shared.catalog.product_details.product_configuration.check_your_configuration"));
    return;
  }

  loading.value = true;

  try {
    const updatedCart = await updateOrAddToCart(lineItem, mode);

    if (isConfigurable.value && mode === AddToCartModeType.Add) {
      loading.value = false;
      return;
    }

    const updatedLineItem = getLineItem(updatedCart?.items);
    handleUpdateResult(updatedLineItem, mode);
  } finally {
    loading.value = false;
  }
}

async function updateOrAddToCart(lineItem: ShortLineItemFragment | undefined, mode: AddToCartModeType) {
  if (mode === AddToCartModeType.Update && !enteredQuantity.value) {
    return cart.value;
  }
  if (mode === AddToCartModeType.Update && !!lineItem && enteredQuantity.value) {
    return isConfigurable.value
      ? await changeCartConfiguredItem(lineItem.id, enteredQuantity.value, selectedConfigurationInput.value)
      : await changeItemQuantity(lineItem.id, enteredQuantity.value);
  }

  const quantity = enteredQuantity.value || minQty.value;
  const config = isConfigurable.value ? selectedConfigurationInput.value : undefined;
  const updatedCart = await addToCart(product.value.id, quantity, config);

  trackAddItemToCart(product.value, quantity);
  void pushHistoricalEvent({ eventType: "addToCart", productId: product.value.id });

  return updatedCart;
}

function handleUpdateResult(lineItem: ShortLineItemFragment | undefined, mode: AddToCartModeType) {
  if (!lineItem) {
    Logger.error(onChange.name, 'The variable "lineItem" must be defined');
    displayErrorMessage(mode, getValidationErrors());
    return;
  }

  emit("update:lineItem", clone(lineItem));
}

function displayErrorMessage(mode: AddToCartModeType, message: string) {
  notifications.error({
    text: t(
      mode === AddToCartModeType.Update
        ? "common.messages.fail_to_change_quantity_in_cart"
        : "common.messages.fail_add_product_to_cart",
      { reason: message },
    ),
    duration: 4000,
    single: true,
  });
}

function getValidationErrors(): string {
  return (
    cart.value?.validationErrors
      ?.filter(
        (error) => error.objectId === product.value.id && error.objectType === ValidationErrorObjectType.CatalogProduct,
      )
      .map(translate)
      .join(" ") || ""
  );
}

function getLineItem(items?: ShortLineItemFragment[]): ShortLineItemFragment | undefined {
  if (isConfigurable.value) {
    return configurableLineItemId ? items?.find((item) => item.id === configurableLineItemId) : undefined;
  } else {
    return items?.find((item) => item.productId === product.value.id);
  }
}

function onValidationUpdate(validation: { isValid: true } | { isValid: false; errorMessage: string }) {
  if (product.value.availabilityData?.isBuyable && !validation.isValid) {
    errorMessage.value = validation.errorMessage;
  } else {
    errorMessage.value = undefined;
  }
}
</script>
