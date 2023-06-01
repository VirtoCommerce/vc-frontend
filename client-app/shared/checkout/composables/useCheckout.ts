import { omit } from "lodash";
import { computed, readonly, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useGoogleAnalytics } from "@/core/composables";
import { AddressType, ProductType } from "@/core/enums";
import { isEqualAddresses, Logger } from "@/core/utilities";
import { useUser, useUserAddresses, useUserCheckoutDefaults } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { useOrganizationAddresses } from "@/shared/company";
import { useNotifications } from "@/shared/notification";
import { PaymentMethodGroupType } from "@/shared/payment";
import { usePopup } from "@/shared/popup";
import { VcAddOrUpdateAddressModal } from "@/ui-kit/components";
import { createOrderFromCart as _createOrderFromCart, removeCart } from "@/xapi";
import { SelectAddressModal } from "../components";
import type { AnyAddressType } from "@/core/types";
import type {
  CartAddressType,
  CustomerOrderType,
  InputAddressType,
  InputPaymentType,
  MemberAddressType,
  PaymentMethodType,
  ShippingMethodType,
} from "@/xapi/types";

const loading = ref(false);
const comment = ref("");
const billingAddressEqualsShipping = ref(true);
const purchaseOrderNumber = ref("");
const placedOrder = shallowRef<CustomerOrderType | null>(null);

