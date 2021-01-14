import { Ref, ref, computed } from "@vue/composition-api";
import { getMyOrders } from "@core/api/graphql/account";
import { CustomerOrderType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";


export default () => {
  const loading: Ref<boolean> = ref(true);
  const totalCount: Ref<number> = ref(0);
  const myOrders: Ref<CustomerOrderType[]> = ref([]);

  async function loadMyOrders(itemsPerPage = 20, page = 1): Promise<void>  {
    loading.value = true;
    try {
      const orders = await getMyOrders('', itemsPerPage, page);
      myOrders.value = orders?.items as CustomerOrderType[];
      totalCount.value = orders?.totalCount ?? 0;
    } catch (e) {
      Logger.error("useUserOrders.loadMyOrders", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }


  return {
    myOrders: computed(() => myOrders.value),
    totalCount: computed(() => totalCount.value),
    loading: computed(() => loading.value),
    loadMyOrders
  };
};
