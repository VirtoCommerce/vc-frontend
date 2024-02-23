import { useApolloClient } from "@vue/apollo-composable";
import { createGlobalState, createSharedComposable, computedEager, useLastChanged } from "@vueuse/core";
import { sumBy, difference, keyBy, without, mergeWith, merge } from "lodash";
import { computed, readonly, ref } from "vue";
import {
  useGetShortCartQuery,
  useAddItemToCartMutation,
  useAddItemsCartMutation,
  useAddBulkItemsCartMutation,
  useChangeShortCartItemQuantityMutation,
  useAddCouponMutation,
  useAddGiftItemsMutation,
  useAddOrUpdateCartPaymentMutation,
  useAddOrUpdateCartShipmentMutation,
  useChangeCartCommentMutation,
  useChangeFullCartItemQuantityMutation,
  useChangePurchaseOrderNumberMutation,
  useClearCartMutation,
  useCreateQuoteFromCartMutation,
  useGetFullCartQuery,
  useRejectGiftItemsMutation,
  useRemoveCartItemsMutation,
  useRemoveCouponMutation,
  useRemoveShipmentMutation,
  useSelectCartItemsMutation,
  useUnselectCartItemsMutation,
  useValidateCouponMutation,
  clearCart as deprecatedClearCart,
  toOptimisticResponse,
} from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { ProductType, ValidationErrorObjectType } from "@/core/enums";
import { globals } from "@/core/globals";
import { groupByVendor } from "@/core/utilities";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import ClearCartModal from "../components/clear-cart-modal.vue";
import { CartValidationErrors } from "../enums";
import type { ChangeCartItemQuantityOptionsType } from "@/core/api/graphql";
import type {
  InputNewBulkItemType,
  InputNewCartItemType,
  ShortCartFragment,
  CartType,
  InputPaymentType,
  InputShipmentType,
  QuoteType,
  ShipmentType,
  AddOrUpdateCartPaymentMutation,
  AddOrUpdateCartShipmentMutation,
  AddOrUpdateCartShipmentMutationVariables,
  AddOrUpdateCartPaymentMutationVariables,
  PaymentType,
  CartAddressType,
} from "@/core/api/graphql/types";
import type { OutputBulkItemType, ExtendedGiftItemType } from "@/shared/cart/types";
import type { InMemoryCache } from "@apollo/client/core";

function _useSharedShortCart() {
  const { result: query, refetch, loading } = useGetShortCartQuery();
  const cart = computed(() => query.value?.cart);

  return {
    cart,
    refetch,
    loading,
  };
}

const useSharedShortCart = createSharedComposable(_useSharedShortCart);

export function useShortCart() {
  const { cart, refetch, loading } = useSharedShortCart();

  const { mutate: _addToCart, loading: addToCartLoading } = useAddItemToCartMutation();
  async function addToCart(productId: string, quantity: number): Promise<ShortCartFragment | undefined> {
    const result = await _addToCart({ command: { productId, quantity } });
    return result?.data?.addItem;
  }

  const { mutate: _addItemsToCart, loading: addItemsToCartLoading } = useAddItemsCartMutation();
  async function addItemsToCart(items: InputNewCartItemType[]): Promise<ShortCartFragment | undefined> {
    const result = await _addItemsToCart({ command: { cartItems: items } });
    return result?.data?.addItemsCart;
  }

  const { mutate: _addBulkItemsToCart, loading: addBulkItemsToCartLoading } = useAddBulkItemsCartMutation();
  async function addBulkItemsToCart(items: InputNewBulkItemType[]): Promise<OutputBulkItemType[]> {
    const result = await _addBulkItemsToCart({ command: { cartItems: items } });

    const cartFragment = result?.data?.addBulkItemsCart?.cart;

    return items.map<OutputBulkItemType>(({ productSku, quantity }) => ({
      productSku,
      quantity,
      // Workaround as we don't know product IDs on bulk order
      isAddedToCart: cartFragment?.items.some(
        (item) =>
          item.sku === productSku &&
          !cartFragment?.validationErrors.some(
            (error) =>
              error.objectType == ValidationErrorObjectType.CatalogProduct && error.objectId === item.productId,
          ),
      ),
    }));
  }

  const { mutate: _changeItemQuantity, loading: changeItemQuantityLoading } = useChangeShortCartItemQuantityMutation();
  async function changeItemQuantity(lineItemId: string, quantity: number): Promise<ShortCartFragment | undefined> {
    const result = await _changeItemQuantity({ command: { lineItemId, quantity } });
    return result?.data?.changeCartItemQuantity;
  }

  // FIXME: https://virtocommerce.atlassian.net/browse/ST-5474
  // Calculate total price of items in the cart for some set of products
  function getItemsTotal(productIds: string[]): number {
    if (!cart.value?.items.length) {
      return 0;
    }

    const filteredItems = cart.value.items.filter((item) => productIds.includes(item.productId));

    return sumBy(filteredItems, (x) => x.extendedPrice.amount);
  }

  return {
    cart,
    refetch,
    addToCart,
    addItemsToCart,
    addBulkItemsToCart,
    changeItemQuantity,
    getItemsTotal,
    loading,
    changing: computed(
      () =>
        addToCartLoading.value ||
        addItemsToCartLoading.value ||
        addBulkItemsToCartLoading.value ||
        changeItemQuantityLoading.value,
    ),
  };
}

