import { createGlobalState, createSharedComposable, syncRefs, useDebounceFn } from "@vueuse/core";
import { omit } from "lodash";
import { computed, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { createOrderFromCart as _createOrderFromCart } from "@/core/api/graphql";
import { useBroadcastLoading, useGoogleAnalytics } from "@/core/composables";
import { AddressType, ProductType } from "@/core/enums";
import { isEqualAddresses, Logger } from "@/core/utilities";
import { useUser, useUserAddresses, useUserCheckoutDefaults } from "@/shared/account";
import { useFullCart, EXTENDED_DEBOUNCE_IN_MS } from "@/shared/cart";
import { useOrganizationAddresses } from "@/shared/company";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import { PaymentMethodGroupType } from "@/shared/payment";
import type {
  CartAddressType,
  CustomerOrderType,
  InputAddressType,
  InputPaymentType,
  MemberAddressType,
  PaymentMethodType,
  ShippingMethodType,
} from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";
import SelectAddressModal from "@/shared/checkout/components/select-address-modal.vue";

const useGlobalCheckout = createGlobalState(() => {
  const localLoading = ref(false);
  const { loading: otherLoading } = useBroadcastLoading("checkout");
  syncRefs(localLoading, otherLoading);

  const billingAddressEqualsShipping = ref(true);
  const placedOrder = shallowRef<CustomerOrderType | null>(null);

  const commentChanging = ref(false);
  const _comment = ref<string>();

  const purchaseOrderNumberChanging = ref(false);
  const _purchaseOrderNumber = ref<string>();

  return {
    localLoading,
    otherLoading,
    billingAddressEqualsShipping,
    placedOrder,
    commentChanging,
    _comment,
    purchaseOrderNumberChanging,
    _purchaseOrderNumber,
  };
});

export function _useCheckout() {
  const ga = useGoogleAnalytics();
  const { t } = useI18n();
  const notifications = useNotifications();
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const { user, isAuthenticated, isCorporateMember } = useUser();
  const { getUserCheckoutDefaults } = useUserCheckoutDefaults();
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
    selectedItemIds,
    shipment,
    payment,
    availableShippingMethods,
    availablePaymentMethods,
    hasValidationErrors,
    allItemsAreDigital,
    updateShipment,
    removeShipment,
    updatePayment,
    changeComment,
    updatePurchaseOrderNumber,
  } = useFullCart();
  const {
    localLoading,
    otherLoading,
    billingAddressEqualsShipping,
    placedOrder,
    commentChanging,
    _comment,
    purchaseOrderNumberChanging,
    _purchaseOrderNumber,
  } = useGlobalCheckout();

  const deliveryAddress = computed(() => shipment.value?.deliveryAddress);
  const billingAddress = computed(() =>
    !allItemsAreDigital.value && billingAddressEqualsShipping.value && deliveryAddress.value
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
      void changeCommentDebounced(value);
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
    () => (!allItemsAreDigital.value && billingAddressEqualsShipping.value) || !!payment.value?.billingAddress,
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
    const { firstName, lastName } = user.value.contact ?? {};

    return isCorporateMember.value
      ? organizationsAddresses.value.map((address) => ({ ...address, firstName, lastName }))
      : personalAddresses.value;
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

  async function setShippingMethod(method: ShippingMethodType): Promise<void> {
    await updateShipment({
      id: shipment.value?.id,
      price: method.price?.amount,
      shipmentMethodCode: method.code,
      shipmentMethodOption: method.optionName,
    });

    ga.addShippingInfo(cart.value!, {}, method.optionName);
  }

  async function setPaymentMethod(method: PaymentMethodType): Promise<void> {
    await updatePayment({
      id: payment.value?.id,
      paymentGatewayCode: method.code,
    });

    ga.addPaymentInfo(cart.value!, {}, method.code);
  }

  // watch(allItemsAreDigital, async (_, previousValue) => {
  //   // Update defaults if state changed not on initialization
  //   if (previousValue !== undefined) {
  //     await setCheckoutDefaults();
  //   }
  // });

  async function setCheckoutDefaults(): Promise<void> {
    const { shippingMethodId, paymentMethodCode } = getUserCheckoutDefaults();
    const defaultShippingMethod = availableShippingMethods.value.find((item) => item.id === shippingMethodId);
    const defaultPaymentMethod = availablePaymentMethods.value.find((item) => item.code === paymentMethodCode);

    if (allItemsAreDigital.value && shipment.value) {
      await removeShipment(shipment.value.id);
    }

    // Create at initialization to prevent duplication due to lack of id

    if (!allItemsAreDigital.value && !shipment.value?.shipmentMethodCode && !shipment.value?.shipmentMethodOption) {
      if (shippingMethodId && defaultShippingMethod) {
        await setShippingMethod(defaultShippingMethod);
      } else if (!shipment.value) {
        await updateShipment({});
      }
    }

    if (!payment.value?.paymentGatewayCode) {
      if (paymentMethodCode && defaultPaymentMethod) {
        await setPaymentMethod(defaultPaymentMethod);
      } else if (!payment.value) {
        await updatePayment({});
      }
    }
  }

  async function initialize(): Promise<void> {
    placedOrder.value = null;
    localLoading.value = true;

    if (!otherLoading.value) {
      await setCheckoutDefaults();

      void fetchAddresses();

      ga.beginCheckout(cart.value!);
    }

    localLoading.value = false;
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
    if (!allItemsAreDigital.value && billingAddressEqualsShipping.value) {
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

    /**
     * Send a Google Analytics event about adding payment information.
     */
    ga.addPaymentInfo(cart.value!);

    // Parallel saving of new addresses in account. Before cleaning shopping cart
    if (isAuthenticated.value) {
      void saveNewAddresses({
        shippingAddress: !allItemsAreDigital.value ? shipment.value!.deliveryAddress : undefined,
        billingAddress: payment.value!.billingAddress,
      });
    }
  }

  async function createOrderFromCart(): Promise<CustomerOrderType | null> {
    localLoading.value = true;

    await prepareOrderData();

    try {
      placedOrder.value = await _createOrderFromCart(cart.value!.id);
    } catch (e) {
      Logger.error(`${useCheckout.name}.${createOrderFromCart.name}`, e);
    }

    if (placedOrder.value) {
      await refetchCart();

      selectedItemIds.value = cart.value!.items.map((item) => item.id);

      ga.placeOrder(placedOrder.value);

      await router.replace({ name: canPayNow.value ? "CheckoutPayment" : "CheckoutCompleted" });
    } else {
      notifications.error({
        text: t("common.messages.creating_order_error"),
        duration: 15000,
        single: true,
      });
    }

    localLoading.value = false;

    return placedOrder.value;
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
    setShippingMethod,
    setPaymentMethod,
    createOrderFromCart,
    loading: computed(() => otherLoading.value || localLoading.value),
    changing: computed(() => commentChanging.value || purchaseOrderNumberChanging.value),
    placedOrder: computed(() => placedOrder.value),
    allOrderItemsAreDigital,
  };
}

export const useCheckout = createSharedComposable(_useCheckout);
