import { computed, Ref, ref } from "vue";
import {
  getMyCart,
  addItemToCart,
  changeCartItemQuantity,
  removeCartItem,
  removeCoupon,
  validateCoupon,
  addCoupon,
} from "@core/api/graphql/cart";
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

  async function removeItem(lineItemId: string) {
    loading.value = true;
    console.log(`removedCartItem ${lineItemId}`);
    try {
      await removeCartItem(lineItemId);
    } catch (e) {
      Logger.error("useCart.removeItem", e);
      throw e;
    } finally {
      loading.value = false;
    }
    await loadMyCart();
  }

  async function validateCartCoupon(couponCode: string) {
    loading.value = true;
    console.log(`validate coupon ${couponCode}`);
    try {
      return await validateCoupon(couponCode);
    } catch (e) {
      Logger.error("useCart.addCoupon", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addCartCoupon(couponCode: string) {
    loading.value = true;
    console.log(`addCart coupon ${couponCode}`);
    try {
      await addCoupon(couponCode);
    } catch (e) {
      Logger.error("useCart.addCartCoupon", e);
      throw e;
    } finally {
      loading.value = false;
    }
    await loadMyCart();
  }

  async function removeCartCoupon(couponCode: string) {
    loading.value = true;
    console.log(`removeCart coupon ${couponCode}`);
    try {
      await removeCoupon(couponCode);
    } catch (e) {
      Logger.error("useCart.removeCartCoupon", e);
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
    removeItem,
    validateCartCoupon,
    addCartCoupon,
    removeCartCoupon,
  };
};
