import { computed, ref, shallowRef } from "vue";
import { addOrUpdateOrderPayment, getOrder } from "@/core/api/graphql";
import { GetOrderFeldsType } from "@/core/api/graphql/orders/queries/getOrder";
import { ProductType } from "@/core/enums";
import { groupByVendor, Logger } from "@/core/utilities";
import type { GetOrderPayloadType } from "@/core/api/graphql/orders/queries/getOrder";
import type {
  CustomerOrderType,
  InputAddOrUpdateOrderPaymentType,
  OrderAddressType,
  OrderLineItemType,
  OrderShipmentType,
  PaymentInType,
} from "@/core/api/graphql/types";
import type { VendorGroupType } from "@/core/types";

const loading = ref(false);
const order = shallowRef<CustomerOrderType | null>(null);

const giftItems = computed<OrderLineItemType[]>(() => (order.value?.items || []).filter((item) => item.isGift));
const orderItems = computed<OrderLineItemType[]>(() => (order.value?.items || []).filter((item) => !item.isGift));
const orderItemsGroupedByVendor = computed<VendorGroupType<OrderLineItemType>[]>(() => groupByVendor(orderItems.value));
const allItemsAreDigital = computed<boolean>(
  () => !!order.value?.items?.every((item) => item.productType === ProductType.Digital),
);
const shipment = computed<OrderShipmentType | undefined>(() => order.value?.shipments?.[0]);
const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments?.[0]);
const deliveryAddress = computed<OrderAddressType | undefined>(() => shipment.value?.deliveryAddress);
const billingAddress = computed<OrderAddressType | undefined>(() => payment.value?.billingAddress);

export function useUserOrder() {
  async function fetchShortOrder(payload: GetOrderPayloadType) {
    loading.value = true;

    try {
      order.value = await getOrder(payload, { fields: GetOrderFeldsType.Short });
    } catch (e) {
      Logger.error(`${useUserOrder.name}.${fetchShortOrder.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchFullOrder(payload: GetOrderPayloadType) {
    loading.value = true;

    try {
      order.value = await getOrder(payload);
    } catch (e) {
      Logger.error(`${useUserOrder.name}.${fetchFullOrder.name}`, e);
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
      await fetchFullOrder({ id: payload.orderId });
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
    fetchShortOrder,
    fetchFullOrder,
    clearOrder,
    addOrUpdatePayment,
  };
}