export function _useFullCart() {
  const notifications = useNotifications();
  const { openModal } = useModal();
  const ga = useGoogleAnalytics();

  const { result: query, load, refetch, loading } = useGetFullCartQuery();

  const forceFetch = async () => (await load()) || (await refetch());

  const cart = computed(() => query.value?.cart as CartType | undefined);

  const shipment = computed(() => cart.value?.shipments[0]);
  const payment = computed(() => cart.value?.payments[0]);

  const availableShippingMethods = computed(() => cart.value?.availableShippingMethods ?? []);
  const availablePaymentMethods = computed(() => cart.value?.availablePaymentMethods ?? []);

  const lineItemsGroupedByVendor = computed(() => groupByVendor(cart.value?.items ?? []));

  const selectedForCheckoutItems = computed(() => cart.value?.items?.filter((item) => item.selectedForCheckout));

  const allItemsAreDigital = computedEager(() =>
    selectedForCheckoutItems.value?.every((item) => item.productType === ProductType.Digital),
  );

  const addedGiftsByIds = computed(() => keyBy(cart.value?.gifts, "id"));

  const availableExtendedGifts = computed<ExtendedGiftItemType[]>(() =>
    (cart.value?.availableGifts ?? []).map((gift) => ({ ...gift, isAddedInCart: !!addedGiftsByIds.value[gift.id] })),
  );

  const hasValidationErrors = computedEager(
    () =>
      cart.value?.validationErrors?.some(
        (error) =>
          (error.objectType === ValidationErrorObjectType.CartProduct &&
            selectedForCheckoutItems.value?.some((item) => item.productId === error.objectId)) ||
          (error.objectType === ValidationErrorObjectType.LineItem &&
            selectedForCheckoutItems.value?.some((item) => item.id === error.objectId)),
      ) ?? selectedForCheckoutItems.value?.some((item) => item.validationErrors?.length),
  );

  const hasOnlyUnselectedValidationError = computedEager(
    () =>
      cart.value?.validationErrors?.length == 1 &&
      cart.value.validationErrors[0]?.errorCode == CartValidationErrors.ALL_LINE_ITEMS_UNSELECTED,
  );

  const selectedForCheckoutItemIds = computed(() => selectedForCheckoutItems.value?.map((item) => item.id) ?? []);

  const { mutate: _selectCartItems, loading: selectCartItemsLoading } = useSelectCartItemsMutation(cart);
  const { mutate: _unselectCartItemsMutation, loading: unselectCartItemsLoading } = useUnselectCartItemsMutation(cart);
  const selectItemIds = async (newValue: string[]): Promise<void> => {
    const oldValue = selectedItemIds.value;

    const newlySelectedLineItemIds = difference(newValue, oldValue);
    const newlyUnselectedLineItemIds = difference(oldValue, newValue);

    const hasNewlySelected = newlySelectedLineItemIds.length > 0;
    const hasNewlyUnselected = newlyUnselectedLineItemIds.length > 0;
    if (hasNewlySelected) {
      await _selectCartItems({
        command: {
          lineItemIds: newlySelectedLineItemIds,
        },
      });
    }
    if (hasNewlyUnselected) {
      await _unselectCartItemsMutation({
        command: {
          lineItemIds: newlyUnselectedLineItemIds,
        },
      });
    }
  };

  const _selectedItemIds = ref<string[]>();
  const selectedItemIds = computed({
    get: () => _selectedItemIds.value ?? selectedForCheckoutItemIds.value,
    set: (value) => {
      void selectItemIds(value);
      _selectedItemIds.value = value;
    },
  });

  const selectedLineItems = computed(
    () => cart.value?.items?.filter((item) => selectedItemIds.value.includes(item.id)) ?? [],
  );

  const selectedLineItemsGroupedByVendor = computed(() => groupByVendor(selectedLineItems.value));

  const hasOnlyUnselectedLineItems = computedEager(() => selectedItemIds.value.length === 0);

  const { mutate: _clearCart, loading: clearCartLoading } = useClearCartMutation(cart);
  async function clearCart(): Promise<void> {
    await _clearCart();
  }

  const { mutate: _removeItems, loading: removeItemsLoading } = useRemoveCartItemsMutation(cart);
  async function removeItems(lineItemIds: string[]): Promise<void> {
    selectedItemIds.value = without(selectedItemIds.value, ...lineItemIds);

    await _removeItems({ command: { lineItemIds } });
  }

  const { mutate: _changeItemQuantity, loading: changeItemQuantityLoading } =
    useChangeFullCartItemQuantityMutation(cart);
  async function changeItemQuantity(lineItemId: string, quantity: number): Promise<void> {
    await _changeItemQuantity({ command: { lineItemId, quantity } });
  }

  const { mutate: _validateCoupon, loading: validateCouponLoading } = useValidateCouponMutation(cart);
  async function validateCartCoupon(couponCode: string): Promise<boolean | undefined> {
    const result = await _validateCoupon({ command: { coupon: couponCode } });
    return result?.data?.validateCoupon;
  }

  const { mutate: _addCoupon, loading: addCouponLoading } = useAddCouponMutation(cart);
  async function addCartCoupon(couponCode: string): Promise<void> {
    await _addCoupon({ command: { couponCode } });
  }

  const { mutate: _removeCoupon, loading: removeCouponLoading } = useRemoveCouponMutation(cart);
  async function removeCartCoupon(couponCode: string): Promise<void> {
    await _removeCoupon({ command: { couponCode } });
  }

  const { mutate: _changeComment, loading: changeCommentLoading } = useChangeCartCommentMutation(cart);
  async function changeComment(comment: string): Promise<void> {
    await _changeComment({ command: { comment } });
  }

  const { mutate: _changePurchaseOrderNumber, loading: changePurchaseOrderNumberLoading } =
    useChangePurchaseOrderNumberMutation(cart);
  async function updatePurchaseOrderNumber(purchaseOrderNumber: string): Promise<void> {
    await _changePurchaseOrderNumber({ command: { purchaseOrderNumber } });
  }

  const { mutate: _addOrUpdateShipment, loading: addOrUpdateShipmentLoading } =
    useAddOrUpdateCartShipmentMutation(cart);
  async function updateShipment(value: InputShipmentType): Promise<void> {
    await _addOrUpdateShipment(
      { command: { shipment: value } },
      {
        optimisticResponse: (vars, { IGNORE }) => {
          if ((vars as AddOrUpdateCartShipmentMutationVariables).command.shipment.id === undefined) {
            return IGNORE as AddOrUpdateCartShipmentMutation;
          }
          return {
            addOrUpdateCartShipment: merge({}, cart.value!, {
              shipments: [
                toOptimisticResponse(
                  {
                    id: value.id,
                    shipmentMethodCode: value.shipmentMethodCode,
                    shipmentMethodOption: value.shipmentMethodOption,
                    deliveryAddress: toOptimisticResponse(value.deliveryAddress, "CartAddressType"),
                  },
                  "ShipmentType",
                ),
              ],
            }),
          };
        },
      },
    );
  }

  const { mutate: _removeShipment, loading: removeShipmentLoading } = useRemoveShipmentMutation(cart);
  async function removeShipment(shipmentId: string): Promise<void> {
    await _removeShipment(
      { command: { shipmentId } },
      {
        optimisticResponse: {
          removeShipment: {
            ...cart.value!,
            shipments: cart.value!.shipments.filter((x) => x.id !== shipmentId),
          },
        },
      },
    );
  }

  const { mutate: _addOrUpdatePayment, loading: addOrUpdatePaymentLoading } = useAddOrUpdateCartPaymentMutation(cart);
  async function updatePayment(value: InputPaymentType): Promise<void> {
    await _addOrUpdatePayment(
      { command: { payment: value } },
      {
        optimisticResponse: (vars, { IGNORE }) => {
          if ((vars as AddOrUpdateCartPaymentMutationVariables).command.payment.id === undefined) {
            return IGNORE as AddOrUpdateCartPaymentMutation;
          }
          return {
            addOrUpdateCartPayment: merge({}, cart.value!, {
              payments: [
                toOptimisticResponse(
                  {
                    id: value.id,
                    paymentGatewayCode: value.paymentGatewayCode,
                    billingAddress: toOptimisticResponse(value.billingAddress, "CartAddressType"),
                  },
                  "PaymentType",
                ),
              ],
            }),
          };
        },
      },
    );
  }

  const { mutate: _addGiftItems, loading: addGiftItemsLoading } = useAddGiftItemsMutation(cart);
  async function addGiftsToCart(giftIds: string[]): Promise<void> {
    await _addGiftItems({ command: { ids: giftIds } });
  }

  const { mutate: _rejectGiftItems, loading: rejectGiftItemsLoading } = useRejectGiftItemsMutation(cart);
  async function removeGiftsFromCart(giftLineItemIds: string[]): Promise<void> {
    await _rejectGiftItems({ command: { ids: giftLineItemIds } });
  }

  async function toggleGift(gift: ExtendedGiftItemType): Promise<void> {
    if (gift.isAddedInCart) {
      await removeGiftsFromCart([gift.lineItemId!]);
    } else {
      await addGiftsToCart([gift.id]);
    }
  }

  const { mutate: _createQuoteFromCart, loading: createQuoteFromCartLoading } = useCreateQuoteFromCartMutation();
  async function createQuoteFromCart(comment = ""): Promise<QuoteType | undefined> {
    const result = await _createQuoteFromCart({ command: { cartId: cart.value!.id, comment } });

    const quote = result?.data?.createQuoteFromCart as QuoteType | undefined;

    if (!quote) {
      notifications.error({
        text: globals.i18n.global.t("common.messages.creating_quote_error"),
        duration: 15000,
        single: true,
      });
    }

    return quote;
  }

  function openClearCartModal() {
    openModal({
      component: ClearCartModal,
      props: {
        async onResult() {
          await clearCart();
          ga.clearCart(cart.value!);
        },
      },
    });
  }

  return {
    cart,
    shipment,
    payment,
    availableShippingMethods,
    availablePaymentMethods,
    selectedItemIds,
    lineItemsGroupedByVendor,
    selectedLineItems,
    selectedLineItemsGroupedByVendor,
    hasOnlyUnselectedLineItems,
    allItemsAreDigital,
    addedGiftsByIds,
    availableExtendedGifts,
    hasValidationErrors,
    hasOnlyUnselectedValidationError,
    load,
    refetch,
    forceFetch,
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
    changing: computed(
      () =>
        selectCartItemsLoading.value ||
        unselectCartItemsLoading.value ||
        clearCartLoading.value ||
        removeItemsLoading.value ||
        changeItemQuantityLoading.value ||
        validateCouponLoading.value ||
        addCouponLoading.value ||
        removeCouponLoading.value ||
        changeCommentLoading.value ||
        changePurchaseOrderNumberLoading.value ||
        addOrUpdateShipmentLoading.value ||
        removeShipmentLoading.value ||
        addOrUpdatePaymentLoading.value ||
        addGiftItemsLoading.value ||
        rejectGiftItemsLoading.value,
    ),
    createQuoteFromCartLoading,
  };
}

