import { computed, ref, shallowRef } from "vue";
import { getLineItemsGroupedByVendor, Logger, TLineItemsGroupByVendor } from "@/core";
import {
  addOrUpdateOrderPayment,
  CustomerOrderType,
  getOrder,
  InputAddOrUpdateOrderPaymentType,
  OrderAddressType,
  OrderLineItemType,
  OrderShipmentType,
  PaymentInType,
  QueryOrderArgs,
} from "@/xapi";

const loading = ref(false);
const order = shallowRef<CustomerOrderType | null>(null);

const giftItems = computed<OrderLineItemType[]>(() => (order.value?.items || []).filter((item) => item.isGift));
const orderItems = computed<OrderLineItemType[]>(() => (order.value?.items || []).filter((item) => !item.isGift));
const orderItemsGroupedByVendor = computed<TLineItemsGroupByVendor<OrderLineItemType>[]>(() =>
  getLineItemsGroupedByVendor(orderItems.value)
);

const shipment = computed<OrderShipmentType | undefined>(() => order.value?.shipments?.[0]);
const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments?.[0]);
const deliveryAddress = computed<OrderAddressType | undefined>(() => shipment.value?.deliveryAddress);
const billingAddress = computed<OrderAddressType | undefined>(() => payment.value?.billingAddress);

export default function useUserOrder() {
  async function fetchOrder(payload: QueryOrderArgs) {
    loading.value = true;

    try {
      order.value = await getOrder(payload);
    } catch (e) {
      Logger.error(`${useUserOrder.name}.${fetchOrder.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearOrder() {
    order.value = null;
  }

  async function addOrUpdatePayment(payload: InputAddOrUpdateOrderPaymentType, reloadOrder = true) {
    loading.value = true;

    try {
      await addOrUpdateOrderPayment(payload);
    } catch (e) {
      Logger.error(`${useUserOrder.name}.${addOrUpdatePayment.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    if (reloadOrder) {
      await fetchOrder({ id: payload.orderId });
    }
  }

  return {
    loading: computed(() => loading.value),
    order: computed(() => order.value),
    giftItems,
    orderItems,
    orderItemsGroupedByVendor,
    deliveryAddress,
    billingAddress,
    shipment,
    payment,
    fetchOrder,
    clearOrder,
    addOrUpdatePayment,
  };
}
