<template>
  <QuantityControl
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
    :loading="$cfg.product_quantity_control === 'stepper' ? false : loading"
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
import { computed, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useHistoricalEvents } from "@/core/composables";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import { DEFAULT_DEBOUNCE_IN_MS } from "../constants";
import type { Product, ShortLineItemFragment, VariationType } from "@/core/api/graphql/types";
import QuantityControl from "@/shared/common/components/quantity-control.vue";

const props = defineProps<IProps>();

interface IProps {
  product: Product | VariationType;
  reservedSpace?: boolean;
}

const product = toRef(props, "product");
const { cart, updateItemCartQuantity } = useShortCart();
const { t } = useI18n();
const { trackAddItemToCart } = useAnalyticsUtils();
const { pushHistoricalEvent } = useHistoricalEvents();
const { themeContext } = useThemeContext();
const { analytics } = useAnalytics();

const loading = ref(false);
const errorMessage = ref<string | undefined>();

const notAvailableMessage = computed(() => {
  if (!product.value.availabilityData?.isBuyable || !product.value.availabilityData?.isAvailable) {
    return t("validation_error.CART_PRODUCT_UNAVAILABLE");
  }
  return undefined;
});

const defaultMinQuantity = computed(() => (themeContext.value.settings.product_quantity_control === "button" ? 1 : 0));
const disabled = computed(() => loading.value || !product.value.availabilityData?.isAvailable);
const disabledStepper = computed(() => !product.value.availabilityData?.isAvailable);
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
const enteredQuantity = ref(disabled.value ? undefined : defaultQuantity.value);

function onInput(value: number): void {
  if (!Number.isFinite(value)) {
    enteredQuantity.value = undefined;
  } else if (value > LINE_ITEM_QUANTITY_LIMIT) {
    enteredQuantity.value = LINE_ITEM_QUANTITY_LIMIT;
  } else {
    enteredQuantity.value = value;
  }
}

async function onChange() {
  loading.value = true;

  try {
    await updateOrAddToCart(product.value.id, enteredQuantity.value);
  } finally {
    loading.value = false;
  }
}

async function updateOrAddToCart(productId: string, qty?: number) {
  if (qty === undefined) {
    return;
  }

  const lineItem = getLineItem(cart.value?.items);

  try {
    await updateItemCartQuantity(productId, qty);
  } catch (e) {
    Logger.error("Error updating item quantity in add to cart simple component", e);
  }

  if (lineItem) {
    // Update
    analytics("updateCartItem", lineItem?.sku, qty, lineItem?.quantity);
  } else {
    // Add
    trackAddItemToCart(product.value, qty);
    void pushHistoricalEvent({ eventType: "addToCart", productId: product.value.id });
  }
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

watch(
  () => product.value.id,
  () => {
    enteredQuantity.value = disabled.value ? undefined : defaultQuantity.value;
  },
);
</script>