export const useFullCart = createSharedComposable(_useFullCart);

function _useCart() {
  const {
    cart: shortCart,
    refetch: fetchShortCart,
    addToCart,
    addItemsToCart,
    addBulkItemsToCart,
    getItemsTotal,
    changeItemQuantity: changeShortCartItemQuantity,
  } = useShortCart();

  const {
    cart: fullCart,
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
    forceFetch: fetchFullCart,
    changeItemQuantity: changeFullCartItemQuantity,
    removeItems,
    validateCartCoupon,
    addCartCoupon,
    removeCartCoupon,
    changeComment,
    updateShipment,
    removeShipment,
    updatePayment,
    updatePurchaseOrderNumber,
    createQuoteFromCart,
    addGiftsToCart,
    removeGiftsFromCart,
    toggleGift,
    openClearCartModal,
    loading,
    changing,
  } = useFullCart();

  const lastChangedShortCart = useLastChanged(shortCart, { immediate: true });
  const lastChangedFullCart = useLastChanged(fullCart, { immediate: true });

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
    changeItemQuantity: async (
      lineItemId: string,
      quantity: number,
      options: ChangeCartItemQuantityOptionsType = {},
    ) => {
      return await (options.reloadFullCart
        ? changeFullCartItemQuantity(lineItemId, quantity)
        : changeShortCartItemQuantity(lineItemId, quantity));
    },
    removeItems,
    validateCartCoupon,
    addCartCoupon,
    removeCartCoupon,
    changeComment,
    updateShipment,
    removeShipment,
    updatePayment,
    updatePurchaseOrderNumber,
    clearCart: async (cartId: string) => {
      return await deprecatedClearCart(cartId);
    },
    createQuoteFromCart,
    addGiftsToCart,
    removeGiftsFromCart,
    toggleGift,
    openClearCartModal,
    loading: computedEager(() => loading.value || changing.value),
    cart: computed(() => (lastChangedShortCart.value < lastChangedFullCart.value ? fullCart.value : shortCart.value)),
  };
}

/** @deprecated Use {@link useSortCart} for adding products to cart and {@link useFullCart} for cart & checkout pages */
export const useCart = createGlobalState(_useCart);
