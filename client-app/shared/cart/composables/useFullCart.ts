import { computedEager, createSharedComposable, useDebounceFn } from "@vueuse/core";
import { difference, keyBy, sumBy } from "lodash";
import { computed, shallowRef } from "vue";
import {
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
} from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { globals } from "@/core/globals";
import { groupByVendor } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import { usePopup } from "@/shared/popup";
import ClearCartModal from "../components/clear-cart-modal.vue";
import { DEFAULT_DEBOUNCE_IN_MS } from "../constants";
import { CartValidationErrors } from "../enums";
import type { CartType, InputPaymentType, InputShipmentType, QuoteType } from "@/core/api/graphql/types";
import type { ExtendedGiftItemType } from "@/shared/cart/types";

export function _useFullCart() {
  const notifications = useNotifications();
  const { openPopup } = usePopup();
  const ga = useGoogleAnalytics();

  const { result: query, load, refetch, loading } = useGetFullCartQuery();

  const forceFetch = async () => (await load()) || (await refetch());

  const cart = computed(() => query.value?.cart as CartType | undefined);

  const shipment = computed(() => cart.value?.shipments[0]);
  const payment = computed(() => cart.value?.payments[0]);

  const availableShippingMethods = computed(() => cart.value?.availableShippingMethods ?? []);
  const availablePaymentMethods = computed(() => cart.value?.availablePaymentMethods ?? []);

  const lineItemsGroupedByVendor = computed(() => groupByVendor(cart.value?.items ?? []));

  const allItemsAreDigital = computed(
    () =>
      !!cart.value?.items
        ?.filter((item) => item.selectedForCheckout)
        .every((item) => item.productType === ProductType.Digital),
  );

  const addedGiftsByIds = computed(() => keyBy(cart.value?.gifts, "id"));

  const availableExtendedGifts = computed<ExtendedGiftItemType[]>(() =>
    (cart.value?.availableGifts || []).map((gift) => ({ ...gift, isAddedInCart: !!addedGiftsByIds.value[gift.id] })),
  );

  const hasValidationErrors = computedEager(
    () => !!cart.value?.validationErrors?.length || !!cart.value?.items?.some((item) => item.validationErrors?.length),
  );

  const hasOnlyUnselectedValidationError = computedEager(
    () =>
      cart.value?.validationErrors?.length == 1 &&
      cart.value.validationErrors[0]?.errorCode == CartValidationErrors.ALL_LINE_ITEMS_UNSELECTED,
  );

  const selectedForCheckoutItemIds = computed(
    () => cart.value?.items?.filter((item) => item.selectedForCheckout).map((item) => item.id) ?? [],
  );

  const { mutate: _selectCartItems, loading: selectCartItemsLoading } = useSelectCartItemsMutation(cart);
  const { mutate: _unselectCartItemsMutation, loading: unselectCartItemsLoading } = useUnselectCartItemsMutation(cart);
  const selectedItemIdsDebounced = useDebounceFn(async (newValue: string[]): Promise<void> => {
    const oldValue = selectedForCheckoutItemIds.value;

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
  }, DEFAULT_DEBOUNCE_IN_MS);

  const _selectedItemIds = shallowRef<string[]>();
  const selectedItemIds = computed({
    get: () => _selectedItemIds.value ?? selectedForCheckoutItemIds.value,
    set: (value) => {
      _selectedItemIds.value = value;
      void selectedItemIdsDebounced(value);
    },
  });

  const selectedLineItems = computed(
    () => cart.value?.items?.filter((item) => selectedItemIds.value.includes(item.id)) ?? [],
  );

  const selectedLineItemsGroupedByVendor = computed(() => groupByVendor(selectedLineItems.value));

  const { mutate: _clearCart, loading: clearCartLoading } = useClearCartMutation(cart);
  async function clearCart(): Promise<void> {
    await _clearCart();
  }

  const { mutate: _removeItems, loading: removeItemsLoading } = useRemoveCartItemsMutation(cart);
  async function removeItems(lineItemIds: string[]): Promise<void> {
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
  async function updateShipment(newShipment: InputShipmentType): Promise<void> {
    await _addOrUpdateShipment({ command: { shipment: newShipment } });
  }

  const { mutate: _removeShipment, loading: removeShipmentLoading } = useRemoveShipmentMutation(cart);
  async function removeShipment(shipmentId: string): Promise<void> {
    await _removeShipment({ command: { shipmentId } });
  }

  const { mutate: _addOrUpdatePayment, loading: addOrUpdatePaymentLoading } = useAddOrUpdateCartPaymentMutation(cart);
  async function updatePayment(newPayment: InputPaymentType): Promise<void> {
    await _addOrUpdatePayment({ command: { payment: newPayment } });
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
    openPopup({
      component: ClearCartModal,
      props: {
        async onResult() {
          await clearCart();
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
    cart,
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
    loading,
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
