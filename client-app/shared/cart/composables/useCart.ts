import { computedEager } from "@vueuse/core";
import { keyBy, sumBy } from "lodash";
import { computed, readonly, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { getLineItemsGroupedByVendor, Logger, LineItemsGroupByVendorType } from "@/core";
import {
  ClearCartModal,
  ExtendedGiftItemType,
  getLineItemValidationErrorsGroupedBySKU,
  OutputBulkItemType,
} from "@/shared/cart";
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
  CartType,
  changeCartComment,
  changeCartItemQuantity,
  changePurchaseOrderNumber,
  createQuoteFromCart as _createQuoteFromCart,
  getMyCart,
  InputNewBulkItemType,
  InputNewCartItemType,
  InputPaymentType,
  InputShipmentType,
  LineItemType,
  PaymentMethodType,
  PaymentType,
  QuoteType,
  rejectGiftItems,
  removeCart as _removeCart,
  removeCartItem,
  removeCoupon,
  ShipmentType,
  ShippingMethodType,
  validateCoupon,
} from "@/xapi";

const loading = ref(false);
const cart = shallowRef<CartType>({ name: "" });

const shipment = computed<ShipmentType | undefined>(() => cart.value.shipments?.[0]);
const payment = computed<PaymentType | undefined>(() => cart.value.payments?.[0]);

const availableShippingMethods = computed<ShippingMethodType[]>(() => cart.value.availableShippingMethods ?? []);
const availablePaymentMethods = computed<PaymentMethodType[]>(() => cart.value.availablePaymentMethods ?? []);

const lineItemsGroupedByVendor = computed<LineItemsGroupByVendorType<LineItemType>[]>(() =>
  getLineItemsGroupedByVendor(cart.value.items ?? [])
);

const addedGiftsByIds = computed(() => keyBy(cart.value.gifts, "id"));

const availableExtendedGifts = computed<ExtendedGiftItemType[]>(() =>
  (cart.value.availableGifts || []).map((gift) => ({ ...gift, isAddedInCart: !!addedGiftsByIds.value[gift.id] }))
);

const hasValidationErrors = computedEager<boolean>(
  () => !!cart.value.validationErrors?.length || !!cart.value.items?.some((item) => item.validationErrors?.length)
);

export default function useCart() {
  const notifications = useNotifications();
  const { t } = useI18n();
  const { openPopup } = usePopup();

  async function fetchCart(): Promise<CartType> {
    loading.value = true;

    try {
      cart.value = await getMyCart();
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

  async function updateShipment(newShipment: InputShipmentType, reloadCart = true) {
    loading.value = true;

    try {
      await addOrUpdateCartShipment(newShipment, cart.value.id);
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

  async function updatePayment(newPayment: InputPaymentType, reloadCart = true) {
    loading.value = true;

    try {
      await addOrUpdateCartPayment(newPayment, cart.value.id);
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

  async function createQuoteFromCart(comment = ""): Promise<QuoteType | null> {
    let quote: QuoteType | null = null;

    loading.value = true;

    try {
      quote = await _createQuoteFromCart(cart.value.id!, comment);
    } catch (e) {
      Logger.error(`${useCart.name}.${createQuoteFromCart.name}`, e);
    }

    if (!quote) {
      notifications.error({
        text: t("common.messages.creating_quote_error"),
        duration: 15000,
        single: true,
      });
    }

    loading.value = false;

    return quote;
  }

  async function addGiftsToCart(giftIds: string[]) {
    loading.value = true;

    try {
      await addGiftItems(giftIds);
    } catch (e) {
      Logger.error(`${useCart.name}.${addGiftsToCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function removeGiftsFromCart(giftLineItemIds: string[]) {
    loading.value = true;

    try {
      await rejectGiftItems(giftLineItemIds);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeGiftsFromCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchCart();
  }

  async function toggleGift(gift: ExtendedGiftItemType) {
    if (gift.isAddedInCart) {
      await removeGiftsFromCart([gift.lineItemId!]);
    } else {
      await addGiftsToCart([gift.id]);
    }
  }

  function openClearCartModal() {
    openPopup({
      component: ClearCartModal,
      props: {
        async onResult() {
          await removeCart(cart.value.id!);
        },
      },
    });
  }

  // calculate total price of items in the cart for some set of products
  function getItemsTotal(productIds: string[]): number {
    if (!cart.value?.items?.length) {
      return 0;
    }

    const filteredItems = cart.value.items.filter((item) => !!item.productId && productIds.includes(item.productId));

    return sumBy(filteredItems, (x) => x.extendedPrice?.amount);
  }

  return {
    shipment,
    payment,
    availableShippingMethods,
    availablePaymentMethods,
    lineItemsGroupedByVendor,
    addedGiftsByIds,
    availableExtendedGifts,
    hasValidationErrors,
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
    createQuoteFromCart,
    addGiftsToCart,
    removeGiftsFromCart,
    toggleGift,
    openClearCartModal,
    loading: readonly(loading),
    cart: computed(() => cart.value),
  };
}
