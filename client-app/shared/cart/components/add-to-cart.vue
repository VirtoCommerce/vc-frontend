<template>
  <div v-if="isConfigurable">
    <VcButton
      :variant="countInCart ? 'solid' : 'outline'"
      :loading="loading"
      :disabled="configurableDisabled"
      :title="configurableButtonText"
      truncate
      full-width
      @click="onConfigurableSubmit"
    >
      {{ configurableButtonText }}
    </VcButton>

    <div class="mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5 empty:hidden">
      <slot />
    </div>
  </div>

  <QuantityControl
    v-else
    :mode="$cfg.product_quantity_control"
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
    :disabled="$cfg.product_quantity_control === 'stepper' ? disabledStepper : disabled"
    :loading="$cfg.product_quantity_control === 'stepper' ? loadingStepper : loading"
    :show-empty-details="reservedSpace"
    validate-on-mount
    :timeout="DEFAULT_DEBOUNCE_IN_MS"
    :allow-zero="$cfg.product_quantity_control === 'stepper'"
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
import { computed, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useErrorsTranslator, useHistoricalEvents } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { LINE_ITEM_ID_URL_SEARCH_PARAM, LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { ValidationErrorObjectType } from "@/core/enums";
import { Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { useConfigurableLineItemId, useConfigurableProduct } from "@/shared/catalog/composables";
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
  product: Product | VariationType;
  reservedSpace?: boolean;
}

type CartValidationResultType = {
  validationErrors?: ValidationErrorType[];
  items?: Array<ShortLineItemFragment & { validationErrors?: ValidationErrorType[] }>;
};

function isDefinedString(value: string | undefined): value is string {
  return Boolean(value);
}

const product = toRef(props, "product");
const { cart, addToCart, changeItemQuantityBatched, addToCartLoading, changeItemQuantityBatchedOverflowed } =
  useShortCart();
const { t } = useI18n();
const { translate } = useErrorsTranslator<ValidationErrorType>("validation_error");
const route = useRoute();
const router = useRouter();
const { configurableLineItemId } = useConfigurableLineItemId();
const {
  selectedConfigurationInput,
  changeCartConfiguredItem,
  markConfigurationAsSaved,
  validateSections: validateConfigurableInput,
  configuredLineItem,
  isRequiredConfigurationComplete,
  loading: configLoading,
} = useConfigurableProduct(product.value.id);
const { trackAddItemToCart } = useAnalyticsUtils();
const { pushHistoricalEvent } = useHistoricalEvents();
const { themeContext } = useThemeContext();

const loading = ref(false);
const errorMessage = ref<string | undefined>();

const notAvailableMessage = computed(() => {
  if (!product.value.availabilityData?.isBuyable || !product.value.availabilityData?.isAvailable) {
    return t("validation_error.CART_PRODUCT_UNAVAILABLE");
  }
  return undefined;
});

const defaultMinQuantity = computed(() => (themeContext.value.settings.product_quantity_control === "button" ? 1 : 0));
const isConfigurable = computed(() => "isConfigurable" in product.value && product.value.isConfigurable);
const configurableButtonText = computed(() =>
  countInCart.value ? t("ui_kit.buttons.update_cart") : t("ui_kit.buttons.add_to_cart"),
);
const disabled = computed(() => loading.value || !product.value.availabilityData?.isAvailable);
const configurableDisabled = computed(
  () =>
    loading.value ||
    !product.value.availabilityData?.isAvailable ||
    configLoading.value ||
    !isRequiredConfigurationComplete.value,
);
const disabledStepper = computed(
  () =>
    !product.value.availabilityData?.isAvailable || changeItemQuantityBatchedOverflowed.value || addToCartLoading.value,
);
const loadingStepper = computed(() => changeItemQuantityBatchedOverflowed.value || addToCartLoading.value);
const countInCart = computed(() => getLineItem(cart.value?.items)?.quantity || 0);
const minQty = computed(() => product.value.minQuantity || defaultMinQuantity.value);
const maxQty = computed(() =>
  Math.min(
    product.value.availabilityData?.availableQuantity || LINE_ITEM_QUANTITY_LIMIT,
    isDefined(product.value.maxQuantity) && product.value.maxQuantity !== 0
      ? product.value.maxQuantity
      : LINE_ITEM_QUANTITY_LIMIT,
  ),
);
const defaultQuantity = computed(() =>
  themeContext.value.settings.product_quantity_control === "button"
    ? countInCart.value || minQty.value
    : countInCart.value,
);
const enteredQuantity = ref(!disabled.value ? defaultQuantity.value : undefined);

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
 * Process configurable product button click (Add to cart / Update cart).
 */
async function onConfigurableSubmit() {
  const lineItem = getLineItem(cart.value?.items);
  const mode = lineItem ? AddToCartModeType.Update : AddToCartModeType.Add;

  if (!validateConfigurableInput()) {
    displayErrorMessage(mode, t("shared.catalog.product_details.product_configuration.check_your_configuration"));
    return;
  }

  loading.value = true;

  try {
    if (mode === AddToCartModeType.Update && lineItem) {
      const updatedCart = (await changeCartConfiguredItem(lineItem.id, undefined, selectedConfigurationInput.value)) as
        | CartValidationResultType
        | undefined;
      const validationMessages = getConfigurableValidationErrors(updatedCart, lineItem.id);
      if (validationMessages.length) {
        displayErrorMessage(mode, validationMessages.join(" "));
        return;
      }

      markConfigurationAsSaved();
      return;
    }

    // TODO: Workaround — comparing cart items before/after to find the newly added lineItemId.
    // Replace once backend provides the lineItemId directly (new mutation or updated response).
    const existingItemIds = new Set(cart.value?.items?.map((item) => item.id));
    const updatedCart = await addToCart(product.value.id, minQty.value, selectedConfigurationInput.value);
    const validationMessages = getConfigurableValidationErrors(updatedCart);
    if (validationMessages.length) {
      displayErrorMessage(mode, validationMessages.join(" "));
      return;
    }

    // configuredLineItem reflects the latest price preview from CreateConfiguredLineItem mutation.
    // ShortLineItemFragment in the cart response does not include price data.
    trackAddItemToCart(product.value, minQty.value, {
      configuredPrice: configuredLineItem.value
        ? {
            list: configuredLineItem.value.listPrice?.amount ?? 0,
            actual: configuredLineItem.value.salePrice?.amount ?? 0,
          }
        : undefined,
    });
    void pushHistoricalEvent({ eventType: "addToCart", productId: product.value.id });

    markConfigurationAsSaved();
    const newItem = updatedCart?.items?.find(
      (item) => item.productId === product.value.id && !existingItemIds.has(item.id),
    );
    if (newItem) {
      void router.replace({ query: { ...route.query, [LINE_ITEM_ID_URL_SEARCH_PARAM]: newItem.id } });
    }
  } finally {
    loading.value = false;
  }
}

/**
 * Process button click to add/update cart line item.
 */
async function onChange() {
  const lineItem = getLineItem(cart.value?.items);
  const mode = lineItem ? AddToCartModeType.Update : AddToCartModeType.Add;

  loading.value = true;

  try {
    const updatedCart = await updateOrAddToCart(lineItem, mode);

    if (enteredQuantity.value === 0) {
      return;
    }

    handleUpdateResult(updatedCart, mode);
  } finally {
    loading.value = false;
  }
}

async function updateOrAddToCart(lineItem: ShortLineItemFragment | undefined, mode: AddToCartModeType) {
  if (mode === AddToCartModeType.Update && enteredQuantity.value === undefined) {
    return cart.value;
  }
  if (mode === AddToCartModeType.Update && !!lineItem && enteredQuantity.value !== undefined) {
    return await changeItemQuantityBatched(lineItem.id, enteredQuantity.value);
  }

  const quantity = enteredQuantity.value || minQty.value;
  const updatedCart = await addToCart(product.value.id, quantity);

  trackAddItemToCart(product.value, quantity);
  void pushHistoricalEvent({ eventType: "addToCart", productId: product.value.id });

  return updatedCart;
}

function handleUpdateResult(_cart: Awaited<ReturnType<typeof updateOrAddToCart>>, mode: AddToCartModeType) {
  if (!_cart) {
    return;
  }

  const lineItem = getLineItem(_cart.items);

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

function getConfigurableValidationErrors(updatedCart?: CartValidationResultType, lineItemId?: string): string[] {
  const cartValidationErrors =
    updatedCart?.validationErrors
      ?.filter(
        (error) =>
          (error.objectId === product.value.id && error.objectType === ValidationErrorObjectType.CatalogProduct) ||
          (lineItemId && error.objectId === lineItemId && error.objectType === ValidationErrorObjectType.LineItem),
      )
      .map(translate)
      .filter(isDefinedString) ?? [];
  const lineItemValidationErrors =
    updatedCart?.items
      ?.find((item) => item.id === lineItemId)
      ?.validationErrors?.map(translate)
      .filter(isDefinedString) ?? [];

  return [...new Set([...cartValidationErrors, ...lineItemValidationErrors])];
}

function getLineItem(items?: ShortLineItemFragment[]): ShortLineItemFragment | undefined {
  if (isConfigurable.value) {
    return configurableLineItemId.value ? items?.find((item) => item.id === configurableLineItemId.value) : undefined;
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

watch([() => product.value.id, configurableLineItemId], () => {
  enteredQuantity.value = !disabled.value ? defaultQuantity.value : undefined;
});
</script>
