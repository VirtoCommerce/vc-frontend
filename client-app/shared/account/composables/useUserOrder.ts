import { computed, ref, shallowRef } from "vue";
import { addOrUpdateOrderPayment, getShortOrder, getFullOrder } from "@/core/api/graphql";
import { Logger } from "@/core/utilities";
import { useOrderView } from "./useOrderView";
import type {
  GetFullOrderQueryVariables,
  GetShortOrderQueryVariables,
  InputAddOrUpdateOrderPaymentType,
  CustomerOrderType,
} from "@/core/api/graphql/types";

const loading = ref(false);
const order = shallowRef<CustomerOrderType>();

const view = useOrderView(order);

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
    ...view,
    fetchShortOrder,
    fetchFullOrder,
    clearOrder,
    addOrUpdatePayment,
  };
}
