import { computedEager, useDebounceFn } from "@vueuse/core";
import { difference, keyBy, sumBy } from "lodash";
import { computed, readonly, ref, shallowRef } from "vue";
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
  clearCart as _clearCart,
  createQuoteFromCart as _createQuoteFromCart,
  getCart,
  rejectGiftItems,
  removeCartItems,
  removeCoupon,
  removeShipment as _removeShipment,
  validateCoupon,
  GetCartFeldsType,
  changeSelectedCartItems,
} from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { ProductType, ValidationErrorObjectType } from "@/core/enums";
import { globals } from "@/core/globals";
import { getLineItemsGroupedByVendor, Logger } from "@/core/utilities";
import { cartReloadEvent, useBroadcast } from "@/shared/broadcast";
import { useNotifications } from "@/shared/notification";
import { usePopup } from "@/shared/popup";
import ClearCartModal from "../components/clear-cart-modal.vue";
import { DEFAULT_DEBOUNCE_IN_MS } from "../constants";
import { CartValidationErrors } from "../enums";
import type { ChangeCartItemQuantityOptionsType } from "@/core/api/graphql";
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
} from "@/core/api/graphql/types";
import type { LineItemsGroupByVendorType } from "@/core/types";
import type { ExtendedGiftItemType, OutputBulkItemType } from "@/shared/cart/types";

const broadcast = useBroadcast();

const loading = ref(false);
const cart = shallowRef<CartType>();

const shipment = computed<ShipmentType | undefined>(() => cart.value?.shipments?.[0]);
const payment = computed<PaymentType | undefined>(() => cart.value?.payments?.[0]);

const availableShippingMethods = computed<ShippingMethodType[]>(() => cart.value?.availableShippingMethods ?? []);
const availablePaymentMethods = computed<PaymentMethodType[]>(() => cart.value?.availablePaymentMethods ?? []);

const lineItemsGroupedByVendor = computed(() => getLineItemsGroupedByVendor(cart.value?.items ?? []));

const allItemsAreDigital = computed<boolean>(
  () =>
    !!cart.value?.items
      ?.filter((item) => item.selectedForCheckout)
      .every((item) => item.productType === ProductType.Digital),
);

const addedGiftsByIds = computed(() => keyBy(cart.value?.gifts, "id"));

const availableExtendedGifts = computed<ExtendedGiftItemType[]>(() =>
  (cart.value?.availableGifts || []).map((gift) => ({ ...gift, isAddedInCart: !!addedGiftsByIds.value[gift.id] })),
);

const hasSelectedItemsWithValidationErrors = computed(
  () =>
    cart.value?.validationErrors?.some(
      (error) =>
        (error.objectType === ValidationErrorObjectType.CartProduct &&
          cart.value?.items?.some((item) => item.selectedForCheckout && item.productId === error.objectId)) ||
        (error.objectType === ValidationErrorObjectType.LineItem &&
          cart.value?.items?.some((item) => item.selectedForCheckout && item.id === error.objectId)),
    ),
);

const hasValidationErrors = computedEager<boolean>(
  () =>
    (!!cart.value?.validationErrors?.length && hasSelectedItemsWithValidationErrors.value) ||
    !!cart.value?.items?.some((item) => item.selectedForCheckout && item.validationErrors?.length),
);

const hasOnlyUnselectedValidationError = computedEager<boolean>(
  () =>
    cart.value?.validationErrors?.length == 1 &&
    cart.value.validationErrors[0]?.errorCode == CartValidationErrors.ALL_LINE_ITEMS_UNSELECTED,
);

const selectedForCheckoutItemIds = computed(
  () => cart.value?.items?.filter((item) => item.selectedForCheckout).map((item) => item.id) ?? [],
);

