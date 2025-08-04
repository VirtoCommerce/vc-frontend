<template>
  <QuantityControl
    :mode
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
    :timeout="DEFAULT_DEBOUNCE_IN_MS"
    :allow-zero="mode === 'stepper'"
    @update:model-value="onInput"
    @update:cart-item-quantity="onChange"
    @update:validation="onValidationUpdate"
  >
    <slot />
  </QuantityControl>
</template>

<script setup lang="ts">
import { isDefined } from "@vueuse/core";
import { clone } from "lodash";
import { computed, nextTick, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useErrorsTranslator, useHistoricalEvents } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { LINE_ITEM_ID_URL_SEARCH_PARAM, LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { ValidationErrorObjectType } from "@/core/enums";
import { getUrlSearchParam, Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { useNotifications } from "@/shared/notification";
import { AddToCartModeType } from "@/ui-kit/enums";
import { DEFAULT_DEBOUNCE_IN_MS } from "../constants";
import type { Product, ShortLineItemFragment, VariationType, ValidationErrorType } from "@/core/api/graphql/types";
import QuantityControl from "@/shared/common/components/quantity-control.vue";

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const notifications = useNotifications();

interface IEmits {
  (event: "update:lineItem", lineItem: ShortLineItemFragment): void;
}

interface IProps {
  mode?: "button" | "stepper";
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
  compareInputAndConfigurationItem,
  validateSections: validateConfigurableInput,
} = useConfigurableProduct(product.value.id);
const { trackAddItemToCart } = useAnalyticsUtils();
const { pushHistoricalEvent } = useHistoricalEvents();
const { themeContext } = useThemeContext();

const loading = ref(false);
const errorMessage = ref<string | undefined>();

const notAvailableMessage = computed<string | undefined>(() => {
  if (!product.value.availabilityData?.isBuyable || !product.value.availabilityData?.isAvailable) {
    return t("validation_error.CART_PRODUCT_UNAVAILABLE");
  }
  return undefined;
});

const mode = computed(() => props.mode ?? themeContext.value.settings.product_quantity_control ?? "button");
const defaultMinQuantity = computed(() => (mode.value === "button" ? 1 : 0));
const isConfigurable = computed(() => "isConfigurable" in product.value && product.value.isConfigurable);
const disabled = computed(() => loading.value || !product.value.availabilityData?.isAvailable);
const countInCart = computed(() => {
  // Explicitly depend on selectedConfigurationInput for configurable products
  // This ensures countInCart recalculates when configuration changes
  if (isConfigurable.value) {
    selectedConfigurationInput.value; // Access to establish reactive dependency
  }
  return getLineItem(cart.value?.items)?.quantity || 0;
});
const minQty = computed(() => product.value.minQuantity || defaultMinQuantity.value);
const maxQty = computed(() =>
  Math.min(
    product.value.availabilityData?.availableQuantity || LINE_ITEM_QUANTITY_LIMIT,
    isDefined(product.value.maxQuantity) && product.value.maxQuantity !== 0
      ? product.value.maxQuantity
      : LINE_ITEM_QUANTITY_LIMIT,
  ),
);
const defaultQuantity = mode.value === "button" ? countInCart.value || minQty.value : countInCart.value;
const enteredQuantity = ref(!disabled.value ? defaultQuantity : undefined);

function onInput(value: number): void {
  if (!Number.isFinite(value)) {
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
  const addToCartMode = lineItem ? AddToCartModeType.Update : AddToCartModeType.Add;

  if (isConfigurable.value && !validateConfigurableInput()) {
    displayErrorMessage(
      addToCartMode,
      t("shared.catalog.product_details.product_configuration.check_your_configuration"),
    );
    return;
  }

  loading.value = true;

  try {
    const updatedCart = await updateOrAddToCart(lineItem, addToCartMode);

    if ((isConfigurable.value && addToCartMode === AddToCartModeType.Add) || enteredQuantity.value === 0) {
      loading.value = false;
      return;
    }

    const updatedLineItem = getLineItem(updatedCart?.items);
    handleUpdateResult(updatedLineItem, addToCartMode);
  } finally {
    loading.value = false;
  }
}

async function updateOrAddToCart(lineItem: ShortLineItemFragment | undefined, addToCartMode: AddToCartModeType) {
  if (addToCartMode === AddToCartModeType.Update && enteredQuantity.value === undefined) {
    return cart.value;
  }
  if (addToCartMode === AddToCartModeType.Update && !!lineItem && enteredQuantity.value !== undefined) {
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

function handleUpdateResult(lineItem: ShortLineItemFragment | undefined, addToCartMode: AddToCartModeType) {
  if (!lineItem) {
    Logger.error(onChange.name, 'The variable "lineItem" must be defined');
    displayErrorMessage(addToCartMode, getValidationErrors());
    return;
  }

  emit("update:lineItem", clone(lineItem));
}

function displayErrorMessage(addToCartMode: AddToCartModeType, message: string) {
  notifications.error({
    text: t(
      addToCartMode === AddToCartModeType.Update
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
  if (!isConfigurable.value) {
    return items?.find((item) => item.productId === product.value.id);
  }

  if (configurableLineItemId) {
    return items?.find((item) => item.id === configurableLineItemId);
  }

  const lineItems = items?.filter((item) => item.productId === product.value.id);

  return lineItems?.find((item) => {
    if (item.configurationItems?.length !== selectedConfigurationInput.value.length) {
      return false;
    }

    if (item.configurationItems?.length === 0 && selectedConfigurationInput.value.length === 0) {
      return true;
    }

    return item.configurationItems?.every((itemConfiguration) => {
      const selectedConfigurationItem = selectedConfigurationInput.value.find(
        (input) => input.sectionId === itemConfiguration.sectionId,
      );

      return selectedConfigurationItem
        ? compareInputAndConfigurationItem(selectedConfigurationItem, itemConfiguration)
        : false;
    });
  });
}

function onValidationUpdate(validation: { isValid: true } | { isValid: false; errorMessage: string }) {
  if (product.value.availabilityData?.isBuyable && !validation.isValid) {
    errorMessage.value = validation.errorMessage;
  } else {
    errorMessage.value = undefined;
  }
}

watch(selectedConfigurationInput, async () => {
  await nextTick();
  enteredQuantity.value = countInCart.value || minQty.value;
});
</script>
