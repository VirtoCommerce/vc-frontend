import { Ref, ref } from "@vue/composition-api";
import { or } from "vuelidate/lib/validators";
import { useCart } from "@libs/cart";
import {
  addOrUpdateCartShipment,
  addOrUpdateCartPayment,
  createOrderFromCart,
  getAvailPaymentMethods,
  getAvailShippingMethods,
  removeCart
} from "@core/api/graphql/cart";
import {
  InputShipmentType,
  InputPaymentType,
  InputAddressType,
  ShippingMethodType,
  PaymentMethodType,
  AddressType,
  ShipmentType,
  PaymentType,
  CartType
} from "@core/api/graphql/types";
import { Logger } from "@core/utilities";

const addresses: AddressType[] = [
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
    phone: "560123456"
  }
];

const loading: Ref<boolean> = ref(false);

const deliveryAddress: Ref<InputAddressType> = ref({ postalCode: "" });
const billingAddress: Ref<InputAddressType> = ref({ postalCode: "" });

const chosenShippingMethod: Ref<ShippingMethodType> = ref({});
const chosenPaymentMethod: Ref<PaymentMethodType> = ref({});
const shippingAddresses: Ref<AddressType[]> = ref(addresses);
const billingAddresses: Ref<AddressType[]> = ref(addresses);
const shippingMethods: Ref<ShippingMethodType[]> = ref([]);

const paymentMethods: Ref<PaymentMethodType[]> = ref([]);
const existShipment: Ref<ShipmentType | null> = ref(null);
const existPayment: Ref<PaymentType | null> = ref(null);

export default () => {
  async function placeOrder(cartId: string) {
    const order =  await createOrderFromCart(cartId);
    if(order)
    {
      await removeCart(cartId);
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
    }
  }

  async function setDefaultDeliveryAddress(address: AddressType) {
    console.log("setDefaultDeliveryAddress");
  }
  async function setDefaultBillingAddress(address: AddressType) {
    console.log("setDefaultBillingAddress");
  }
  async function setShippingMethod(shippingMethod: ShippingMethodType) {
    chosenShippingMethod.value = { ...shippingMethod };
  }
  async function setPaymentMethod(paymentMethod: PaymentMethodType) {
    chosenPaymentMethod.value = { ...paymentMethod };
  }
  async function setBillingAddress(address: AddressType) {
    billingAddress.value = { ...billingAddress.value, ...address };
  }
  async function setDeliveryAddress(address: AddressType) {
    deliveryAddress.value = { ...deliveryAddress.value, ...address };
  }

  async function saveBillingDetails() {
    const payment: InputPaymentType = {
      id: existPayment.value?.id,
      paymentGatewayCode: chosenPaymentMethod.value.code,
      billingAddress: { ...billingAddress.value }
    };
    await addOrUpdateCartPayment(payment);
  }

  async function saveShippingDetails() {
    const shipping: InputShipmentType = {
      id: existShipment.value?.id,
      shipmentMethodCode: chosenShippingMethod.value.code,
      shipmentMethodOption: chosenShippingMethod.value.optionName,
      deliveryAddress: { ...deliveryAddress.value }
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
    deliveryAddress,
    shippingMethods,
    paymentMethods,
    chosenShippingMethod,
    chosenPaymentMethod,
    shippingAddresses,
    billingAddress,
    billingAddresses,
    loading
  };
};
