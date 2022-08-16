import { computed, readonly, ref, Ref, shallowRef } from "vue";
import { CustomerOrderType } from "@/xapi/types";
import { getOrders } from "@/xapi/graphql/orders";
import { dateToIsoDateString, getSortingExpression, Logger } from "@/core/utilities";
import { ISortInfo } from "@/core/types";
import { OrdersFilterData } from "@/shared/account";
import { SORT_DESCENDING } from "@/core/constants";
import useUserOrdersFilter from "./useUserOrdersFilter";

const DEFAULT_ITEMS_PER_PAGE = 10;

export default () => {
  const { appliedFilterData } = useUserOrdersFilter();

  const orders: Ref<CustomerOrderType[]> = shallowRef<CustomerOrderType[]>([]);
  const loading: Ref<boolean> = ref(false);
  const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");

  // TODO: refine the sorting logic
  const sort: Ref<ISortInfo> = ref({
    column: "createdDate",
    direction: SORT_DESCENDING,
  });

  async function loadOrders() {
    loading.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    const filterExpression = getFilterExpression(keyword.value, appliedFilterData.value);

    try {
      const response = await getOrders({
        sort: sortingExpression,
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        filter: filterExpression,
      });
      orders.value = response.items ?? [];
      pages.value = Math.ceil((response.totalCount ?? 0) / itemsPerPage.value);
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
    itemsPerPage,
    pages,
    page,
    keyword,
  };
};

function getFilterExpression(keyword: string, filterData: OrdersFilterData): string {
  let filterExpression = "";
  if (keyword) {
    filterExpression += `${keyword} `;
  }
  if (filterData.statuses.length) {
    filterExpression += `status:${filterData.statuses.join(",")} `;
  }

  if (filterData.startDate && filterData.endDate) {
    filterExpression += `createddate:[${dateToIsoDateString(filterData.startDate)} TO ${dateToIsoDateString(
      filterData.endDate
    )}] `;
  } else if (filterData.startDate) {
    filterExpression += `createddate:[${dateToIsoDateString(filterData.startDate)} TO] `;
  } else if (filterData.endDate) {
    filterExpression += `createddate:[TO ${dateToIsoDateString(filterData.endDate)}] `;
  }

  filterExpression = filterExpression.trim();

  return filterExpression;
}
