import { createSharedComposable, computedEager, useLastChanged } from "@vueuse/core";
import { sumBy, difference, keyBy, merge } from "lodash";
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
  useChangeFullCartItemsQuantityMutation,
  useChangePurchaseOrderNumberMutation,
  useClearCartMutation,
  useGetFullCartQuery,
  useRejectGiftItemsMutation,
  useRemoveCartItemsMutation,
  useRemoveCouponMutation,
  useRemoveShipmentMutation,
  useSelectCartItemsMutation,
  useUnselectCartItemsMutation,
  useValidateCouponQuery,
  clearCart as deprecatedClearCart,
  generateCacheIdIfNew,
} from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { getMergeStrategyUniqueBy, useMutationBatcher } from "@/core/composables/useMutationBatcher";
import { ProductType, ValidationErrorObjectType } from "@/core/enums";
import { groupByVendor } from "@/core/utilities";
import { useModal } from "@/shared/modal";
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
  AddOrUpdateCartPaymentMutation,
  AddOrUpdateCartShipmentMutation,
  AddOrUpdateCartShipmentMutationVariables,
  AddOrUpdateCartPaymentMutationVariables,
} from "@/core/api/graphql/types";
import type { OutputBulkItemType, ExtendedGiftItemType } from "@/shared/cart/types";

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

  const selectedLineItems = computed(() => cart.value?.items?.filter((item) => item.selectedForCheckout) ?? []);

  const selectedLineItemsGroupedByVendor = computed(() => groupByVendor(selectedLineItems.value));

  const hasOnlyUnselectedLineItems = computedEager(() => selectedLineItems.value.length === 0);

  const allItemsAreDigital = computed(() =>
    selectedLineItems.value.length > 0
      ? selectedLineItems.value.every((item) => item.productType === ProductType.Digital)
      : undefined,
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
            selectedLineItems.value?.some((item) => item.productId === error.objectId)) ||
          (error.objectType === ValidationErrorObjectType.LineItem &&
            selectedLineItems.value?.some((item) => item.id === error.objectId)),
      ) ?? selectedLineItems.value?.some((item) => item.validationErrors?.length),
  );

  const hasOnlyUnselectedValidationError = computedEager(
    () =>
      cart.value?.validationErrors?.length == 1 &&
      cart.value.validationErrors[0]?.errorCode == CartValidationErrors.ALL_LINE_ITEMS_UNSELECTED,
  );

  const { mutate: _selectCartItems, loading: selectCartItemsLoading } = useSelectCartItemsMutation(cart);
  const { mutate: _unselectCartItemsMutation, loading: unselectCartItemsLoading } = useUnselectCartItemsMutation(cart);

  const selectedItemIds = computed({
    get: () => selectedLineItems.value.map((item) => item.id),
    set: (newValue) => {
      const oldValue = selectedItemIds.value;

      const newlySelectedLineItemIds = difference(newValue, oldValue);
      const newlyUnselectedLineItemIds = difference(oldValue, newValue);

      const hasNewlySelected = newlySelectedLineItemIds.length > 0;
      const hasNewlyUnselected = newlyUnselectedLineItemIds.length > 0;
      if (hasNewlySelected) {
        void _selectCartItems(
          {
            command: {
              lineItemIds: newlySelectedLineItemIds,
            },
          },
          {
            optimisticResponse: {
              selectCartItems: merge({}, cart.value!, {
                items: cart.value!.items.map((item) => ({
                  selectedForCheckout: newlySelectedLineItemIds.includes(item.id) || item.selectedForCheckout,
                })),
              }),
            },
          },
        );
      }
      if (hasNewlyUnselected) {
        void _unselectCartItemsMutation(
          {
            command: {
              lineItemIds: newlyUnselectedLineItemIds,
            },
          },
          {
            optimisticResponse: {
              unSelectCartItems: merge({}, cart.value!, {
                items: cart.value!.items.map((item) => ({
                  selectedForCheckout: !newlyUnselectedLineItemIds.includes(item.id) && item.selectedForCheckout,
                })),
              }),
            },
          },
        );
      }
    },
  });

  const { mutate: _clearCart, loading: clearCartLoading } = useClearCartMutation(cart);
  async function clearCart(): Promise<void> {
    await _clearCart();
  }

  const { mutate: _removeItems, loading: removeItemsLoading } = useRemoveCartItemsMutation(cart);
  async function removeItems(lineItemIds: string[]): Promise<void> {
    await _removeItems(
      { command: { lineItemIds } },
      {
        optimisticResponse: {
          removeCartItems: {
            ...cart.value!,
            items: cart.value!.items.filter((item) => !lineItemIds.includes(item.id)),
          },
        },
      },
    );
  }

  const { mutate: _changeItemsQuantity, loading: changeItemsQuantityLoading } =
    useChangeFullCartItemsQuantityMutation(cart);
  const { add, overflowed: changeFullCartItemQuantityOverflowed } = useMutationBatcher(_changeItemsQuantity, {
    merge: getMergeStrategyUniqueBy("lineItemId"),
    maxLength: 2,
  });
  async function changeItemQuantity(lineItemId: string, quantity: number): Promise<void> {
    await add({ command: { cartItems: [{ lineItemId, quantity }] } });
  }

  const validateCouponLoading = ref(false);
  async function validateCartCoupon(couponCode: string): Promise<boolean | undefined> {
    const { result, load: _validateCoupon } = useValidateCouponQuery(couponCode, cart.value?.id ?? "");
    validateCouponLoading.value = true;
    await _validateCoupon();
    validateCouponLoading.value = false;
    return result.value?.validateCoupon || false;
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
                {
                  id: value.id,
                  shipmentMethodCode: value.shipmentMethodCode,
                  shipmentMethodOption: value.shipmentMethodOption,
                  deliveryAddress: generateCacheIdIfNew(value.deliveryAddress, "CartAddressType"),
                },
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
                {
                  id: value.id,
                  paymentGatewayCode: value.paymentGatewayCode,
                  billingAddress: generateCacheIdIfNew(value.billingAddress, "CartAddressType"),
                },
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
    changeFullCartItemQuantityOverflowed,
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
        changeItemsQuantityLoading.value ||
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
    addGiftsToCart,
    removeGiftsFromCart,
    toggleGift,
    openClearCartModal,
    loading: computedEager(() => loading.value || changing.value),
    cart: computed(() => (lastChangedShortCart.value < lastChangedFullCart.value ? fullCart.value : shortCart.value)),
  };
}

/** @deprecated Use {@link useSortCart} for adding products to cart and {@link useFullCart} for cart & checkout pages */
export const useCart = createSharedComposable(_useCart);
