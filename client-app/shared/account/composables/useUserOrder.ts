import { computed, ref, shallowRef } from "vue";
import { addOrUpdateOrderPayment, getShortOrder, getFullOrder } from "@/core/api/graphql";
import { ProductType } from "@/core/enums";
import { groupByVendor, splitLineItemsByCurrency, Logger } from "@/core/utilities";
import type {
  GetFullOrderQueryVariables,
  GetShortOrderQueryVariables,
  InputAddOrUpdateOrderPaymentType,
  CustomerOrderType,
} from "@/core/api/graphql/types";

const loading = ref(false);
const order = shallowRef<CustomerOrderType>();

const giftItems = computed(() => (order.value?.items || []).filter((item) => item.isGift));
const orderItems = computed(() => (order.value?.items || []).filter((item) => !item.isGift));

// Vendor grouping and the main products list only cover items in the order's main currency.
// Items priced in other currencies are listed separately, grouped by their currency.
const lineItemsByCurrency = computed(() => splitLineItemsByCurrency(orderItems.value, order.value?.currency?.code));
const mainCurrencyOrderItems = computed(() => lineItemsByCurrency.value.mainCurrencyItems);
const otherCurrencyOrderItemGroups = computed(() => lineItemsByCurrency.value.otherCurrencyGroups);
const orderItemsGroupedByVendor = computed(() => groupByVendor(mainCurrencyOrderItems.value));

const allItemsAreDigital = computed(
  () => !!order.value?.items?.every((item) => item.productType === ProductType.Digital),
);
const shipment = computed(() => order.value?.shipments?.[0]);
const payment = computed(() => order.value?.inPayments?.[0]);
const deliveryAddress = computed(() => shipment.value?.deliveryAddress);
const pickupLocation = computed(() => shipment.value?.pickupLocation);

const billingAddress = computed(() => payment.value?.billingAddress);

export function useUserOrder() {
  async function fetchShortOrder(payload: GetShortOrderQueryVariables) {
    loading.value = true;

    try {
      order.value = (await getShortOrder(payload)) as CustomerOrderType; // todo refactor and remove assertion
    } catch (e) {
      Logger.error(`${useUserOrder.name}.${fetchShortOrder.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchFullOrder(payload: GetFullOrderQueryVariables) {
    loading.value = true;

    try {
      order.value = (await getFullOrder(payload)) as CustomerOrderType; // todo refactor and remove assertion
    } catch (e) {
      Logger.error(`${useUserOrder.name}.${fetchFullOrder.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearOrder() {
    order.value = undefined;
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
    mainCurrencyOrderItems,
    otherCurrencyOrderItemGroups,
    orderItemsGroupedByVendor,
    deliveryAddress,
    pickupLocation,
    billingAddress,
    shipment,
    payment,
    fetchShortOrder,
    fetchFullOrder,
    clearOrder,
    addOrUpdatePayment,
  };
}
