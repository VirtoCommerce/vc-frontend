import { computed } from "vue";
import { useRoute } from "vue-router";
import { useFullCart, useShortCart } from "@/shared/cart";

/**
 * @description This composable is used to defer the short cart loading until the fullCart is loaded. (on the cart page only).
 */
export function useDeferShortCart() {
  const route = useRoute();
  const { cart: fullCart, loading } = useFullCart();

  const cart = computed(() => {
    return route.name === "Cart" && (!fullCart.value || loading.value) ? null : useShortCart().cart.value;
  });

  return {
    cart,
  };
}
