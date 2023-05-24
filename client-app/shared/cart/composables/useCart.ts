import { computedEager } from "@vueuse/core";
import { keyBy, sumBy } from "lodash";
import { computed, readonly, ref, shallowRef } from "vue";
import { ProductType } from "@/core/enums";
import globals from "@/core/globals";
import { getLineItemsGroupedByVendor, Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import { usePopup } from "@/shared/popup";
import {
  addBulkItemsCart,
  addCoupon,
  addGiftItems,
  addItemsCart,
  addItemToCart,
  addOrUpdateCartPayment,
  addOrUpdateCartShipment,
  changeCartComment,
  changeCartItemQuantity,
  changePurchaseOrderNumber,
  createQuoteFromCart as _createQuoteFromCart,
  getCart,
  rejectGiftItems,
  removeCart as _removeCart,
  removeCartItem,
  removeCoupon,
  removeShipment as _removeShipment,
  validateCoupon,
} from "@/xapi";
import { ClearCartModal } from "../components";
import { getLineItemValidationErrorsGroupedBySKU } from "../utils";
import type { LineItemsGroupByVendorType } from "@/core/types";
import type { ExtendedGiftItemType, OutputBulkItemType } from "@/shared/cart";
import type { ChangeCartItemQuantityOptionsType } from "@/xapi";
import type {
  CartType,
  InputNewBulkItemType,
  InputNewCartItemType,
  InputPaymentType,
  InputShipmentType,
  LineItemType,
  PaymentMethodType,
  PaymentType,
  QuoteType,
  ShipmentType,
  ShippingMethodType,
} from "@/xapi/types";

const loading = ref(false);
const cart = shallowRef<CartType>();

const shipment = computed<ShipmentType | undefined>(() => cart.value?.shipments?.[0]);
const payment = computed<PaymentType | undefined>(() => cart.value?.payments?.[0]);

const availableShippingMethods = computed<ShippingMethodType[]>(() => cart.value?.availableShippingMethods ?? []);
const availablePaymentMethods = computed<PaymentMethodType[]>(() => cart.value?.availablePaymentMethods ?? []);

const lineItemsGroupedByVendor = computed<LineItemsGroupByVendorType<LineItemType>[]>(() =>
  getLineItemsGroupedByVendor(cart.value?.items ?? [])
);

const allItemsAreDigital = computed<boolean>(
  () => !!cart.value?.items?.every((item) => item.productType === ProductType.Digital)
);

const addedGiftsByIds = computed(() => keyBy(cart.value?.gifts, "id"));

const availableExtendedGifts = computed<ExtendedGiftItemType[]>(() =>
  (cart.value?.availableGifts || []).map((gift) => ({ ...gift, isAddedInCart: !!addedGiftsByIds.value[gift.id] }))
);

const hasValidationErrors = computedEager<boolean>(
  () => !!cart.value?.validationErrors?.length || !!cart.value?.items?.some((item) => item.validationErrors?.length)
);

export default function useCart() {
  const notifications = useNotifications();
  const { openPopup } = usePopup();

  async function fetchShortCart(): Promise<void> {
    loading.value = true;

    try {
      cart.value = await getCart();
    } catch (e) {
      Logger.error(`${useCart.name}.${fetchShortCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchFullCart(): Promise<void> {
    loading.value = true;

    try {
      cart.value = await getCart({ full: true });
    } catch (e) {
      Logger.error(`${useCart.name}.${fetchFullCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeCart(
    cartId: string,
    options: {
      /** @default true */
      reloadCart?: boolean;
    } = {}
  ): Promise<boolean> {
    const { reloadCart = true } = options;
    let result = false;

    loading.value = true;

    try {
      result = await _removeCart(cartId);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    if (reloadCart) {
      await fetchFullCart();
    }

    return result;
  }

  async function addToCart(productId: string, qty: number): Promise<void> {
    loading.value = true;

    try {
      cart.value = await addItemToCart(productId, qty);
    } catch (e) {
      Logger.error(`${useCart.name}.${addToCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addItemsToCart(items: InputNewCartItemType[]): Promise<void> {
    loading.value = true;

    try {
      cart.value = await addItemsCart(items);
    } catch (e) {
      Logger.error(`${useCart.name}.${addItemsToCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addBulkItemsToCart(items: InputNewBulkItemType[]): Promise<OutputBulkItemType[]> {
    loading.value = true;

    try {
      const data = await addBulkItemsCart(items);

      cart.value = data.cart;

      const errorsGroupBySKU = getLineItemValidationErrorsGroupedBySKU(data.errors);

      return items.map<OutputBulkItemType>(({ productSku, quantity }) => ({
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
  }

  async function removeItem(lineItemId: string): Promise<void> {
    loading.value = true;

    try {
      cart.value = await removeCartItem(lineItemId);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeItem.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function changeItemQuantity(
    lineItemId: string,
    qty: number,
    options: ChangeCartItemQuantityOptionsType = {}
  ): Promise<void> {
    loading.value = true;

    try {
      cart.value = await changeCartItemQuantity(lineItemId, qty, options);
    } catch (e) {
      Logger.error(`${useCart.name}.${changeItemQuantity.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function validateCartCoupon(couponCode: string): Promise<boolean> {
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

  async function addCartCoupon(couponCode: string): Promise<void> {
    loading.value = true;

    try {
      cart.value = await addCoupon(couponCode);
    } catch (e) {
      Logger.error(`${useCart.name}.${addCartCoupon.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeCartCoupon(couponCode: string): Promise<void> {
    loading.value = true;

    try {
      cart.value = await removeCoupon(couponCode);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeCartCoupon.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function changeComment(comment: string): Promise<void> {
    loading.value = true;

    try {
      cart.value = await changeCartComment(comment);
    } catch (e) {
      Logger.error(`${useCart.name}.${changeComment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updatePurchaseOrderNumber(purchaseOrderNumber: string): Promise<void> {
    loading.value = true;

    try {
      cart.value = await changePurchaseOrderNumber(purchaseOrderNumber);
    } catch (e) {
      Logger.error(`${useCart.name}.${updatePurchaseOrderNumber.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateShipment(newShipment: InputShipmentType): Promise<void> {
    loading.value = true;

    try {
      cart.value = await addOrUpdateCartShipment(newShipment, cart.value?.id);
    } catch (e) {
      Logger.error(`${useCart.name}.${updateShipment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeShipment(shipmentId: string): Promise<void> {
    loading.value = true;

    try {
      cart.value = await _removeShipment(shipmentId, cart.value?.id);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeShipment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updatePayment(newPayment: InputPaymentType): Promise<void> {
    loading.value = true;

    try {
      cart.value = await addOrUpdateCartPayment(newPayment, cart.value?.id);
    } catch (e) {
      Logger.error(`${useCart.name}.${updatePayment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addGiftsToCart(giftIds: string[]): Promise<void> {
    loading.value = true;

    try {
      cart.value = await addGiftItems(giftIds);
    } catch (e) {
      Logger.error(`${useCart.name}.${addGiftsToCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeGiftsFromCart(giftLineItemIds: string[]): Promise<void> {
    loading.value = true;

    try {
      cart.value = await rejectGiftItems(giftLineItemIds);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeGiftsFromCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function toggleGift(gift: ExtendedGiftItemType): Promise<void> {
    if (gift.isAddedInCart) {
      await removeGiftsFromCart([gift.lineItemId!]);
    } else {
      await addGiftsToCart([gift.id]);
    }
  }

  async function createQuoteFromCart(comment = ""): Promise<QuoteType | null> {
    let quote: QuoteType | null = null;

    loading.value = true;

    try {
      quote = await _createQuoteFromCart(cart.value!.id!, comment);
    } catch (e) {
      Logger.error(`${useCart.name}.${createQuoteFromCart.name}`, e);
    }

    if (!quote) {
      notifications.error({
        text: globals.i18n.global.t("common.messages.creating_quote_error"),
        duration: 15000,
        single: true,
      });
    }

    loading.value = false;

    return quote;
  }

  function openClearCartModal() {
    openPopup({
      component: ClearCartModal,
      props: {
        async onResult() {
          await removeCart(cart.value!.id!);
        },
      },
    });
  }

  // calculate total price of items in the cart for some set of products
  function getItemsTotal(productIds: string[]): number {
    if (!cart.value?.items?.length) {
      return 0;
    }

    const filteredItems = cart.value.items.filter((item) => productIds.includes(item.productId!));

    return sumBy(filteredItems, (x) => x.extendedPrice?.amount);
  }

  return {
    shipment,
    payment,
    availableShippingMethods,
    availablePaymentMethods,
    lineItemsGroupedByVendor,
    allItemsAreDigital,
    addedGiftsByIds,
    availableExtendedGifts,
    hasValidationErrors,
    getItemsTotal,
    fetchShortCart,
    fetchFullCart,
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
    removeShipment,
    updatePayment,
    updatePurchaseOrderNumber,
    removeCart,
    createQuoteFromCart,
    addGiftsToCart,
    removeGiftsFromCart,
    toggleGift,
    openClearCartModal,
    loading: readonly(loading),
    cart: computed(() => cart.value),
  };
}
