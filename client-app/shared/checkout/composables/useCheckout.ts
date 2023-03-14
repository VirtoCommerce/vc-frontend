import { omit } from "lodash";
import { computed, readonly, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { AddressType, Logger, useGoogleAnalytics } from "@/core";
import { useUser, useUserAddresses, useUserCheckoutDefaults } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { AddOrUpdateAddressModal, SelectAddressModal } from "@/shared/checkout";
import { useOrganizationAddresses } from "@/shared/company";
import { useNotifications } from "@/shared/notification";
import { PaymentMethodGroupType } from "@/shared/payment";
import { usePopup } from "@/shared/popup";
import {
  CartAddressType,
  createOrderFromCart as _createOrderFromCart,
  CustomerOrderType,
  InputAddressType,
  InputPaymentType,
  MemberAddressType,
  PaymentMethodType,
  removeCart,
  ShippingMethodType,
} from "@/xapi";

const loading = ref(false);
const comment = ref("");
const billingAddressEqualsShipping = ref(true);
const placedOrder = shallowRef<CustomerOrderType | null>(null);
const addresses = shallowRef<MemberAddressType[]>([]);

export default function useCheckout() {
  const ga = useGoogleAnalytics();
  const notifications = useNotifications();
  const { openPopup, closePopup } = usePopup();
  const { t } = useI18n();
  const { user, isAuthenticated } = useUser();
  const { getUserCheckoutDefaults } = useUserCheckoutDefaults();
  const {
    addresses: personalAddresses,
    fetchAddresses: fetchPersonalAddresses,
    isExistAddress: isExistPersonalAddress,
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
    fetchCart,
    updateShipment,
    updatePayment,
    changeComment,
  } = useCart();

  const isValidDeliveryAddress = computed<boolean>(() => !!shipment.value?.deliveryAddress);
  const isValidBillingAddress = computed<boolean>(
    () => billingAddressEqualsShipping.value || !!payment.value?.billingAddress
  );
  const isValidShipmentMethod = computed<boolean>(() => !!shipment.value?.shipmentMethodCode);
  const isValidPaymentMethod = computed<boolean>(() => !!payment.value?.paymentGatewayCode);
  const isValidShipment = computed<boolean>(() => isValidDeliveryAddress.value && isValidShipmentMethod.value);
  const isValidPayment = computed<boolean>(() => isValidBillingAddress.value && isValidPaymentMethod.value);
  const isValidCheckout = computed<boolean>(
    () => isValidShipment.value && isValidPayment.value && !hasValidationErrors.value
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

    if (
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
      component: AddOrUpdateAddressModal,
      props: {
        address: editableAddress,

        async onResult(address: MemberAddressType) {
          closePopup();

          const inputAddress: InputAddressType = {
            ...omit(address, ["isDefault", "description"]),
            addressType,
          };

          await updateBillingOrDeliveryAddress(addressType, inputAddress);

          if (user.value.contact?.organizationId) {
            await addOrUpdateOrganizationAddresses([address]);
          } else {
            await addOrUpdatePersonalAddresses([address]);
          }
        },
      },
    });
  }

  function openSelectAddressModal(addressType: AddressType): void {
    openPopup({
      component: SelectAddressModal,

      props: {
        addresses: user.value.contact!.organizationId ? organizationsAddresses.value : addresses.value,
        currentAddress:
          addressType === AddressType.Billing ? payment.value?.billingAddress : shipment.value?.deliveryAddress,

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
    if (isAuthenticated.value) {
      if (user.value.contact!.organizationId) {
        await fetchOrganizationAddresses();
        addresses.value = organizationsAddresses.value;
      } else {
        await fetchPersonalAddresses();
        addresses.value = personalAddresses.value;
      }
    }
  }

  async function onDeliveryAddressChange() {
    await fetchAddresses();

    addresses.value.length
      ? openSelectAddressModal(AddressType.Shipping)
      : openAddOrUpdateAddressModal(AddressType.Shipping, shipment.value?.deliveryAddress);
  }

  async function onBillingAddressChange() {
    await fetchAddresses();

    addresses.value.length
      ? openSelectAddressModal(AddressType.Billing)
      : openAddOrUpdateAddressModal(AddressType.Billing, payment.value?.billingAddress);
  }

  async function saveNewAddressesInAccount(payload: {
    shipmentAddress?: CartAddressType;
    billingAddress?: CartAddressType;
  }) {
    const { shipmentAddress, billingAddress } = payload;
    const newAddresses: MemberAddressType[] = [];

    if (shipmentAddress && !isExistPersonalAddress(shipmentAddress)) {
      newAddresses.push({
        ...shipmentAddress,
        isDefault: false,
        addressType: AddressType.BillingAndShipping,
      });
    }

    if (billingAddress && !billingAddressEqualsShipping.value && !isExistPersonalAddress(billingAddress)) {
      newAddresses.push({
        ...billingAddress,
        isDefault: false,
        addressType: AddressType.BillingAndShipping,
      });
    }

    await addOrUpdatePersonalAddresses(newAddresses);
  }

  async function prepareOrderData() {
    // Update payment with required properties
    const filledPayment: InputPaymentType = {
      id: payment.value!.id,
      amount: cart.value.total!.amount, // required
    };

    // Save shipping address as billing address
    if (billingAddressEqualsShipping.value) {
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

    // Parallel saving of new addresses in account. Before cleaning shopping cart
    if (isAuthenticated.value) {
      saveNewAddressesInAccount({
        shipmentAddress: shipment.value!.deliveryAddress,
        billingAddress: payment.value!.billingAddress,
      });
    }
  }

  function resetVariables() {
    comment.value = "";
    billingAddressEqualsShipping.value = true;
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
    isValidDeliveryAddress,
    isValidBillingAddress,
    isValidShipmentMethod,
    isValidPaymentMethod,
    isValidShipment,
    isValidPayment,
    isValidCheckout,
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
  };
}
