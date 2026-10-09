<template>
  <VcChip
    v-if="countInCart > 0"
    class="count-in-cart"
    :size="size"
    variant="outline-dark"
    color="neutral"
    rounded
    :title="$t('shared.cart.add_to_cart.errors.in_cart')"
  >
    <VcIcon name="cart" variant="solid" />

    <span class="count-in-cart__label" data-test-id="count-in-cart-label">
      {{ countInCart }}
    </span>
  </VcChip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useShortCart } from "@/shared/cart/composables";

export interface IProps {
  productId?: string;
  currency?: string;
  lineItemId?: string;
  size?: VcChipSizeType;
}

const props = withDefaults(defineProps<IProps>(), {
  size: "sm",
});

const { cart } = useShortCart();

const lineItemInCart = computed(() => {
  const matchesCurrency = (item: { currencyCode?: string | null }) =>
    !props.currency || item.currencyCode === props.currency;

  if (props.lineItemId) {
    return cart.value?.items.find((item) => item.id === props.lineItemId && matchesCurrency(item));
  }

  return cart.value?.items.find((item) => item.productId === props.productId && matchesCurrency(item));
});

const countInCart = computed<number>(() => lineItemInCart.value?.quantity ?? 0);
</script>

<style lang="scss">
.count-in-cart {
  &__label {
    @apply inline-block min-w-3 text-center;
  }
}
</style>
