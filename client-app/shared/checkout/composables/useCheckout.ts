import { createGlobalState, createSharedComposable, useDebounceFn } from "@vueuse/core";
import { omit } from "lodash";
import { computed, readonly, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { createOrderFromCart as _createOrderFromCart } from "@/core/api/graphql";
import { useAnalytics, useHistoricalEvents, useThemeContext } from "@/core/composables";
import { AddressType, ProductType } from "@/core/enums";
import { globals } from "@/core/globals";
import { isEqualAddresses, Logger } from "@/core/utilities";
import { useUser, useUserAddresses } from "@/shared/account";
import { useFullCart, EXTENDED_DEBOUNCE_IN_MS } from "@/shared/cart";
import { useOrganizationAddresses } from "@/shared/company";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import { PaymentMethodGroupType } from "@/shared/payment";
import { BOPIS_CODE } from "./useBopis";
import type {
  CartAddressType,
  CustomerOrderType,
  InputAddressType,
  InputPaymentType,
  MemberAddressType,
  PaymentMethodType,
} from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";
import SelectAddressModal from "@/shared/checkout/components/select-address-modal.vue";

const useGlobalCheckout = createGlobalState(() => {
  const loading = ref(false);
  const billingAddressEqualsShipping = ref(true);
  const placedOrder = shallowRef<CustomerOrderType | null>(null);

  const commentChanging = ref(false);
  const _comment = ref<string>();

  const purchaseOrderNumberChanging = ref(false);
  const _purchaseOrderNumber = ref<string>();

  function clearState() {
    _comment.value = undefined;
  }
  return {
    loading,
    billingAddressEqualsShipping,
    placedOrder,
    commentChanging,
    _comment,
    purchaseOrderNumberChanging,
    _purchaseOrderNumber,
    clearState,
  };
});

export function _useCheckout() {
  const { analytics } = useAnalytics();
  const { t } = useI18n();
  const notifications = useNotifications();
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const { user, isAuthenticated, isCorporateMember } = useUser();
  const {
    addresses: personalAddresses,
    fetchAddresses: fetchPersonalAddresses,
    addOrUpdateAddresses: addOrUpdatePersonalAddresses,
  } = useUserAddresses();
  const {
    addresses: organizationsAddresses,
    fetchAddresses: fetchOrganizationAddresses,
    addOrUpdateAddresses: addOrUpdateOrganizationAddresses,
  } = useOrganizationAddresses(user.value.contact?.organizationId || "");
  const {
    refetch: refetchCart,
    cart,
    selectedLineItems,
    selectCartItems,
    shipment,
    payment,
    availableShippingMethods,
    availablePaymentMethods,
    hasValidationErrors,
    allItemsAreDigital,
    updateShipment,
    updatePayment,
    changeComment,
    updatePurchaseOrderNumber,
  } = useFullCart();
  const {
    loading,
    billingAddressEqualsShipping,
    placedOrder,
    commentChanging,
    _comment,
    purchaseOrderNumberChanging,
    _purchaseOrderNumber,
    clearState: clearGlobalCheckoutState,
  } = useGlobalCheckout();
  const { themeContext } = useThemeContext();
  const { pushHistoricalEvent } = useHistoricalEvents();

  const deliveryAddress = computed(() => shipment.value?.deliveryAddress);
  const isShippingMethodBopis = computed(() => shipment.value?.shipmentMethodCode === BOPIS_CODE);

  const billingAddress = computed(() =>
    !allItemsAreDigital.value &&
    !isShippingMethodBopis.value &&
    billingAddressEqualsShipping.value &&
    deliveryAddress.value
      ? deliveryAddress.value
      : payment.value?.billingAddress,
  );
  const shipmentMethod = computed(() =>
    availableShippingMethods.value.find(
      (item) => item.id === shipment.value?.shipmentMethodCode + "_" + shipment.value?.shipmentMethodOption,
    ),
  );
  const paymentMethod = computed(() =>
    availablePaymentMethods.value.find((item) => item.code === payment.value?.paymentGatewayCode),
  );

  const changeCommentDebounced = useDebounceFn(async (value: string) => {
    if (cart.value?.comment !== value) {
      await changeComment(value);
    }
    commentChanging.value = false;
  }, EXTENDED_DEBOUNCE_IN_MS);

  const updatePurchaseOrderNumberDebounced = useDebounceFn(async (value: string) => {
    if (cart.value?.purchaseOrderNumber !== value) {
      await updatePurchaseOrderNumber(value);
    }
    purchaseOrderNumberChanging.value = false;
  }, EXTENDED_DEBOUNCE_IN_MS);

  const comment = computed({
    get: () => _comment.value ?? cart.value?.comment ?? "",
    set: (value: string) => {
      commentChanging.value = true;
      _comment.value = value;
      void changeCommentDebounced(value.trim());
    },
  });

  const purchaseOrderNumber = computed({
    get: () => _purchaseOrderNumber.value ?? cart.value?.purchaseOrderNumber ?? "",
    set: (value: string) => {
      purchaseOrderNumberChanging.value = true;
      _purchaseOrderNumber.value = value;
      void updatePurchaseOrderNumberDebounced(value);
    },
  });

  const isValidDeliveryAddress = computed<boolean>(() => !!shipment.value?.deliveryAddress);
  const isValidBillingAddress = computed<boolean>(
    () =>
      (!allItemsAreDigital.value && !isShippingMethodBopis.value && billingAddressEqualsShipping.value) ||
      !!payment.value?.billingAddress,
  );
  const isValidShipmentMethod = computed<boolean>(() => !!shipment.value?.shipmentMethodCode);
  const isValidPaymentMethod = computed<boolean>(() => !!payment.value?.paymentGatewayCode);
  const isValidShipment = computed<boolean>(() => isValidDeliveryAddress.value && isValidShipmentMethod.value);
  const isValidPayment = computed<boolean>(() => isValidBillingAddress.value && isValidPaymentMethod.value);
  const isValidCheckout = computed<boolean>(() =>
    allItemsAreDigital.value
      ? isValidPayment.value && !hasValidationErrors.value
      : isValidShipment.value && isValidPayment.value && !hasValidationErrors.value,
  );

  const selectedPaymentMethodGroupType = computed<string | undefined>(() => {
    const paymentMethodCode = placedOrder.value?.inPayments[0].paymentMethod?.code ?? payment.value?.paymentGatewayCode;
    return availablePaymentMethods.value.find((item) => item.code === paymentMethodCode)?.paymentMethodGroupType;
  });

  const canPayNow = computed<boolean>(
    () =>
      isAuthenticated.value &&
      !!selectedPaymentMethodGroupType.value &&
      selectedPaymentMethodGroupType.value !== PaymentMethodGroupType[PaymentMethodGroupType.Manual],
  );

  const addresses = computed<AnyAddressType[]>(() => {
    return isCorporateMember.value ? organizationsAddresses.value : personalAddresses.value;
  });

  const isPurchaseOrderNumberEnabled = computed<boolean>(
    () =>
      !!selectedPaymentMethodGroupType.value &&
      selectedPaymentMethodGroupType.value === PaymentMethodGroupType[PaymentMethodGroupType.Manual],
  );

  const allOrderItemsAreDigital = computed(() =>
    placedOrder.value?.items?.every((item) => item.productType === ProductType.Digital),
  );

  function isExistAddress(address: AnyAddressType): boolean {
    return addresses.value.some((item) => isEqualAddresses(item, address));
  }

  async function setPaymentMethod(method: PaymentMethodType): Promise<void> {
    await updatePayment({
      id: payment.value?.id,
      paymentGatewayCode: method.code,
    });
  }

  function initialize() {
    placedOrder.value = null;
    loading.value = true;

    void fetchAddresses();

    analytics("beginCheckout", { ...cart.value!, items: selectedLineItems.value });

    loading.value = false;
  }

  async function updateBillingOrDeliveryAddress(
    addressType: AddressType,
    inputAddress: InputAddressType,
  ): Promise<void> {
    if (
      addressType === AddressType.Billing &&
      (!payment.value?.billingAddress || !isEqualAddresses(payment.value?.billingAddress, inputAddress))
    ) {
      await updatePayment({
        id: payment.value?.id,
        billingAddress: inputAddress,
      });
    } else if (
      addressType === AddressType.Shipping &&
      (!shipment.value?.deliveryAddress || !isEqualAddresses(shipment.value?.deliveryAddress, inputAddress))
    ) {
      await updateShipment({
        id: shipment.value?.id,
        deliveryAddress: inputAddress,
      });
    }
  }

  function openAddOrUpdateAddressModal(
    addressType: AddressType,
    editableAddress?: MemberAddressType | CartAddressType,
  ): void {
    openModal({
      component: AddOrUpdateAddressModal,
      props: {
        address: editableAddress,

        async onResult(address: MemberAddressType) {
          closeModal();

          const inputAddress: InputAddressType = {
            ...omit(address, ["id", "isDefault", "description", "isFavorite"]),
            addressType,
          };

          await updateBillingOrDeliveryAddress(addressType, inputAddress);
        },
      },
    });
  }

  function openSelectAddressModal(addressType: AddressType): void {
    openModal({
      component: SelectAddressModal,

      props: {
        addresses: addresses.value,
        currentAddress:
          addressType === AddressType.Billing ? payment.value?.billingAddress : shipment.value?.deliveryAddress,
        isCorporateAddresses: isCorporateMember.value,

        async onResult(address?: MemberAddressType) {
          if (!address) {
            return;
          }

          const inputAddress: InputAddressType = {
            ...omit(address, ["id", "isDefault", "description", "isFavorite"]),
            addressType,
          };

          await updateBillingOrDeliveryAddress(addressType, inputAddress);
        },

        onAddNewAddress() {
          setTimeout(() => {
            openAddOrUpdateAddressModal(addressType);
          }, 500);
        },
      },
    });
  }

  async function fetchAddresses(): Promise<void> {
    if (!isAuthenticated.value) {
      return;
    }

    if (isCorporateMember.value) {
      await fetchOrganizationAddresses();
    } else {
      await fetchPersonalAddresses();
    }
  }

  function onDeliveryAddressChange(): void {
    addresses.value.length
      ? openSelectAddressModal(AddressType.Shipping)
      : openAddOrUpdateAddressModal(AddressType.Shipping, shipment.value?.deliveryAddress);
  }

  function onBillingAddressChange(): void {
    addresses.value.length
      ? openSelectAddressModal(AddressType.Billing)
      : openAddOrUpdateAddressModal(AddressType.Billing, payment.value?.billingAddress);
  }

  function getNewAddresses(payload: {
    shippingAddress?: CartAddressType;
    billingAddress?: CartAddressType;
  }): MemberAddressType[] {
    const newAddresses: MemberAddressType[] = [];

    if (payload.shippingAddress && !isExistAddress(payload.shippingAddress)) {
      newAddresses.push({
        ...payload.shippingAddress,
        isDefault: false,
        isFavorite: false,
        addressType: AddressType.BillingAndShipping,
      });
    }
    if (
      payload.billingAddress &&
      !isExistAddress(payload.billingAddress) &&
      (!payload.shippingAddress || !isEqualAddresses(payload.shippingAddress, payload.billingAddress))
    ) {
      newAddresses.push({
        ...payload.billingAddress,
        isDefault: false,
        isFavorite: false,
        addressType: AddressType.BillingAndShipping,
      });
    }

    return newAddresses;
  }

  async function saveNewAddresses(payload: {
    shippingAddress?: CartAddressType;
    billingAddress?: CartAddressType;
  }): Promise<void> {
    const newAddresses: MemberAddressType[] = getNewAddresses(payload);

    if (isCorporateMember.value) {
      await addOrUpdateOrganizationAddresses(newAddresses);
    } else {
      await addOrUpdatePersonalAddresses(newAddresses);
    }
  }

  async function prepareOrderData(): Promise<void> {
    // Update payment with required properties
    const filledPayment: InputPaymentType = {
      id: payment.value!.id,
      amount: cart.value!.total.amount, // required
    };

    // Save shipping address as billing address
    if (!allItemsAreDigital.value && !isShippingMethodBopis.value && billingAddressEqualsShipping.value) {
      filledPayment.billingAddress = {
        ...omit(shipment.value!.deliveryAddress, ["id"]),
        addressType: AddressType.Billing,
      };
    }

    await updatePayment(filledPayment);

    // Reset purchase order number if it is unavailable
    if (!isPurchaseOrderNumberEnabled.value && purchaseOrderNumber.value) {
      await updatePurchaseOrderNumber("");
    }

    // Parallel saving of new addresses in account. Before cleaning shopping cart
    if (isAuthenticated.value) {
      void saveNewAddresses({
        shippingAddress:
          !allItemsAreDigital.value && !isShippingMethodBopis.value ? shipment.value!.deliveryAddress : undefined,
        billingAddress: payment.value!.billingAddress,
      });
    }
  }

  async function createOrderFromCart(): Promise<CustomerOrderType | null> {
    loading.value = true;

    await prepareOrderData();

    try {
      // TODO remove as CustomerOrderType. Infer it from API
      placedOrder.value = (await _createOrderFromCart(cart.value!.id)) as CustomerOrderType;
    } catch (e) {
      Logger.error(`${useCheckout.name}.${createOrderFromCart.name}`, e);
    }

    if (placedOrder.value) {
      await refetchCart();

      if (themeContext.value?.storeSettings?.defaultSelectedForCheckout && cart.value?.items.length) {
        selectCartItems(cart.value.items.map((item) => item.id));
      }

      clearState();

      analytics("placeOrder", placedOrder.value);
      void pushHistoricalEvent({
        eventType: "placeOrder",
        sessionId: placedOrder.value.id,
        productIds: placedOrder.value.items?.map((item) => item.productId),
        storeId: globals.storeId,
      });

      await router.replace({ name: canPayNow.value ? "CheckoutPayment" : "CheckoutCompleted" });
    } else {
      notifications.error({
        text: t("common.messages.creating_order_error"),
        duration: 15000,
        single: true,
      });
    }

    loading.value = false;

    return placedOrder.value;
  }

  function clearState() {
    clearGlobalCheckoutState();
  }

  return {
    deliveryAddress,
    shipmentMethod,
    billingAddress,
    paymentMethod,
    comment,
    billingAddressEqualsShipping,
    purchaseOrderNumber,
    isValidDeliveryAddress,
    isValidBillingAddress,
    isValidShipmentMethod,
    isValidPaymentMethod,
    isValidShipment,
    isValidPayment,
    isValidCheckout,
    isPurchaseOrderNumberEnabled,
    selectedPaymentMethodGroupType,
    canPayNow,
    initialize,
    onDeliveryAddressChange,
    onBillingAddressChange,
    setPaymentMethod,
    createOrderFromCart,
    loading: readonly(loading),
    changing: computed(() => commentChanging.value || purchaseOrderNumberChanging.value),
    placedOrder: computed(() => placedOrder.value),
    allOrderItemsAreDigital,
  };
}

export const useCheckout = createSharedComposable(_useCheckout);
