<template>
  <VcProductCard :background="false">
    <VcProductImage :img-src="product.imgSrc" :alt="product.name" />

    <VcProductTitle lines-number="2" fix-height :to="link" :title="product.name" @click="$emit('linkClick', $event)">
      {{ product.name }}
    </VcProductTitle>

    <VcProductPrice
      :with-from-label="product.hasVariations || product.isConfigurable"
      :actual-price="price?.actual"
      :list-price="price?.list"
      single-line
    />

    <VcProductButton
      v-if="product.isConfigurable"
      :to="link"
      :button-text="$t('pages.catalog.customize_button')"
      icon="cube-transparent"
      target="_blank"
    />

    <VcProductButton
      v-else-if="product.hasVariations"
      :to="link"
      target="_blank"
      :button-text="$t('pages.catalog.variations_button', [(product.variations?.length || 0) + 1])"
    />

    <VcAddToCart
      v-else
      :message="errorMessage || notAvailableMessage"
      :model-value="quantity"
      :is-active="product.availabilityData?.isActive"
      :is-available="product.availabilityData?.isAvailable"
      :is-buyable="product.availabilityData?.isBuyable"
      :is-in-stock="product.availabilityData?.isInStock"
      :available-quantity="product.availabilityData?.availableQuantity"
      :min-quantity="product.minQuantity"
      :max-quantity="product.maxQuantity"
      :pack-size="product.packSize"
      :count-in-cart="countInCart"
      :disabled="changing"
      :loading="changing"
      show-empty-details
      @update:cart-item-quantity="changeCartItemQuantity"
      @update:validation="onValidationUpdate"
    />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useHistoricalEvents } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { getProductRoute } from "@/core/utilities";
import { useShortCart } from "@/shared/cart";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
}

interface IProps {
  product: Product;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const errorMessage = ref<string | undefined>();

const { cart, addToCart, changeItemQuantity, changing } = useShortCart();
const { trackAddItemToCart } = useAnalyticsUtils();
const { pushHistoricalEvent } = useHistoricalEvents();
const { t } = useI18n();

const product = toRef(props, "product");

const price = computed(() => (product.value.hasVariations ? product.value.minVariationPrice : product.value.price));
const link = computed<RouteLocationRaw>(() => getProductRoute(product.value.id, product.value.slug));
const cartLineItem = computed(() => cart.value?.items.find((item) => item.productId === product.value.id));
const countInCart = computed<number>(() => cartLineItem.value?.quantity || 0);

const notAvailableMessage = computed<string | undefined>(() => {
  if (!product.value.availabilityData?.isBuyable || !product.value.availabilityData?.isAvailable) {
    return t("validation_error.CART_PRODUCT_UNAVAILABLE");
  }
  return undefined;
});

const quantity = ref(countInCart.value || product.value.minQuantity || 1);

async function changeCartItemQuantity(qty: number) {
  if (cartLineItem.value && countInCart.value) {
    if (countInCart.value !== qty) {
      await changeItemQuantity(cartLineItem.value.id, qty);
    }
  } else {
    await addToCart(product.value.id, qty);
    trackAddItemToCart(product.value, qty, { source_block: "recently-browsed" });
    void pushHistoricalEvent({ eventType: "addToCart", productId: product.value.id });
  }
}

function onValidationUpdate(validation: { isValid: true } | { isValid: false; errorMessage: string }) {
  if (!validation.isValid) {
    errorMessage.value = validation.errorMessage;
  } else {
    errorMessage.value = undefined;
  }
}

watch(countInCart, (newCount) => {
  quantity.value = newCount || product.value.minQuantity || 1;
});
</script>
