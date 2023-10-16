import { useDebounceFn } from "@vueuse/core";
import { omit } from "lodash";
import { computed, readonly, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { createOrderFromCart as _createOrderFromCart } from "@/core/api/graphql";
import { useGoogleAnalytics } from "@/core/composables";
import { AddressType, ProductType } from "@/core/enums";
import { isEqualAddresses, Logger } from "@/core/utilities";
import { useUser, useUserAddresses, useUserCheckoutDefaults } from "@/shared/account";
import { cartReloadEvent, useBroadcast } from "@/shared/broadcast";
import { useCart, DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart";
import { useOrganizationAddresses } from "@/shared/company";
import { useNotifications } from "@/shared/notification";
import { PaymentMethodGroupType } from "@/shared/payment";
import { usePopup } from "@/shared/popup";
import { SelectAddressModal } from "../components";
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

const loading = ref(false);
const billingAddressEqualsShipping = ref(true);
const placedOrder = shallowRef<CustomerOrderType | null>(null);

const _comment = ref<string>();
const _purchaseOrderNumber = ref<string>();

export function useCheckout() {
  const broadcast = useBroadcast();
  const ga = useGoogleAnalytics();
  const { t } = useI18n();
  const notifications = useNotifications();
  const { openPopup, closePopup } = usePopup();
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
    cart,
    selectedItemIds,
    shipment,
    payment,
    availableShippingMethods,
    availablePaymentMethods,
    hasValidationErrors,
    allItemsAreDigital,
    fetchFullCart,
    updateShipment,
    removeShipment,
    updatePayment,
    changeComment,
    updatePurchaseOrderNumber,
  } = useCart();

  const changeCommentDebounced = useDebounceFn(async (value: string) => {
    if (cart.value?.comment !== value) {
      await changeComment(value);
    }
    _comment.value = undefined;
  }, DEFAULT_DEBOUNCE_IN_MS);

  const updatePurchaseOrderNumberDebounced = useDebounceFn(async (value: string) => {
    if (cart.value?.purchaseOrderNumber !== value) {
      await updatePurchaseOrderNumber(value);
    }
    _purchaseOrderNumber.value = undefined;
  }, DEFAULT_DEBOUNCE_IN_MS);

  const comment = computed({
    get: () => _comment.value ?? cart.value?.comment ?? "",
    set: async (value: string) => {
      _comment.value = value;
      await changeCommentDebounced(value);
    },
  });

  const purchaseOrderNumber = computed({
    get: () => _purchaseOrderNumber.value ?? cart.value?.purchaseOrderNumber ?? "",
    set: async (value: string) => {
      _purchaseOrderNumber.value = value;
      await updatePurchaseOrderNumberDebounced(value);
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
    const paymentMethodCode = payment.value?.paymentGatewayCode || placedOrder.value?.inPayments[0].paymentMethod?.code;
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

  const allOrderItemsAreDigital = computed<boolean>(
    () => !!placedOrder.value?.items?.every((item) => item.productType === ProductType.Digital),
  );

  function isExistAddress(address: AnyAddressType): boolean {
    return addresses.value.some((item) => isEqualAddresses(item, address));
  }

  async function setShippingMethod(method: ShippingMethodType, options = { withBroadcast: true }): Promise<void> {
    await updateShipment(
      {
        id: shipment.value?.id,
        price: method.price?.amount,
        shipmentMethodCode: method.code,
        shipmentMethodOption: method.optionName,
      },
      options,
    );

    ga.addShippingInfo(cart.value!, {}, method.optionName);
  }

  async function setPaymentMethod(method: PaymentMethodType, options = { withBroadcast: true }): Promise<void> {
    await updatePayment(
      {
        id: payment.value?.id,
        paymentGatewayCode: method.code,
      },
      options,
    );

    ga.addPaymentInfo(cart.value!, {}, method.code);
  }

  async function setCheckoutDefaults(): Promise<void> {
    const { shippingMethodId, paymentMethodCode } = getUserCheckoutDefaults();
    const defaultShippingMethod = availableShippingMethods.value.find((item) => item.id === shippingMethodId);
    const defaultPaymentMethod = availablePaymentMethods.value.find((item) => item.code === paymentMethodCode);

    let cartReloadBroadcast = false;

    if (allItemsAreDigital.value && shipment.value) {
      await removeShipment(shipment.value.id!);
      cartReloadBroadcast = true;
    }

    if (
      !allItemsAreDigital.value &&
      !shipment.value?.shipmentMethodCode &&
      !shipment.value?.shipmentMethodOption &&
      shippingMethodId &&
      defaultShippingMethod
    ) {
      await setShippingMethod(defaultShippingMethod, { withBroadcast: false });
      cartReloadBroadcast = true;
    }

    if (!payment.value?.paymentGatewayCode && paymentMethodCode && defaultPaymentMethod) {
      await setPaymentMethod(defaultPaymentMethod, { withBroadcast: false });
      cartReloadBroadcast = true;
    }

    if (cartReloadBroadcast) {
      broadcast.emit(cartReloadEvent);
    }
  }

  async function initialize(): Promise<void> {
    placedOrder.value = null;
    loading.value = true;

    await fetchFullCart();
    await setCheckoutDefaults();

    fetchAddresses();

    ga.beginCheckout(cart.value!);

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
      await updatePayment(
        {
          id: payment.value?.id,
          billingAddress: inputAddress,
        },
        { withBroadcast: true },
      );
    } else if (
      addressType === AddressType.Shipping &&
      (!shipment.value?.deliveryAddress || !isEqualAddresses(shipment.value?.deliveryAddress, inputAddress))
    ) {
      await updateShipment(
        {
          id: shipment.value?.id,
          deliveryAddress: inputAddress,
        },
        { withBroadcast: true },
      );
    }
  }

  function openAddOrUpdateAddressModal(
    addressType: AddressType,
    editableAddress?: MemberAddressType | CartAddressType,
  ): void {
    openPopup({
      component: AddOrUpdateAddressModal,
      props: {
        address: editableAddress,

        async onResult(address: MemberAddressType) {
          closePopup();

          const inputAddress: InputAddressType = {
            ...omit(address, ["id", "isDefault", "description"]),
            addressType,
          };

          await updateBillingOrDeliveryAddress(addressType, inputAddress);
        },
      },
    });
  }

  function openSelectAddressModal(addressType: AddressType): void {
    openPopup({
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
            ...omit(address, ["id", "isDefault", "description"]),
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
    const { shippingAddress, billingAddress } = payload;
    const newAddresses: MemberAddressType[] = [];

    if (shippingAddress && !isExistAddress(shippingAddress)) {
      newAddresses.push({
        ...shippingAddress,
        isDefault: false,
        addressType: AddressType.BillingAndShipping,
      });
    }
    if (
      billingAddress &&
      !isExistAddress(billingAddress) &&
      (!shippingAddress || !isEqualAddresses(shippingAddress, billingAddress))
    ) {
      newAddresses.push({
        ...billingAddress,
        isDefault: false,
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
      amount: cart.value!.total!.amount, // required
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
      saveNewAddresses({
        shippingAddress: !allItemsAreDigital.value ? shipment.value!.deliveryAddress : undefined,
        billingAddress: payment.value!.billingAddress,
      });
    }
  }

  async function createOrderFromCart(): Promise<CustomerOrderType | null> {
    loading.value = true;

    await prepareOrderData();

    try {
      placedOrder.value = await _createOrderFromCart(cart.value!.id!);
    } catch (e) {
      Logger.error(`${useCheckout.name}.${createOrderFromCart.name}`, e);
    }

    if (placedOrder.value) {
      await fetchFullCart();

      selectedItemIds.value = cart.value!.items!.map((item) => item.id);

      ga.placeOrder(placedOrder.value);

      await router.replace({ name: canPayNow.value ? "CheckoutPayment" : "CheckoutCompleted" });
    } else {
      notifications.error({
        text: t("common.messages.creating_order_error"),
        duration: 15000,
        single: true,
      });
    }

    broadcast.emit(cartReloadEvent);

    loading.value = false;

    return placedOrder.value;
  }

  return {
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
    loading: readonly(loading),
    placedOrder: computed(() => placedOrder.value),
    allItemsAreDigital: readonly(allOrderItemsAreDigital),
  };
}
