import { ApolloError, gql } from "@apollo/client/core";
import { useApolloClient, useMutation } from "@vue/apollo-composable";
import { createSharedComposable } from "@vueuse/core";
import { difference, keyBy, merge, intersection } from "lodash";
import { computed, readonly, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { AbortReason } from "@/core/api/common/enums";
import {
  useGetShortCartQuery,
  useGetFullCartQuery,
  useValidateCouponQuery,
  generateCacheIdIfNew,
} from "@/core/api/graphql";
import { handleOptimisticResponseUpdateCartQuantity } from "@/core/api/graphql/config/links/utils";
import {
  AddBulkItemsCartDocument,
  AddCouponDocument,
  AddGiftItemsDocument,
  AddItemDocument,
  AddItemsCartDocument,
  AddOrUpdateCartPaymentDocument,
  AddOrUpdateCartShipmentDocument,
  ChangeCartCommentDocument,
  ChangeFullCartItemQuantityDocument,
  ChangeFullCartItemsQuantityDocument,
  ChangePurchaseOrderNumberDocument,
  ChangeShortCartItemQuantityDocument,
  ClearCartDocument,
  RejectGiftItemsDocument,
  RemoveCartItemsDocument,
  RemoveCouponDocument,
  RemoveShipmentDocument,
  SelectCartItemsDocument,
  UnselectCartItemsDocument,
  GetShortCartDocument,
  CreateCartFromWishlistDocument,
  UpdateShortCartItemQuantityDocument,
  ShortCartFragmentDoc,
} from "@/core/api/graphql/types";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { getMergeStrategyUniqueBy, useMutationBatcher } from "@/core/composables/useMutationBatcher";
import { useSyncMutationBatchers } from "@/core/composables/useSyncMutationBatchers";
import { ProductType, ValidationErrorObjectType } from "@/core/enums";
import { globals } from "@/core/globals";
import { groupByVendor, Logger } from "@/core/utilities";
import { createSharedComposableByArgs } from "@/core/utilities/composables";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import ClearCartModal from "../components/clear-cart-modal.vue";
import { EXTENDED_DEBOUNCE_IN_MS } from "../constants";
import { CartValidationErrors } from "../enums";
import type {
  InputNewBulkItemType,
  InputNewCartItemType,
  ShortCartFragment,
  CartType,
  InputPaymentType,
  InputShipmentType,
  AddOrUpdateCartShipmentMutation,
  AddOrUpdateCartShipmentMutationVariables,
  LineItemType,
  ConfigurationSectionInput,
  BulkLineItemFragment,
} from "@/core/api/graphql/types";
import type { OutputBulkItemType, ExtendedGiftItemType } from "@/shared/cart/types";
import type { DeepReadonly } from "vue";

const CartItemsSelectionFragment = gql`
  fragment CartItemsSelectionFragment on CartType {
    items {
      id
      selectedForCheckout
    }
  }
`;

/**
 * Reactive shared access to the current cart state using the GetShortCart GraphQL query.
 *
 * Notes:
 * - Ensure that any mutation which modifies the cart returns a CartType object
 *   matching the shape of the GetShortCart query result.
 * - If a new mutation is added, explicitly test the scenario where the cart is initially null.
 *   This is common in lazy-initialization flows where the cart is created only upon user action.
 * - Consumers of `cart` should gracefully handle `null` values to avoid rendering errors.
 */
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
  const { storeId, currencyCode, cultureName, userId } = globals;
  const commonVariables = { storeId, currencyCode, cultureName, userId };
  const { analytics } = useAnalytics();
  const { mutate: _addToCart, loading: addToCartLoading } = useMutation(AddItemDocument);

  async function addToCart(
    productId: string,
    quantity: number,
    configurationSections?: DeepReadonly<ConfigurationSectionInput[]>,
  ) {
    try {
      const result = await _addToCart(
        {
          command: {
            productId,
            quantity,
            configurationSections: configurationSections as ConfigurationSectionInput[],
            ...commonVariables,
          },
        },
        {
          update: (cache, { data }) => {
            if (data?.addItem) {
              // Write the new cart to the cache for the GetShortCart query
              cache.writeQuery({
                query: GetShortCartDocument,
                data: { cart: data.addItem },
                variables: commonVariables,
              });
            }
          },
        },
      );

      return result?.data?.addItem;
    } catch (err) {
      if (err instanceof ApolloError && err.networkError?.toString() === (AbortReason.Explicit as string)) {
        return;
      }
      Logger.error(err as string);
    }
  }

  const { mutate: _addItemsToCart, loading: addItemsToCartLoading } = useMutation(AddItemsCartDocument);
  async function addItemsToCart(items: InputNewCartItemType[]): Promise<ShortCartFragment | undefined> {
    const result = await _addItemsToCart(
      { command: { cartItems: items, ...commonVariables } },
      {
        update: (cache, { data }) => {
          if (data?.addItemsCart) {
            cache.writeQuery({
              query: GetShortCartDocument,
              data: { cart: data.addItemsCart },
              variables: commonVariables,
            });
          }
        },
      },
    );
    return result?.data?.addItemsCart;
  }

  const { mutate: _addBulkItemsToCart, loading: addBulkItemsToCartLoading } = useMutation(AddBulkItemsCartDocument);
  async function addBulkItemsToCart(items: InputNewBulkItemType[]): Promise<OutputBulkItemType[]> {
    const result = await _addBulkItemsToCart(
      {
        command: { cartItems: items, ...commonVariables },
      },
      {
        update: (cache, { data }) => {
          if (data?.addBulkItemsCart?.cart) {
            cache.writeQuery({
              query: GetShortCartDocument,
              data: { cart: data.addBulkItemsCart.cart },
              variables: commonVariables,
            });
          }
        },
      },
    );

    const outputItems = items.map<OutputBulkItemType>(({ productSku, quantity }) => ({
      productSku,
      quantity,
      errors: result?.data?.addBulkItemsCart?.errors?.filter((error) => error.objectId === productSku),
    }));

    const itemsQuantityMap = new Map(items.map(({ productSku, quantity }) => [productSku, quantity]));

    const errorSkus = new Set(result?.data?.addBulkItemsCart?.errors?.map((error) => error.objectId) ?? []);

    const successfulItemsToTrack = result?.data?.addBulkItemsCart?.cart?.items
      ?.map((item) => ({
        ...item,
        quantity: itemsQuantityMap.get(item.sku) ?? 0,
      }))
      ?.filter((item) => !errorSkus.has(item.sku) && item.quantity > 0);

    trackAddBulkItemsToCart(successfulItemsToTrack);

    return outputItems;
  }

  function trackAddBulkItemsToCart(items?: BulkLineItemFragment[]) {
    if (!items?.length) {
      return;
    }

    analytics("addBulkItemsToCart", items, { source_order: "/bulk-order" });
  }

  const { mutate: _changeItemQuantity, loading: changeItemQuantityLoading } = useMutation(
    ChangeShortCartItemQuantityDocument,
  );
  const {
    add: changeItemQuantityBatchedMutation,
    overflowed: changeItemQuantityBatchedOverflowed,
    loading: changeItemQuantityBatchedLoading,
  } = useMutationBatcher(_changeItemQuantity);
  async function changeItemQuantityFunction(
    lineItemId: string,
    quantity: number,
    mutation: typeof _changeItemQuantity | typeof changeItemQuantityBatchedMutation,
  ) {
    try {
      const lineItem = cart.value?.items.find((item) => item.id === lineItemId);
      const result = await mutation({
        command: { lineItemId, quantity, ...commonVariables },
        skipQuery: false,
      });

      if (lineItem) {
        analytics("updateCartItem", lineItem.sku, quantity, lineItem?.quantity);
      }

      return result?.data?.changeCartItemQuantity;
    } catch (err) {
      Logger.error(err as string);
    }
  }
  async function changeItemQuantity(lineItemId: string, quantity: number) {
    return changeItemQuantityFunction(lineItemId, quantity, _changeItemQuantity);
  }
  async function changeItemQuantityBatched(lineItemId: string, quantity: number) {
    return changeItemQuantityFunction(lineItemId, quantity, changeItemQuantityBatchedMutation);
  }

  const { mutate: updateItemCartQuantityMutation, loading: updateItemCartQuantityLoading } = useMutation(
    UpdateShortCartItemQuantityDocument,
    {
      update: (cache, { data }) => {
        const currentCart = cart.value
          ? cache.readFragment<CartType>({
              fragmentName: "shortCart",
              fragment: ShortCartFragmentDoc,
              id: cache.identify(cart.value),
            })
          : undefined;

        if (data?.updateCartQuantity) {
          const cartData = {
            ...data.updateCartQuantity,
            shipments: currentCart?.shipments ?? [],
            validationErrors: currentCart?.validationErrors ?? [],
          };

          cache.writeQuery({
            query: GetShortCartDocument,
            data: { cart: cartData },
            variables: commonVariables,
          });
        }
      },
      optimisticResponse: (vars, { IGNORE }) => {
        const itemsInput = vars.command?.items;

        if (!Array.isArray(itemsInput) || itemsInput.length === 0 || !cart.value) {
          return IGNORE;
        }

        return handleOptimisticResponseUpdateCartQuantity(cart.value as CartType, itemsInput);
      },
    },
  );
  function updateItemCartQuantity(productId: string, quantity: number) {
    return updateItemCartQuantityMutation({
      command: { items: [{ productId, quantity }], ...commonVariables, cartId: cart.value?.id },
    });
  }

  const { mutate: _createCartFromWishlist, loading: createCartFromWishlistLoading } =
    useMutation(CreateCartFromWishlistDocument);
  async function createCartFromWishlist(wishlistId: string) {
    return await _createCartFromWishlist({ command: { listId: wishlistId } });
  }

  return {
    cart,
    refetch,
    addToCart,
    addItemsToCart,
    addBulkItemsToCart,
    changeItemQuantity,
    changeItemQuantityBatched,
    createCartFromWishlist,
    loading,
    addToCartLoading,
    changeItemQuantityBatchedOverflowed,
    createCartFromWishlistLoading,
    updateItemCartQuantity,
    changing: computed(
      () =>
        addToCartLoading.value ||
        addItemsToCartLoading.value ||
        addBulkItemsToCartLoading.value ||
        changeItemQuantityLoading.value ||
        changeItemQuantityBatchedLoading.value ||
        updateItemCartQuantityLoading.value,
    ),
  };
}

