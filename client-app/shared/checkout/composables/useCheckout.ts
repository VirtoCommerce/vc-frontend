import { omit } from "lodash";
import { computed, readonly, ref } from "vue";
import { useI18n } from "vue-i18n";
import { AddressType, Logger, useGoogleAnalytics } from "@/core";
import { useUser, useUserAddresses, useUserCheckoutDefaults, useUserOrder } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { AddOrUpdateAddressModal, SelectAddressModal } from "@/shared/checkout";
import { useNotifications } from "@/shared/notification";
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
const orderCreated = ref(false);

export default function useCheckout() {
  const ga = useGoogleAnalytics();
  const notifications = useNotifications();
  const { openPopup, closePopup } = usePopup();
  const { t } = useI18n();
  const { isAuthenticated } = useUser();
  const { getUserCheckoutDefaults } = useUserCheckoutDefaults();
  const { addresses, fetchAddresses, isExistAddress, addOrUpdateAddresses } = useUserAddresses();
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
  const { clearOrder } = useUserOrder();

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

    clearOrder();
    orderCreated.value = false;
  }

  async function initialize(): Promise<void> {
    loading.value = true;
    await fetchCart();

    if (isAuthenticated.value) {
      // TODO: Remove. Addresses should be queried when the address selection modal opens.
      fetchAddresses();
    }

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

  function onDeliveryAddressChange() {
    addresses.value.length
      ? openSelectAddressModal(AddressType.Shipping)
      : openAddOrUpdateAddressModal(AddressType.Shipping, shipment.value?.deliveryAddress);
  }

  function onBillingAddressChange() {
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

    if (shipmentAddress && !isExistAddress(shipmentAddress)) {
      newAddresses.push({
        ...shipmentAddress,
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

    await addOrUpdateAddresses(newAddresses);
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
    let order: CustomerOrderType | null = null;

    loading.value = true;

    await prepareOrderData();

    try {
      order = await _createOrderFromCart(cartId);
    } catch (e) {
      Logger.error(`${useCheckout.name}.${createOrderFromCart.name}`, e);
    }

    if (order) {
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

    return order;
  }

  return {
    comment,
    billingAddressEqualsShipping,
    shipment,
    payment,
    isValidDeliveryAddress,
    isValidBillingAddress,
    isValidShipmentMethod,
    isValidPaymentMethod,
    isValidShipment,
    isValidPayment,
    isValidCheckout,
    orderCreated,
    initialize,
    onDeliveryAddressChange,
    onBillingAddressChange,
    setShippingMethod,
    setPaymentMethod,
    createOrderFromCart,
    loading: readonly(loading),
  };
}
