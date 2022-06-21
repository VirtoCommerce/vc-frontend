import { Logger } from "@core/utilities";
import { computed, ref, Ref } from "vue";
import { CustomerOrderType, QueryOrderArgs } from "@/xapi/graphql/types";
import { getMyOrder } from "@/xapi/graphql/account";

const loading: Ref<boolean> = ref(false);
const order: Ref<CustomerOrderType | null> = ref(null);

const DEFAULT_ITEMS_PER_PAGE = 6;

const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
const pages: Ref<number> = ref(0);

export default () => {
  async function loadOrder(payload: QueryOrderArgs) {
    loading.value = true;

    try {
      order.value = await getMyOrder(payload);

      if (order.value.items && order.value.items.length > 0) {
        pages.value = Math.ceil(order.value.items.length / itemsPerPage.value);
      }
    } catch (e) {
      Logger.error("useUserOrder.loadOrder", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function clearOrder() {
    order.value = null;
  }

  return {
    loading: computed(() => loading.value),
    pages: computed(() => pages.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    order: computed(() => order.value),
    deliveryAddress: computed(() => order.value?.shipments?.[0]?.deliveryAddress),
    billingAddress: computed(() => order.value?.inPayments?.[0]?.billingAddress),
    loadOrder,
    clearOrder,
  };
};
