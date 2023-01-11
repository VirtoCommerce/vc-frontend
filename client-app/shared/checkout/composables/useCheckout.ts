import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { omit } from "lodash";
import {
  CartAddressType,
  CustomerOrderType,
  InputAddressType,
  InputPaymentType,
  MemberAddressType,
  PaymentMethodType,
  PaymentType,
  ShipmentType,
  ShippingMethodType,
} from "@/xapi";
import { useCart } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import {
  AddOrUpdateAddressModal,
  SelectPaymentMethodModal,
  SelectShippingMethodModal,
  SelectAddressModal,
} from "@/shared/checkout";
import { AddressType, useGoogleAnalytics } from "@/core";
import { useUser, useUserAddresses, useUserCheckoutDefaults } from "@/shared/account";
import { computedEager } from "@vueuse/core";
import { useNotifications } from "@/shared/notification";

export default function useCheckout() {
  const { t } = useI18n();
  const { user, isAuthenticated } = useUser();
  const { addresses, fetchAddresses, isExistAddress, addOrUpdateAddresses } = useUserAddresses({ user });
  const {
    cart,
    fetchCart,
    updateShipment,
    updatePayment,
    updatePurchaseOrderNumber,
    changeComment,
    createOrderFromCart,
  } = useCart();
  const { getUserCheckoutDefaults } = useUserCheckoutDefaults();
  const { openPopup, closePopup } = usePopup();
  const notifications = useNotifications();
  const ga = useGoogleAnalytics();

  const billingAddressEqualsShippingAddress = ref(true);
  const purchaseOrderNumber = ref("");
  const comment = ref("");
  const creatingOrder = ref(false);

  const purchaseOrderNumberApplied = computedEager<boolean>(() => !!cart.value.purchaseOrderNumber);

  const shipment = computed<ShipmentType | undefined>(() => cart.value.shipments?.[0]);
  const payment = computed<PaymentType | undefined>(() => cart.value.payments?.[0]);

  const availableShippingMethods = computed<ShippingMethodType[]>(() => cart.value.availableShippingMethods ?? []);
  const availablePaymentMethods = computed<PaymentMethodType[]>(() => cart.value.availablePaymentMethods ?? []);

  const isValidShipment = computed(() => shipment.value?.shipmentMethodCode && shipment.value?.deliveryAddress);
  const isValidPayment = computed(
    () =>
      payment.value?.paymentGatewayCode && (billingAddressEqualsShippingAddress.value || payment.value?.billingAddress)
  );
  const isValidCheckout = computed(
    () => !cart.value.validationErrors?.length && isValidShipment.value && isValidPayment.value
  );

  async function initCheckout(): Promise<void> {
    await fetchCart();

    // TODO: Add ga.beginCheckout

    if (isAuthenticated.value) {
      fetchAddresses();
    }

    purchaseOrderNumber.value = cart.value.purchaseOrderNumber ?? "";
    comment.value = cart.value.comment ?? "";

    // Set checkout defaults
    const { shippingMethodId, paymentMethodCode } = getUserCheckoutDefaults() ?? {};
    const defaultShippingMethod = availableShippingMethods.value.find(
      (item: ShippingMethodType) => item.id === shippingMethodId
    );
    const defaultPaymentMethod = availablePaymentMethods.value.find(
      (item: PaymentMethodType) => item.code === paymentMethodCode
    );
    let reloadCart = false;

    if (
      !shipment.value?.shipmentMethodCode &&
      !shipment.value?.shipmentMethodOption &&
      shippingMethodId &&
      defaultShippingMethod
    ) {
      await updateShipment(
        {
          id: shipment.value?.id,
          price: defaultShippingMethod.price?.amount,
          shipmentMethodCode: defaultShippingMethod.code,
          shipmentMethodOption: defaultShippingMethod.optionName,
        },
        false
      );
      reloadCart = true;
    }

    if (!payment.value?.paymentGatewayCode && paymentMethodCode && defaultPaymentMethod) {
      await updatePayment(
        {
          id: payment.value?.id,
          paymentGatewayCode: defaultPaymentMethod.code,
        },
        false
      );
      reloadCart = true;
    }

    if (reloadCart) {
      await fetchCart();
    }
  }

  function openSelectShipmentMethodModal(): void {
    openPopup({
      component: SelectShippingMethodModal,
      props: {
        currentMethodCode: shipment.value?.shipmentMethodCode,
        currentMethodOption: shipment.value?.shipmentMethodOption,
        availableMethods: availableShippingMethods.value,
        async onResult(method: ShippingMethodType) {
          await updateShipment({
            id: shipment.value?.id,
            price: method.price?.amount,
            shipmentMethodCode: method.code,
            shipmentMethodOption: method.optionName,
          });

          ga.addShippingInfo(cart.value);
        },
      },
    });
  }

  function openSelectPaymentMethodModal(): void {
    openPopup({
      component: SelectPaymentMethodModal,
      props: {
        currentMethodCode: payment.value?.paymentGatewayCode,
        availableMethods: availablePaymentMethods.value,
        async onResult(method: PaymentMethodType) {
          await updatePayment({
            id: payment.value?.id,
            paymentGatewayCode: method.code,
          });
        },
      },
    });
  }

  async function updateBillingOrDeliveryAddress(
    addressType: AddressType.Billing | AddressType.Shipping,
    inputAddress: InputAddressType
  ) {
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
    addressType: AddressType.Billing | AddressType.Shipping,
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

  function openSelectAddressModal(addressType: AddressType.Billing | AddressType.Shipping): void {
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

  async function setPurchaseOrderNumber() {
    await updatePurchaseOrderNumber(purchaseOrderNumber.value);
  }

  async function removePurchaseOrderNumber() {
    purchaseOrderNumber.value = "";
    await updatePurchaseOrderNumber("");
  }

  async function saveNewAddressesInAccount(payload: {
    shipmentAddress?: CartAddressType;
    billingAddress?: CartAddressType;
  }) {
    if (!isAuthenticated.value) {
      return;
    }

    const { shipmentAddress, billingAddress } = payload;
    const newAddresses: MemberAddressType[] = [];

    if (shipmentAddress && !isExistAddress(shipmentAddress)) {
      newAddresses.push({
        ...shipmentAddress,
        isDefault: false,
        addressType: AddressType.BillingAndShipping,
      });
    }

    if (billingAddress && !billingAddressEqualsShippingAddress.value && !isExistAddress(billingAddress)) {
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
    if (billingAddressEqualsShippingAddress.value) {
      filledPayment.billingAddress = {
        ...shipment.value!.deliveryAddress,
        addressType: AddressType.Billing,
      };
    }

    await updatePayment(filledPayment, false);

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

  async function createOrder(): Promise<CustomerOrderType | undefined> {
    creatingOrder.value = true;

    await prepareOrderData();

    ga.addPaymentInfo(cart.value);

    const order = await createOrderFromCart(cart.value.id!);

    if (order) {
      return order;
    }

    creatingOrder.value = false;

    notifications.error({
      text: t("common.messages.creating_order_error"),
      duration: 15000,
      single: true,
    });
  }

  return {
    purchaseOrderNumber,
    comment,
    billingAddressEqualsShippingAddress,
    creatingOrder,
    shipment,
    payment,
    availableShippingMethods,
    availablePaymentMethods,
    isValidShipment,
    isValidPayment,
    isValidCheckout,
    purchaseOrderNumberApplied,
    initCheckout,
    openSelectShipmentMethodModal,
    openSelectPaymentMethodModal,
    openAddOrUpdateAddressModal,
    openSelectAddressModal,
    setPurchaseOrderNumber,
    removePurchaseOrderNumber,
    createOrder,
  };
}
