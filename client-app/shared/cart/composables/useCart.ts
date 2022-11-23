import { computed, Ref, ref } from "vue";
import _ from "lodash";
import { Logger } from "@/core";
import {
  addBulkItemsCart,
  addCoupon,
  addItemsCart,
  addItemToCart,
  addOrUpdateCartPayment,
  addOrUpdateCartShipment,
  CartType,
  changeCartComment,
  changeCartItemQuantity,
  changePurchaseOrderNumber,
  createOrderFromCart as _createOrderFromCart,
  createQuoteFromCart as _createQuoteFromCart,
  CustomerOrderType,
  getMyCart,
  InputNewBulkItemType,
  InputNewCartItemType,
  InputPaymentType,
  InputShipmentType,
  LineItemType,
  QuoteType,
  removeCart as _removeCart,
  removeCartItem,
  removeCoupon,
  validateCoupon,
} from "@/xapi";
import { getLineItemValidationErrorsGroupedBySKU, OutputBulkItemType } from "@/shared/cart";

const DEFAULT_ITEMS_PER_PAGE = 6;

const loading: Ref<boolean> = ref(true);
const cart: Ref<CartType> = ref({ name: "" });
const pages: Ref<number> = ref(0);
const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);

export default function useCart() {
  async function fetchCart(): Promise<CartType> {
    loading.value = true;

    try {
      cart.value = await getMyCart();
      pages.value = Math.ceil((cart.value.items?.length ?? 0) / itemsPerPage.value);
    } catch (e) {
      Logger.error(`${useCart.name}.${fetchCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    return cart.value;
  }

  async function addToCart(productId: string, qty: number) {
    loading.value = true;

    try {
      await addItemToCart(productId, qty);
    } catch (e) {
      Logger.error(`${useCart.name}.${addToCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function removeCart(cartId: string) {
    loading.value = true;

    try {
      await _removeCart(cartId);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function addItemsToCart(items: InputNewCartItemType[]): Promise<void> {
    loading.value = true;

    try {
      await addItemsCart(items);
    } catch (e) {
      Logger.error(`${useCart.name}.${addItemsToCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function addBulkItemsToCart(items: InputNewBulkItemType[]): Promise<OutputBulkItemType[]> {
    let result: OutputBulkItemType[] = [];

    loading.value = true;

    try {
      const { errors } = await addBulkItemsCart(items);
      const errorsGroupBySKU = getLineItemValidationErrorsGroupedBySKU(errors);

      result = items.map<OutputBulkItemType>(({ productSku, quantity }) => ({
        productSku,
        quantity,
        errors: errorsGroupBySKU[productSku],
      }));
    } catch (e) {
      Logger.error(`${useCart.name}.${addBulkItemsToCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();

    return result;
  }

  async function changeItemQuantity(lineItemId: string, qty: number) {
    loading.value = true;

    try {
      await changeCartItemQuantity(lineItemId, qty);
    } catch (e) {
      Logger.error(`${useCart.name}.${changeItemQuantity.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function removeItem(lineItemId: string) {
    loading.value = true;

    try {
      await removeCartItem(lineItemId);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeItem}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function validateCartCoupon(couponCode: string) {
    loading.value = true;

    try {
      return await validateCoupon(couponCode);
    } catch (e) {
      Logger.error(`${useCart.name}.${validateCartCoupon.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addCartCoupon(couponCode: string) {
    loading.value = true;

    try {
      await addCoupon(couponCode);
    } catch (e) {
      Logger.error(`${useCart.name}.${addCartCoupon.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function updatePurchaseOrderNumber(purchaseOrderNumber: string) {
    loading.value = true;

    try {
      await changePurchaseOrderNumber(purchaseOrderNumber);
    } catch (e) {
      Logger.error(`${useCart.name}.${updatePurchaseOrderNumber.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function removeCartCoupon(couponCode: string) {
    loading.value = true;

    try {
      await removeCoupon(couponCode);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeCartCoupon.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function changeComment(comment: string, reloadCart = true) {
    loading.value = true;

    try {
      await changeCartComment(comment);
    } catch (e) {
      Logger.error(`${useCart.name}.${changeComment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    if (reloadCart) {
      await fetchCart();
    }
  }

  async function updateShipment(shipment: InputShipmentType, reloadCart = true) {
    loading.value = true;

    try {
      await addOrUpdateCartShipment(shipment, cart.value.id);
    } catch (e) {
      Logger.error(`${useCart.name}.${updateShipment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    if (reloadCart) {
      await fetchCart();
    }
  }

  async function updatePayment(payment: InputPaymentType, reloadCart = true) {
    loading.value = true;

    try {
      await addOrUpdateCartPayment(payment, cart.value.id);
    } catch (e) {
      Logger.error(`${useCart.name}.${updatePayment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    if (reloadCart) {
      await fetchCart();
    }
  }

  async function createOrderFromCart(cartId: string): Promise<CustomerOrderType | null> {
    loading.value = true;

    try {
      const order = await _createOrderFromCart(cartId);

      if (!order) {
        return null;
      }

      await _removeCart(cartId);

      return order;
    } catch (e) {
      Logger.error(`${useCart.name}.${createOrderFromCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createQuoteFromCart(cartId: string, comment = ""): Promise<QuoteType | null> {
    loading.value = true;

    try {
      return await _createQuoteFromCart(cartId, comment);
    } catch (e) {
      Logger.error(`${useCart.name}.${createQuoteFromCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
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

    return _.sumBy(filteredItems, (x) => x.extendedPrice?.amount);
  }

  return {
    cart: computed(() => cart.value),
    pages: computed(() => pages.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    loading: computed(() => loading.value),
    currency: computed(() => cart.value.currency!),
    getItemsTotal,
    fetchCart,
    addToCart,
    addItemsToCart,
    addBulkItemsToCart,
    changeItemQuantity,
    removeItem,
    validateCartCoupon,
    addCartCoupon,
    removeCartCoupon,
    changeComment,
    updateShipment,
    updatePayment,
    updatePurchaseOrderNumber,
    removeCart,
    createOrderFromCart,
    createQuoteFromCart,
  };
}
