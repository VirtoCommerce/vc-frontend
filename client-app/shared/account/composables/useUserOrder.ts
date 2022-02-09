import { Logger } from "@core/utilities";
import { computed, ref, Ref } from "vue";
import { CustomerOrderType, OrderLineItemType } from "@/core/api/graphql/types";
import { getMyOrder } from "@/core/api/graphql/account";

const loading: Ref<boolean> = ref(false);
const order: Ref<CustomerOrderType | null> = ref(null);

const itemsPerPage: Ref<number> = ref(6);
const pages: Ref<number> = ref(0);

export default () => {
  async function loadOrder(id: string, number?: string) {
    loading.value = true;

    try {
      order.value = await getMyOrder(id, number);
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

  return {
    loading: computed(() => loading.value),
    pages: computed(() => pages.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    order: computed(() => order.value),
    loadOrder,
  };
};
