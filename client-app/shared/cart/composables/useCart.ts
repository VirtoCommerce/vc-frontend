import { computed, Ref, ref } from "vue";
import { getMyCart, addItemToCart, changeCartItemQuantity } from "@core/api/graphql/cart";
import { CartType, LineItemType } from "@core/api/graphql/types";
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

  async function changeItemQuantity(lineItemId: string, qty: number) {
    loading.value = true;
    console.log(`changeItemQuantity ${lineItemId} ${qty}`);
    try {
      await changeCartItemQuantity(lineItemId, qty);
    } catch (e) {
      Logger.error("useCart.changeItemQuantity", e);
      throw e;
    } finally {
      loading.value = false;
    }
    await loadMyCart();
  }

  function itemInCart(productId: string): LineItemType | undefined {
    return cart.value?.items?.find((product) => product?.productId === productId) as LineItemType;
  }

  return {
    cart: computed(() => cart.value),
    loading: computed(() => loading.value),
    loadMyCart,
    addToCart,
    itemInCart,
    changeItemQuantity,
  };
};
