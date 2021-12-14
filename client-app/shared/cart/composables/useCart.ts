import { computed, Ref, ref } from "vue";
import { getMyCart, addItemToCart } from "@core/api/graphql/cart";
import { CartType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";

const loading: Ref<boolean> = ref(true);
const cart: Ref<CartType> = ref({ name: "" });

export default () => {
  async function loadMyCart(): Promise<CartType> {
    loading.value = true;
    try {
      cart.value = await getMyCart();
    } catch (e) {
      Logger.error("useCart.loadMyCart", e);
      throw e;
    } finally {
      loading.value = false;
    }
    return cart.value;
  }

  async function addToCart(productId: string, qty: number) {
    loading.value = true;
    console.log(`addItemToCart ${productId} ${qty}`);
    try {
      await addItemToCart(productId, qty);
    } catch (e) {
      Logger.error("useCart.addItemToCart", e);
      throw e;
    } finally {
      loading.value = false;
    }
    await loadMyCart();
  }

  return {
    cart: computed(() => cart.value),
    loading: computed(() => loading.value),
    loadMyCart,
    addToCart,
  };
};