export default function useCheckout() {
  const ga = useGoogleAnalytics();
  const notifications = useNotifications();
  const { openPopup, closePopup } = usePopup();
  const { t } = useI18n();
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
    shipment,
    payment,
    availableShippingMethods,
    availablePaymentMethods,
    hasValidationErrors,
    allItemsAreDigital,
    fetchCart,
    updateShipment,
    removeShipment,
    updatePayment,
    changeComment,
    updatePurchaseOrderNumber,
  } = useCart();

  const isValidDeliveryAddress = computed<boolean>(() => !!shipment.value?.deliveryAddress);
  const isValidBillingAddress = computed<boolean>(
    () => (!allItemsAreDigital.value && billingAddressEqualsShipping.value) || !!payment.value?.billingAddress
  );
  const isValidShipmentMethod = computed<boolean>(() => !!shipment.value?.shipmentMethodCode);
  const isValidPaymentMethod = computed<boolean>(() => !!payment.value?.paymentGatewayCode);
  const isValidShipment = computed<boolean>(() => isValidDeliveryAddress.value && isValidShipmentMethod.value);
  const isValidPayment = computed<boolean>(() => isValidBillingAddress.value && isValidPaymentMethod.value);
  const isValidCheckout = computed<boolean>(() =>
    allItemsAreDigital.value
      ? isValidPayment.value && !hasValidationErrors.value
      : isValidShipment.value && isValidPayment.value && !hasValidationErrors.value
  );

  const selectedPaymentMethodGroupType = computed<string | undefined>(() => {
    const paymentMethodCode = payment.value?.paymentGatewayCode || placedOrder.value?.inPayments[0].paymentMethod?.code;
    return availablePaymentMethods.value.find((item) => item.code === paymentMethodCode)?.paymentMethodGroupType;
  });

  const canPayNow = computed<boolean>(
    () =>
      isAuthenticated.value &&
      !!selectedPaymentMethodGroupType.value &&
      selectedPaymentMethodGroupType.value !== PaymentMethodGroupType[PaymentMethodGroupType.Manual]
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
      selectedPaymentMethodGroupType.value === PaymentMethodGroupType[PaymentMethodGroupType.Manual]
  );

  const allOrderItemsAreDigital = computed<boolean>(
    () => !!placedOrder.value?.items?.every((item) => item.productType === ProductType.Digital)
  );

  function isExistAddress(address: AnyAddressType): boolean {
    return addresses.value.some((item) => isEqualAddresses(item, address));
  }

  async function setShippingMethod(method: ShippingMethodType, options: { reloadCart?: boolean } = {}) {
    await updateShipment(
      {
        id: shipment.value?.id,
        price: method.price?.amount,
        shipmentMethodCode: method.code,
        shipmentMethodOption: method.optionName,
      },
      options.reloadCart
    );

    ga.addShippingInfo(cart.value, {}, method.optionName);
  }

  async function setPaymentMethod(method: PaymentMethodType, options: { reloadCart?: boolean } = {}) {
    await updatePayment(
      {
        id: payment.value?.id,
        paymentGatewayCode: method.code,
      },
      options.reloadCart
    );

    ga.addPaymentInfo(cart.value, {}, method.code);
  }

  async function setCheckoutDefaults() {
    const { shippingMethodId, paymentMethodCode } = getUserCheckoutDefaults();
    const defaultShippingMethod = availableShippingMethods.value.find((item) => item.id === shippingMethodId);
    const defaultPaymentMethod = availablePaymentMethods.value.find((item) => item.code === paymentMethodCode);
    let reloadCart = false;

    if (allItemsAreDigital.value && shipment.value) {
      await removeShipment(shipment.value.id!, false);
      reloadCart = true;
    }

    if (
      !allItemsAreDigital.value &&
      !shipment.value?.shipmentMethodCode &&
      !shipment.value?.shipmentMethodOption &&
      shippingMethodId &&
      defaultShippingMethod
    ) {
      await setShippingMethod(defaultShippingMethod, { reloadCart: false });
      reloadCart = true;
    }

    if (!payment.value?.paymentGatewayCode && paymentMethodCode && defaultPaymentMethod) {
      await setPaymentMethod(defaultPaymentMethod, { reloadCart: false });
      reloadCart = true;
    }

    if (reloadCart) {
      await fetchCart();
    }
  }

  async function initialize(): Promise<void> {
    placedOrder.value = null;
    loading.value = true;

    await fetchCart();
    await setCheckoutDefaults();

    fetchAddresses();

    ga.beginCheckout(cart.value);

    loading.value = false;
  }

  async function updateBillingOrDeliveryAddress(addressType: AddressType, inputAddress: InputAddressType) {
    if (addressType === AddressType.Billing) {
      await updatePayment({
        id: payment.value?.id,
        billingAddress: inputAddress,
      });
    } else {
      await updateShipment({
        id: shipment.value?.id,
        deliveryAddress: inputAddress,
      });
    }
  }

  function openAddOrUpdateAddressModal(
    addressType: AddressType,
    editableAddress?: MemberAddressType | CartAddressType
  ) {
    openPopup({
      component: VcAddOrUpdateAddressModal,
      props: {
        address: editableAddress,

        async onResult(address: MemberAddressType) {
          closePopup();

          const inputAddress: InputAddressType = {
            ...omit(address, ["isDefault", "description"]),
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
            ...omit(address, ["isDefault", "description"]),
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

  async function onDeliveryAddressChange() {
    addresses.value.length
      ? openSelectAddressModal(AddressType.Shipping)
      : openAddOrUpdateAddressModal(AddressType.Shipping, shipment.value?.deliveryAddress);
  }

  async function onBillingAddressChange() {
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

    if (billingAddress && !billingAddressEqualsShipping.value && !isExistAddress(billingAddress)) {
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

  async function prepareOrderData() {
    // Update payment with required properties
    const filledPayment: InputPaymentType = {
      id: payment.value!.id,
      amount: cart.value.total!.amount, // required
    };

    // Save shipping address as billing address
    if (!allItemsAreDigital.value && billingAddressEqualsShipping.value) {
      filledPayment.billingAddress = {
        ...shipment.value!.deliveryAddress,
        addressType: AddressType.Billing,
      };
    }

    await updatePayment(filledPayment);

    /**
     * Send a Google Analytics event about adding payment information.
     */
    ga.addPaymentInfo(cart.value);

    // Save order comment
    if (comment.value) {
      await changeComment(comment.value, false);
    }

    // Save purchase order number
    if (purchaseOrderNumber.value) {
      await updatePurchaseOrderNumber(purchaseOrderNumber.value);
    }

    // Parallel saving of new addresses in account. Before cleaning shopping cart
    if (isAuthenticated.value) {
      saveNewAddresses({
        shippingAddress: !allItemsAreDigital.value ? shipment.value!.deliveryAddress : undefined,
        billingAddress: payment.value!.billingAddress,
      });
    }
  }

  function resetVariables() {
    comment.value = "";
    billingAddressEqualsShipping.value = true;
    purchaseOrderNumber.value = "";
  }

  async function createOrderFromCart(): Promise<CustomerOrderType | null> {
    const cartId = cart.value.id!;

    loading.value = true;

    await prepareOrderData();

    try {
      placedOrder.value = await _createOrderFromCart(cartId);
    } catch (e) {
      Logger.error(`${useCheckout.name}.${createOrderFromCart.name}`, e);
    }

    if (placedOrder.value) {
      await removeCart(cartId);
      resetVariables();
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
