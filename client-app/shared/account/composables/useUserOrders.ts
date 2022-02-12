import { computed, readonly, ref, Ref, shallowRef } from "vue";
import { CustomerOrderType } from "@core/api/graphql/types";
import { getMyOrders } from "@core/api/graphql/account";
import { Logger } from "@core/utilities";
import { getSortingExpression, ISortInfo } from "@/shared/account";
import { sortAscending } from "@core/constants";

const loading: Ref<boolean> = ref(false);
const orders: Ref<CustomerOrderType[]> = shallowRef<CustomerOrderType[]>([]);

// TODO: refine the sorting logic
const sort: Ref<ISortInfo> = ref({
  column: "number",
  direction: sortAscending,
});

export default () => {
  async function loadOrders() {
    loading.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    try {
      orders.value = await getMyOrders({ sort: sortingExpression });
    } catch (e) {
      Logger.error("useUserOrders.loadOrders", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    sort,
    loadOrders,
    loading: readonly(loading),
    orders: computed(() => orders.value),
  };
};
