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

    <template #append>
      <slot name="append" :on-change-handler="onChange" />
    </template>
  </QuantityControl>
</template>

<script setup lang="ts">
import { isDefined } from "@vueuse/core";
import { clone } from "lodash";
import { computed, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useErrorsTranslator, useHistoricalEvents } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { LINE_ITEM_ID_URL_SEARCH_PARAM, LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { ValidationErrorObjectType } from "@/core/enums";
import { Logger } from "@/core/utilities";
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
const route = useRoute();
const router = useRouter();
const {
  selectedConfiguration,
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

const configurableLineItemIdParam = computed(() => route.query[LINE_ITEM_ID_URL_SEARCH_PARAM]);
const mode = computed(() => props.mode ?? themeContext.value.settings.product_quantity_control ?? "button");
const defaultMinQuantity = computed(() => (mode.value === "button" ? 1 : 0));
const isConfigurable = computed(() => "isConfigurable" in product.value && product.value.isConfigurable);
const disabled = computed(() => loading.value || !product.value.availabilityData?.isAvailable);
const countInCart = computed<number>(() => getLineItem(cart.value?.items)?.quantity || 0);
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
  const _mode = lineItem ? AddToCartModeType.Update : AddToCartModeType.Add;

  if (isConfigurable.value && !validateConfigurableInput()) {
    displayErrorMessage(_mode, t("shared.catalog.product_details.product_configuration.check_your_configuration"));
    return;
  }

  loading.value = true;

  try {
    const updatedCart = await updateOrAddToCart(lineItem, _mode);

    if (isConfigurable.value && _mode === AddToCartModeType.Add) {
      const lineItemByMatchingConfiguration = getLineItemByMatchingConfiguration(updatedCart?.items);
      void router.push({ query: { [LINE_ITEM_ID_URL_SEARCH_PARAM]: lineItemByMatchingConfiguration?.id } });
    }

    if ((isConfigurable.value && _mode === AddToCartModeType.Add) || enteredQuantity.value === 0) {
      loading.value = false;
      return;
    }

    const updatedLineItem = getLineItem(updatedCart?.items);
    handleUpdateResult(updatedLineItem, _mode);
  } finally {
    loading.value = false;
  }
}

async function updateOrAddToCart(lineItem: ShortLineItemFragment | undefined, _mode: AddToCartModeType) {
  if (_mode === AddToCartModeType.Update && enteredQuantity.value === undefined) {
    return cart.value;
  }
  if (_mode === AddToCartModeType.Update && !!lineItem && enteredQuantity.value !== undefined) {
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

function handleUpdateResult(lineItem: ShortLineItemFragment | undefined, _mode: AddToCartModeType) {
  if (!lineItem) {
    Logger.error(onChange.name, 'The variable "lineItem" must be defined');
    displayErrorMessage(_mode, getValidationErrors());
    return;
  }

  emit("update:lineItem", clone(lineItem));
}

function displayErrorMessage(_mode: AddToCartModeType, message: string) {
  notifications.error({
    text: t(
      _mode === AddToCartModeType.Update
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

function getLineItem(items?: ShortLineItemFragment[]) {
  if (!isConfigurable.value) {
    return items?.find((item) => item.productId === product.value.id);
  }

  if (configurableLineItemIdParam.value) {
    return items?.find((item) => item.id === configurableLineItemIdParam.value);
  }
}

function getLineItemByMatchingConfiguration(items?: ShortLineItemFragment[]) {
  const productLineItems = items?.filter((item) => item.productId === product.value.id);

  return productLineItems?.find((item) => {
    if (item.configurationItems?.length !== selectedConfigurationInput.value.length) {
      return false;
    }

    if (item.configurationItems?.length) {
      return true;
    }

    return item.configurationItems?.every((itemConfiguration) => {
      const selectedConfigurationInputItem = selectedConfigurationInput.value.find(
        (input) => input.sectionId === itemConfiguration.sectionId,
      );

      const selectedConfigurationItem = selectedConfiguration.value?.[item.id];

      if (enteredQuantity.value !== selectedConfigurationItem?.quantity) {
        return false;
      }

      return selectedConfigurationInputItem
        ? compareInputAndConfigurationItem(selectedConfigurationInputItem, itemConfiguration)
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
</script>
