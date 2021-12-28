import { computed, Ref, ref } from "vue";
import {
  getMyCart,
  addItemToCart,
  changeCartItemQuantity,
  removeCartItem,
  removeCoupon,
  validateCoupon,
  addCoupon,
  changeCartComment,
} from "@core/api/graphql/cart";
import { CartType, LineItemType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import _ from "lodash";

const loading: Ref<boolean> = ref(true);
const cart: Ref<CartType> = ref({ name: "" });
const pages: Ref<number> = ref(0);
const itemsPerPage: Ref<number> = ref(6);

export default () => {
  async function loadMyCart(): Promise<CartType> {
    loading.value = true;
    try {
      cart.value = await getMyCart();
      if (cart.value.items && cart.value.items.length > 0) {
        pages.value = Math.ceil(cart.value.items.length / itemsPerPage.value);
      }
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

  async function changeComment(comment: string) {
    loading.value = true;
    console.log(`change cart comment ${comment}`);
    try {
      await changeCartComment(comment);
    } catch (e) {
      Logger.error("useCart.changeCartComment", e);
      throw e;
    } finally {
      loading.value = false;
    }
    await loadMyCart();
  }

  function itemInCart(productId: string): LineItemType | undefined {
    return cart.value?.items?.find((product) => product?.productId === productId) as LineItemType;
  }

  function getItemsTotal(productIds: string[]): number {
    if (!cart.value?.items?.length) {
      return 0;
    }

    const filteredItems = _(cart.value.items)
      .filter((x) => !!x?.productId && productIds.includes(x?.productId as string))
      .map((x) => x as LineItemType)
      .value();

    const result = _.sumBy(filteredItems, (x) => x.extendedPrice?.amount);

    return result;
  }

  return {
    cart: computed(() => cart.value),
    pages: computed(() => pages.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    loading: computed(() => loading.value),
    currency: computed(() => cart.value.total?.currency),
    getItemsTotal,
    loadMyCart,
    addToCart,
    itemInCart,
    changeItemQuantity,
    removeItem,
    validateCartCoupon,
    addCartCoupon,
    removeCartCoupon,
    changeComment,
  };
};
