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
      single-line />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { useThemeContext } from "@/core/composables";
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

const { cart, } = useShortCart();
const { themeContext } = useThemeContext();

const product = toRef(props, "product");

const price = computed(() => (product.value.hasVariations ? product.value.minVariationPrice : product.value.price));
const link = computed<RouteLocationRaw>(() => getProductRoute(product.value.id, product.value.slug));
const cartLineItem = computed(() => cart.value?.items.find((item) => item.productId === product.value.id));
const countInCart = computed<number>(() => cartLineItem.value?.quantity || 0);

const quantity = ref(getInitialQuantity());

function getInitialQuantity() {
  if (countInCart.value) {
    return countInCart.value;
  }
  if (themeContext.value.settings.product_quantity_control === "stepper") {
    return 0;
  }
  return product.value.minQuantity || 1;
}

watch(countInCart, (newCount) => {
  quantity.value = newCount || product.value.minQuantity || 1;
});
</script>
