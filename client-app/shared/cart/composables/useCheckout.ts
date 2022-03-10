import { Ref, ref, computed } from "vue";
import {
  addOrUpdateCartShipment,
  addOrUpdateCartPayment,
  createOrderFromCart,
  getAvailPaymentMethods,
  getAvailShippingMethods,
  removeCart,
} from "@core/api/graphql/cart";
import {
  InputShipmentType,
  InputPaymentType,
  InputAddressType,
  ShippingMethodType,
  PaymentMethodType,
  CartAddressType,
  ShipmentType,
  PaymentType,
  CustomerOrderType,
} from "@core/api/graphql/types";
import { useCart } from ".";

const addresses: CartAddressType[] = [
  {
    id: "1",
    email: "john@gmail.com",
    firstName: "John",
    lastName: "Doe",
    line1: "Warsawska",
    line2: "24/193A",
    city: "Phoenix",
    postalCode: "26-620",
    zip: "26-620",
    countryCode: "US",
    countryName: "USA",
    phone: "560123456",
  },
];

const loading: Ref<boolean> = ref(false);

const deliveryAddress: Ref<InputAddressType> = ref({ postalCode: "", countryCode: "" });
const billingAddress: Ref<InputAddressType> = ref({ postalCode: "" });

const chosenShippingMethod: Ref<ShippingMethodType> = ref({});
const chosenPaymentMethod: Ref<PaymentMethodType> = ref({});
const shippingAddresses: Ref<CartAddressType[]> = ref(addresses);
const billingAddresses: Ref<CartAddressType[]> = ref(addresses);
const shippingMethods: Ref<ShippingMethodType[]> = ref([]);

const paymentMethods: Ref<PaymentMethodType[]> = ref([]);
const existShipment: Ref<ShipmentType | null> = ref(null);
const existPayment: Ref<PaymentType | null> = ref(null);

export default () => {
  const { loadMyCart } = useCart();

  async function placeOrder(cartId: string, reloadCart = true): Promise<CustomerOrderType | null> {
    const order = await createOrderFromCart(cartId);

    if (!order) return null;

    await removeCart(cartId); // TODO: implement in "useCart"

    if (reloadCart) {
      await loadMyCart();
    }

    return order;
  }

  async function loadPaymentMethods() {
    paymentMethods.value = await getAvailPaymentMethods();

    //TODO: remove later
    const { cart, loadMyCart } = useCart();
    await loadMyCart();
    if (cart.value.payments && cart.value.payments.length > 0) {
      existPayment.value = cart.value.payments[0];
    }
  }

  async function loadShipmentMethods() {
    shippingMethods.value = await getAvailShippingMethods();

    //TODO: remove later
    const { cart, loadMyCart } = useCart();
    await loadMyCart();
    if (cart.value.shipments && cart.value.shipments.length > 0) {
      existShipment.value = cart.value.shipments[0];
      deliveryAddress.value = { ...cart.value.shipments[0]?.deliveryAddress } ?? deliveryAddress.value;
    }
  }

  async function setDefaultDeliveryAddress(address: CartAddressType) {
    console.log("setDefaultDeliveryAddress");
  }
  async function setDefaultBillingAddress(address: CartAddressType) {
    console.log("setDefaultBillingAddress");
  }
  async function setShippingMethod(shippingMethod: ShippingMethodType) {
    chosenShippingMethod.value = { ...shippingMethod };
  }
  async function setPaymentMethod(paymentMethod: PaymentMethodType) {
    chosenPaymentMethod.value = { ...paymentMethod };
  }
  async function setBillingAddress(address: CartAddressType) {
    billingAddress.value = { ...billingAddress.value, ...address };
  }
  async function setDeliveryAddress(address: CartAddressType) {
    deliveryAddress.value = { ...deliveryAddress.value, ...address };
    //Delivery address type
    deliveryAddress.value.addressType = 1;
  }

  async function saveBillingDetails() {
    const payment: InputPaymentType = {
      id: existPayment.value?.id,
      paymentGatewayCode: chosenPaymentMethod.value.code,
      billingAddress: { ...billingAddress.value },
    };
    await addOrUpdateCartPayment(payment);
  }

  async function saveShippingDetails() {
    const shipping: InputShipmentType = {
      id: existShipment.value?.id,
      shipmentMethodCode: chosenShippingMethod.value.code,
      shipmentMethodOption: chosenShippingMethod.value.optionName,
      deliveryAddress: { ...deliveryAddress.value },
    };
    await addOrUpdateCartShipment(shipping);
  }

  return {
    placeOrder,
    loadShipmentMethods,
    loadPaymentMethods,
    setDeliveryAddress,
    setBillingAddress,
    setShippingMethod,
    setPaymentMethod,
    saveShippingDetails,
    saveBillingDetails,
    setDefaultDeliveryAddress,
    setDefaultBillingAddress,
    // make sure that no one will mutate these objects
    deliveryAddress: computed(() => deliveryAddress.value),
    shippingMethods: computed(() => shippingMethods.value),
    paymentMethods: computed(() => paymentMethods.value),
    chosenShippingMethod: computed(() => chosenShippingMethod.value),
    chosenPaymentMethod: computed(() => chosenPaymentMethod.value),
    shippingAddresses: computed(() => shippingAddresses.value),
    billingAddress: computed(() => billingAddress.value),
    billingAddresses: computed(() => billingAddresses.value),
    loading: computed(() => loading.value),
  };
};
