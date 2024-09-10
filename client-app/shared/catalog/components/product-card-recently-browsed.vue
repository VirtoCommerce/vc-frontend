<template>
  <VcProductCard :background="false">
    <VcProductImage :img-src="product.imgSrc" :alt="product.name" />

    <VcProductTitle lines-number="2" fix-height :to="link" :title="product.name" @click="$emit('linkClick', $event)">
      {{ product.name }}
    </VcProductTitle>

    <VcProductVendor>{{ product.vendor?.name }}</VcProductVendor>

    <VcProductPrice
      :has-variations="product.hasVariations"
      :actual-price="price?.actual"
      :list-price="price?.list"
      single-line
    />

    <VcAddToCart
      :message="errorMessage"
      :model-value="quantity"
      :is-in-stock="product.availabilityData?.isInStock"
      :available-quantity="product.availabilityData?.availableQuantity"
      :min-quantity="product.minQuantity"
      :max-quantity="product.maxQuantity"
      :count-in-cart="countInCart"
      @update:cart-item-quantity="changeCartItemQuantity"
      @update:validation="onValidationUpdate"
    />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
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

const { cart, addToCart, changeItemQuantity } = useShortCart();

const price = computed(() => (props.product.hasVariations ? props.product.minVariationPrice : props.product.price));
const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
const cartLineItem = computed(() => cart.value?.items.find((item) => item.productId === props.product.id));
const countInCart = computed<number>(() => cartLineItem.value?.quantity || 0);

const quantity = ref(countInCart.value || 1);

async function changeCartItemQuantity(qty: number) {
  if (cartLineItem.value && countInCart.value) {
    if (countInCart.value !== qty) {
      await changeItemQuantity(cartLineItem.value.id, qty);
    }
  } else {
    await addToCart(props.product.id, qty);
  }
}

function onValidationUpdate(validation: { isValid: true } | { isValid: false; errorMessage: string }) {
  if (!validation.isValid) {
    errorMessage.value = validation.errorMessage;
  } else {
    errorMessage.value = undefined;
  }
}
</script>