export function _useFullCart(cartId?: string) {
  const { openModal } = useModal();
  const { analytics } = useAnalytics();
  const { client, resolveClient } = useApolloClient();
  const { storeId, currencyCode, cultureName, userId } = globals;
  const commonVariables = { storeId, currencyCode, cultureName, userId, cartId };
  const notifications = useNotifications();
  const { t } = useI18n();

  const { result: query, load, refetch, loading } = useGetFullCartQuery(cartId);

  const forceFetch = async () => (await load()) || (await refetch());

  const cart = computed(() => query.value?.cart as CartType | undefined);

  const shipment = computed(() => cart.value?.shipments[0]);
  const payment = computed(() => cart.value?.payments[0]);

  const availableShippingMethods = computed(() => cart.value?.availableShippingMethods ?? []);
  const availablePaymentMethods = computed(() => cart.value?.availablePaymentMethods ?? []);

  const lineItemsGroupedByVendor = computed(() => groupByVendor(cart.value?.items ?? []));

  const selectedLineItems = computed(() => cart.value?.items?.filter((item) => item.selectedForCheckout) ?? []);

  const selectedLineItemsGroupedByVendor = computed(() => groupByVendor(selectedLineItems.value));

  const hasOnlyUnselectedLineItems = computed(() => selectedLineItems.value.length === 0);

  const allItemsAreDigital = computed(() =>
    selectedLineItems.value.length > 0
      ? selectedLineItems.value.every((item) => item.productType === ProductType.Digital)
      : undefined,
  );

  const addedGiftsByIds = computed(() => keyBy(cart.value?.gifts, "id"));

  const availableExtendedGifts = computed<ExtendedGiftItemType[]>(() =>
    (cart.value?.availableGifts ?? []).map((gift) => ({ ...gift, isAddedInCart: !!addedGiftsByIds.value[gift.id] })),
  );

  const hasValidationErrors = computed(
    () =>
      cart.value?.validationErrors?.some(
        (error) =>
          (error.objectType === ValidationErrorObjectType.CartProduct &&
            selectedLineItems.value?.some((item) => item.productId === error.objectId)) ||
          (error.objectType === ValidationErrorObjectType.LineItem &&
            selectedLineItems.value?.some((item) => item.id === error.objectId)),
      ) ?? selectedLineItems.value?.some((item) => item.validationErrors?.length),
  );

  const hasOnlyUnselectedValidationError = computed(
    () =>
      cart.value?.validationErrors?.length == 1 &&
      cart.value.validationErrors[0]?.errorCode == CartValidationErrors.ALL_LINE_ITEMS_UNSELECTED,
  );

  const { mutate: _selectCartItemsMutation } = useMutation(SelectCartItemsDocument);
  const { mutate: _unselectCartItemsMutation } = useMutation(UnselectCartItemsDocument);
  const selectCartBatcher = useMutationBatcher(_selectCartItemsMutation);
  const unselectCartBatcher = useMutationBatcher(_unselectCartItemsMutation);
  const { add: _selectCartItems, loading: selectLoading, overflowed: selectOverflowed } = selectCartBatcher;
  const { add: _unselectCartItems, loading: unselectLoading, overflowed: unselectOverflowed } = unselectCartBatcher;
  const selectionOverflowed = computed(() => selectOverflowed.value || unselectOverflowed.value);
  const selectionLoading = computed(() => selectLoading.value || unselectLoading.value);

  useSyncMutationBatchers(selectCartBatcher, unselectCartBatcher, ({ args, anotherBatcher }) => {
    if (!anotherBatcher.loading.value) {
      return;
    }

    const mutationIds = args.command?.lineItemIds ?? [];
    const anotherBatcherIds = anotherBatcher.arguments.value?.command?.lineItemIds ?? [];
    const intersectionIds = intersection(anotherBatcherIds, mutationIds);

    if (intersectionIds.length > 0) {
      anotherBatcher.abort();
      const ids = difference(anotherBatcherIds, intersectionIds);
      if (ids.length > 0) {
        void anotherBatcher.add(
          {
            command: { lineItemIds: ids, ...commonVariables },
            skipQuery: false,
          },
          undefined,
          false,
        );
      }
    }
  });

  const selectedItemIds = computed(() => selectedLineItems.value.map((item) => item.id));

  // Have to update cache explicitly because mutations can be aborted and cache will be rolled back if we use optimisticResponse in mutations. Which cause UI inconsistencies.
  function updateSelectionCache(ids: string[], type: "select" | "unselect") {
    if (!cart.value) {
      return;
    }
    client.cache.updateFragment(
      {
        id: client.cache.identify(cart.value),
        fragment: CartItemsSelectionFragment,
      },
      (data: { items: LineItemType[] | undefined } | null) => {
        return {
          items: data?.items?.map((item: LineItemType) => ({
            ...item,
            selectedForCheckout:
              type === "select"
                ? ids.includes(item.id) || item.selectedForCheckout
                : item.selectedForCheckout && !ids.includes(item.id),
          })),
        };
      },
    );
  }

  function selectCartItems(ids: string[]): void {
    updateSelectionCache(ids, "select");
    void _selectCartItems({
      command: {
        lineItemIds: ids,
        ...commonVariables,
      },
      skipQuery: false,
    });
  }

  function unselectCartItems(ids: string[]): void {
    updateSelectionCache(ids, "unselect");
    void _unselectCartItems({
      command: {
        lineItemIds: ids,
        ...commonVariables,
      },
      skipQuery: false,
    });
  }

  const { mutate: _clearCart, loading: clearCartLoading, onDone: onClearCartDone } = useMutation(ClearCartDocument);

  onClearCartDone(() => resolveClient().cache.gc());

  async function clearCart(): Promise<void> {
    await _clearCart({ command: { ...commonVariables }, skipQuery: false });
  }

  const { mutate: _removeItems, loading: removeItemsLoading } = useMutation(RemoveCartItemsDocument);
  async function removeItems(lineItemIds: string[]): Promise<void> {
    await _removeItems(
      { command: { lineItemIds, ...commonVariables }, skipQuery: false },
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

  const { mutate: _changeItemQuantity, loading: changeItemQuantityLoading } = useMutation(
    ChangeFullCartItemQuantityDocument,
  );
  async function changeItemQuantity(lineItemId: string, quantity: number): Promise<void> {
    await _changeItemQuantity({ command: { lineItemId, quantity, ...commonVariables }, skipQuery: false });
  }

  const { mutate: _changeItemsQuantity } = useMutation(ChangeFullCartItemsQuantityDocument);
  const {
    add,
    overflowed: changeItemQuantityBatchedOverflowed,
    loading: changeItemsQuantityLoading,
  } = useMutationBatcher(_changeItemsQuantity, {
    mergeStrategy: getMergeStrategyUniqueBy("lineItemId"),
    debounce: EXTENDED_DEBOUNCE_IN_MS,
  });
  async function changeItemQuantityBatched(lineItemId: string, quantity: number): Promise<void> {
    try {
      const item = cart.value?.items.find((lineItem) => lineItem.id === lineItemId);
      await add({
        command: {
          cartItems: [{ lineItemId, quantity }],
          ...commonVariables,
        },
      });

      if (item) {
        analytics("updateCartItem", item.sku, quantity, item.quantity);
      }
    } catch (error) {
      if (error instanceof ApolloError && error.networkError?.toString() === (AbortReason.Explicit as string)) {
        return;
      }
      Logger.error(changeItemQuantityBatched.name, error);
    }
  }

  const validateCouponLoading = ref(false);
  async function validateCartCoupon(couponCode: string): Promise<boolean | undefined> {
    const { result, load: _validateCoupon } = useValidateCouponQuery(couponCode, cart.value?.id ?? "");
    validateCouponLoading.value = true;
    await _validateCoupon();
    validateCouponLoading.value = false;
    return result.value?.validateCoupon || false;
  }

  const { mutate: _addCoupon, loading: addCouponLoading } = useMutation(AddCouponDocument);
  async function addCartCoupon(couponCode: string): Promise<void> {
    await _addCoupon({ command: { couponCode, ...commonVariables }, skipQuery: false });
  }

  const { mutate: _removeCoupon, loading: removeCouponLoading } = useMutation(RemoveCouponDocument);
  async function removeCartCoupon(couponCode: string): Promise<void> {
    await _removeCoupon({ command: { couponCode, ...commonVariables }, skipQuery: false });
  }

  const { mutate: _changeComment, loading: changeCommentLoading } = useMutation(ChangeCartCommentDocument);
  async function changeComment(comment: string): Promise<void> {
    await _changeComment({ command: { comment, ...commonVariables }, skipQuery: false });
  }

  const { mutate: _changePurchaseOrderNumber, loading: changePurchaseOrderNumberLoading } = useMutation(
    ChangePurchaseOrderNumberDocument,
  );
  async function updatePurchaseOrderNumber(purchaseOrderNumber: string): Promise<void> {
    await _changePurchaseOrderNumber({ command: { purchaseOrderNumber, ...commonVariables }, skipQuery: false });
  }

  const {
    mutate: _addOrUpdateShipment,
    loading: addOrUpdateShipmentLoading,
    onDone: onAddOrUpdateShipmentDone,
  } = useMutation(AddOrUpdateCartShipmentDocument);

  onAddOrUpdateShipmentDone(() => resolveClient().cache.gc());

  async function updateShipment(value: InputShipmentType): Promise<void> {
    await _addOrUpdateShipment(
      { command: { shipment: value, ...commonVariables }, skipQuery: false },
      {
        optimisticResponse: (vars, { IGNORE }) => {
          if ((vars as AddOrUpdateCartShipmentMutationVariables).command.shipment.id === undefined) {
            return IGNORE as AddOrUpdateCartShipmentMutation;
          }
          return {
            addOrUpdateCartShipment: merge({}, cart.value, {
              shipments: [
                {
                  id: value.id,
                  shipmentMethodCode: value.shipmentMethodCode,
                  shipmentMethodOption: value.shipmentMethodOption,
                  deliveryAddress: value.deliveryAddress
                    ? generateCacheIdIfNew(
                        {
                          ...value.deliveryAddress,
                          name: value.deliveryAddress?.name ?? null,
                          organization: value.deliveryAddress?.organization ?? null,
                          firstName: value.deliveryAddress?.firstName ?? null,
                          lastName: value.deliveryAddress?.lastName ?? null,
                          countryCode: value.deliveryAddress?.countryCode ?? null,
                          regionName: value.deliveryAddress?.regionName ?? null,
                          email: value.deliveryAddress?.email ?? null,
                          addressType: value.deliveryAddress?.addressType ?? null,
                          outerId: value.deliveryAddress?.outerId ?? null,
                        },
                        "CartAddressType",
                      )
                    : undefined,
                },
              ],
            }),
          };
        },
      },
    );
  }

  const {
    mutate: _removeShipment,
    loading: removeShipmentLoading,
    onDone: onRemoveShipmentDone,
  } = useMutation(RemoveShipmentDocument);

  onRemoveShipmentDone(() => resolveClient().cache.gc());

  async function removeShipment(shipmentId: string): Promise<void> {
    await _removeShipment(
      { command: { shipmentId, ...commonVariables }, skipQuery: false },
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

  const {
    mutate: _addOrUpdatePayment,
    loading: addOrUpdatePaymentLoading,
    onDone: onAddOrUpdatePaymentDone,
  } = useMutation(AddOrUpdateCartPaymentDocument);

  onAddOrUpdatePaymentDone(() => resolveClient().cache.gc());

  async function updatePayment(value: InputPaymentType): Promise<void> {
    try {
      await _addOrUpdatePayment({ command: { payment: value, ...commonVariables }, skipQuery: false });
    } catch (e) {
      Logger.error(updatePayment.name, e);
      notifications.error({ text: t("pages.account.order_payment.failure.title") });
      setTimeout(() => {
        // clear state
        location.reload();
      }, 3000);
    }
  }

  const { mutate: _addGiftItems, loading: addGiftItemsLoading } = useMutation(AddGiftItemsDocument);
  async function addGiftsToCart(giftIds: string[]): Promise<void> {
    await _addGiftItems({ command: { ids: giftIds, ...commonVariables }, skipQuery: false });
  }

  const { mutate: _rejectGiftItems, loading: rejectGiftItemsLoading } = useMutation(RejectGiftItemsDocument);
  async function removeGiftsFromCart(giftLineItemIds: string[]): Promise<void> {
    await _rejectGiftItems({ command: { ids: giftLineItemIds, ...commonVariables }, skipQuery: false });
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
          analytics("clearCart", cart.value!);
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
    changeItemQuantityBatched,
    changeItemQuantityBatchedOverflowed,
    selectCartItems,
    unselectCartItems,
    selectionOverflowed,
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
        selectionLoading.value ||
        clearCartLoading.value ||
        removeItemsLoading.value ||
        changeItemQuantityLoading.value ||
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

const useFullCartShared = createSharedComposableByArgs(_useFullCart, (args) => args?.[0] ?? "");

export function useFullCart() {
  const route = useRoute();
  const cartId = Array.isArray(route.params?.cartId) ? route.params?.cartId[0] : route.params?.cartId;

  return useFullCartShared(cartId);
}