const selectedItemIdsDebounced = useDebounceFn(async (newValue: string[]): Promise<void> => {
  const oldValue = selectedForCheckoutItemIds.value;

  const newlySelectedLineItemIds = difference(newValue, oldValue);
  const newlyUnselectedLineItemIds = difference(oldValue, newValue);

  if (newlySelectedLineItemIds.length > 0 || newlyUnselectedLineItemIds.length > 0) {
    loading.value = true;

    try {
      cart.value = await changeSelectedCartItems(newlySelectedLineItemIds, newlyUnselectedLineItemIds);
      broadcast.emit(cartReloadEvent);
    } catch (e) {
      Logger.error(`${selectedItemIdsDebounced.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  _selectedItemIds.value = undefined;
}, DEFAULT_DEBOUNCE_IN_MS);

const _selectedItemIds = shallowRef<string[]>();
const selectedItemIds = computed({
  get: () => _selectedItemIds.value ?? selectedForCheckoutItemIds.value,
  set: async (value) => {
    _selectedItemIds.value = value;
    await selectedItemIdsDebounced(value);
  },
});

const selectedLineItems = computed(
  () => cart.value?.items?.filter((item) => selectedItemIds.value.includes(item.id)) ?? [],
);

const selectedLineItemsGroupedByVendor = computed<LineItemsGroupByVendorType<LineItemType>[]>(() =>
  getLineItemsGroupedByVendor(selectedLineItems.value),
);

export function useCart() {
  const notifications = useNotifications();
  const { openPopup } = usePopup();
  const ga = useGoogleAnalytics();

  async function fetchShortCart(): Promise<void> {
    loading.value = true;

    try {
      cart.value = await getCart({ fields: GetCartFeldsType.Short });
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
      cart.value = await getCart();
    } catch (e) {
      Logger.error(`${useCart.name}.${fetchFullCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function clearCart(cartId: string): Promise<void> {
    loading.value = true;

    try {
      cart.value = await _clearCart(cartId);
      broadcast.emit(cartReloadEvent);
    } catch (e) {
      Logger.error(`${useCart.name}.${clearCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addToCart(productId: string, qty: number): Promise<CartType> {
    loading.value = true;

    try {
      const updatedCart = await addItemToCart(productId, qty);
      cart.value = updatedCart;
      broadcast.emit(cartReloadEvent);
      return updatedCart;
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
      broadcast.emit(cartReloadEvent);
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

      broadcast.emit(cartReloadEvent);

      cart.value = data.cart;

      return items.map<OutputBulkItemType>(({ productSku, quantity }) => ({
        productSku,
        quantity,
        // Workaround as we don't know product IDs on bulk order
        isAddedToCart: data.cart.items?.some(
          (item) =>
            item.sku === productSku &&
            !data.cart.validationErrors.some(
              (error) =>
                error.objectType == ValidationErrorObjectType.CatalogProduct && error.objectId === item.productId,
            ),
        ),
      }));
    } catch (e) {
      Logger.error(`${useCart.name}.${addBulkItemsToCart.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeItems(lineItemIds: string[]): Promise<void> {
    loading.value = true;

    try {
      cart.value = await removeCartItems(lineItemIds);
      broadcast.emit(cartReloadEvent);
    } catch (e) {
      Logger.error(`${useCart.name}.${removeItems.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function changeItemQuantity(
    lineItemId: string,
    qty: number,
    options: ChangeCartItemQuantityOptionsType = {},
  ): Promise<CartType> {
    loading.value = true;

    try {
      const updatedCart = await changeCartItemQuantity(lineItemId, qty, options);
      cart.value = updatedCart;
      broadcast.emit(cartReloadEvent);
      return updatedCart;
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
      broadcast.emit(cartReloadEvent);
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
      broadcast.emit(cartReloadEvent);
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
      broadcast.emit(cartReloadEvent);
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
      broadcast.emit(cartReloadEvent);
    } catch (e) {
      Logger.error(`${useCart.name}.${updatePurchaseOrderNumber.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateShipment(
    newShipment: InputShipmentType,
    options: { withBroadcast?: boolean } = {},
  ): Promise<void> {
    const { withBroadcast = false } = options;

    loading.value = true;

    try {
      cart.value = await addOrUpdateCartShipment(newShipment, cart.value?.id);

      if (withBroadcast) {
        broadcast.emit(cartReloadEvent);
      }
    } catch (e) {
      Logger.error(`${useCart.name}.${updateShipment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeShipment(shipmentId: string, options: { withBroadcast?: boolean } = {}): Promise<void> {
    const { withBroadcast = false } = options;

    loading.value = true;

    try {
      cart.value = await _removeShipment(shipmentId, cart.value?.id);

      if (withBroadcast) {
        broadcast.emit(cartReloadEvent);
      }
    } catch (e) {
      Logger.error(`${useCart.name}.${removeShipment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updatePayment(newPayment: InputPaymentType, options: { withBroadcast?: boolean } = {}): Promise<void> {
    const { withBroadcast = false } = options;

    loading.value = true;

    try {
      cart.value = await addOrUpdateCartPayment(newPayment, cart.value?.id);

      if (withBroadcast) {
        broadcast.emit(cartReloadEvent);
      }
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
      broadcast.emit(cartReloadEvent);
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
      broadcast.emit(cartReloadEvent);
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

    broadcast.emit(cartReloadEvent);

    loading.value = false;

    return quote;
  }

  function openClearCartModal() {
    openPopup({
      component: ClearCartModal,
      props: {
        async onResult() {
          await clearCart(cart.value!.id!);
          ga.clearCart(cart.value!);
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
    selectedItemIds,
    lineItemsGroupedByVendor,
    selectedLineItems,
    selectedLineItemsGroupedByVendor,
    allItemsAreDigital,
    addedGiftsByIds,
    availableExtendedGifts,
    hasValidationErrors,
    hasOnlyUnselectedValidationError,
    getItemsTotal,
    fetchShortCart,
    fetchFullCart,
    addToCart,
    addItemsToCart,
    addBulkItemsToCart,
    changeItemQuantity,
    removeItems,
    validateCartCoupon,
    addCartCoupon,
    removeCartCoupon,
    changeComment,
    updateShipment,
    removeShipment,
    updatePayment,
    updatePurchaseOrderNumber,
    clearCart,
    createQuoteFromCart,
    addGiftsToCart,
    removeGiftsFromCart,
    toggleGift,
    openClearCartModal,
    loading: readonly(loading),
    cart: computed(() => cart.value),
  };
}
