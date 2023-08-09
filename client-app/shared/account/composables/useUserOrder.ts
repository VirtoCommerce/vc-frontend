import { computed, ref, shallowRef } from "vue";
import { addOrUpdateOrderPayment, getOrder } from "@/core/api/graphql";
import { ProductType } from "@/core/enums";
import { getLineItemsGroupedByVendor, Logger } from "@/core/utilities";
import type {
  CustomerOrderType,
  InputAddOrUpdateOrderPaymentType,
  OrderAddressType,
  OrderLineItemType,
  OrderShipmentType,
  PaymentInType,
  QueryOrderArgs,
} from "@/core/api/graphql/types";
import type { LineItemsGroupByVendorType } from "@/core/types";

const loading = ref(false);
const order = shallowRef<CustomerOrderType | null>(null);

const giftItems = computed<OrderLineItemType[]>(() => (order.value?.items || []).filter((item) => item.isGift));
const orderItems = computed<OrderLineItemType[]>(() => (order.value?.items || []).filter((item) => !item.isGift));
const orderItemsGroupedByVendor = computed<LineItemsGroupByVendorType<OrderLineItemType>[]>(() =>
  getLineItemsGroupedByVendor(orderItems.value),
);
const allItemsAreDigital = computed<boolean>(
  () => !!order.value?.items?.every((item) => item.productType === ProductType.Digital),
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
    allItemsAreDigital,
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
