import { computed, ref, shallowRef } from "vue";
import { Logger } from "@/core";
import {
  addOrUpdateOrderPayment,
  CustomerOrderType,
  getOrder,
  InputAddOrUpdateOrderPaymentType,
  QueryOrderArgs,
} from "@/xapi";

const loading = ref(false);
const order = shallowRef<CustomerOrderType | null>(null);
const itemsPerPage = ref(6);
const pages = ref(0);

export default function useUserOrder() {
  async function fetchOrder(payload: QueryOrderArgs) {
    loading.value = true;

    try {
      order.value = await getOrder(payload);

      if (order.value.items && order.value.items.length > 0) {
        pages.value = Math.ceil(order.value.items.length / itemsPerPage.value);
      }
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
    pages: computed(() => pages.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    order: computed(() => order.value),
    deliveryAddress: computed(() => order.value?.shipments?.[0]?.deliveryAddress),
    billingAddress: computed(() => order.value?.inPayments?.[0]?.billingAddress),
    fetchOrder,
    clearOrder,
    addOrUpdatePayment,
  };
}
