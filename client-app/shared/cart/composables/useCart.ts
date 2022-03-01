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
  addOrUpdateCartShipment,
  addOrUpdateCartPayment,
} from "@core/api/graphql/cart";
import { CartType, InputPaymentType, InputShipmentType, LineItemType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import _ from "lodash";
import { useUserCheckoutDefaults } from "@/shared/account";
import changePurchaseOrderNumber from "@/core/api/graphql/cart/mutations/changePurchaseOrderNumber";
import { CartItemType } from "../types";
import addItemsToCart from "@/core/api/graphql/cart/mutations/addItemsToCart";

const loading: Ref<boolean> = ref(true);
const cart: Ref<CartType> = ref({ name: "" });
const pages: Ref<number> = ref(0);
const itemsPerPage: Ref<number> = ref(6);

export default () => {
  const { getUserCheckoutDefaults } = useUserCheckoutDefaults();

  async function loadMyCart(): Promise<CartType> {
    loading.value = true;
    try {
      cart.value = await getMyCart();
      if (cart.value.items && cart.value.items.length > 0) {
        pages.value = Math.ceil(cart.value.items.length / itemsPerPage.value);
      }

      //#region set checkout defaults
      const checkoutDefaults = getUserCheckoutDefaults();
      if (!cart.value.shipments?.[0]?.id && checkoutDefaults?.shippingMethod) {
        const method = checkoutDefaults?.shippingMethod;
        await updateShipment({
          shipmentMethodCode: method.code,
          shipmentMethodOption: method.optionName,
          id: cart.value.shipments?.[0]?.id,
        });
      }

      if (!cart.value.payments?.[0]?.id && checkoutDefaults?.paymentMethod) {
        const method = checkoutDefaults?.paymentMethod;
        await updatePayment({
          paymentGatewayCode: method.code,
          id: cart.value.payments?.[0]?.id,
        });
      }
      //#endregion set checkout defaults
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

  async function addMultipleItemsToCart(cartItems: CartItemType[]) {
    loading.value = true;
    console.log(`addMultipleItemsToCart ${cartItems}`);
    try {
      await addItemsToCart(cartItems);
    } catch (e) {
      Logger.error("useCart.addMultipleItemsToCart", e);
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

  async function updatePurchaseOrderNumber(purchaseOrderNumber: string) {
    loading.value = true;
    console.log(`purchaseOrderNumber ${purchaseOrderNumber}`);
    try {
      await changePurchaseOrderNumber(purchaseOrderNumber);
    } catch (e) {
      Logger.error("useCart.updatePurchaseOrderNumber", e);
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

  async function updateShipment(shipment: InputShipmentType) {
    loading.value = true;
    console.log(`change cart shipment details`);
    try {
      await addOrUpdateCartShipment(shipment);
    } catch (e) {
      Logger.error("useCart.updateShipment", e);
      throw e;
    } finally {
      loading.value = false;
    }
    await loadMyCart();
  }

  async function updatePayment(payment: InputPaymentType) {
    loading.value = true;
    console.log(`change cart payment details`);
    try {
      await addOrUpdateCartPayment(payment);
    } catch (e) {
      Logger.error("useCart.updatePayment", e);
      throw e;
    } finally {
      loading.value = false;
    }
    await loadMyCart();
  }

  function itemInCart(productId: string): LineItemType | undefined {
    return cart.value?.items?.find((product) => product?.productId === productId) as LineItemType;
  }

  // calculate total price of items in the cart for some set of products
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
    updateShipment,
    updatePayment,
    updatePurchaseOrderNumber,
    addMultipleItemsToCart,
  };
};
