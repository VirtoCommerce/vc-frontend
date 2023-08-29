import { computed, readonly, ref, shallowRef } from "vue";
import { getOrders } from "@/core/api/graphql/orders";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { dateToIsoDateString, Logger } from "@/core/utilities";
import useUserOrdersFilter from "./useUserOrdersFilter";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { OrdersFilterData } from "@/shared/account";
import type { MaybeRef, Ref } from "vue";

export const DEFAULT_ORDERS_PER_PAGE = 10;

export interface IUseUserOrdersOptions {
  itemsPerPage?: MaybeRef<number>;
}

export function useUserOrders(options: IUseUserOrdersOptions) {
  const itemsPerPage = ref(options.itemsPerPage ?? DEFAULT_ORDERS_PER_PAGE);

  const { appliedFilterData } = useUserOrdersFilter();

  const orders: Ref<CustomerOrderType[]> = shallowRef<CustomerOrderType[]>([]);
  const loading: Ref<boolean> = ref(false);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");

  // TODO: refine the sorting logic
  const sort: Ref<Sort> = ref(new Sort("createdDate", SortDirection.Descending));

  async function loadOrders() {
    loading.value = true;

    const filterExpression = getFilterExpression(keyword.value, appliedFilterData.value);

    try {
      const response = await getOrders({
        sort: sort.value.toString(),
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
}

function getFilterExpression(keyword: string, filterData: OrdersFilterData): string {
  let filterExpression = "";
  if (keyword) {
    filterExpression += `${keyword} `;
  }
  if (filterData.statuses.length) {
    const statuses = filterData.statuses.map((status) => `"${status}"`);
    filterExpression += `status:${statuses.join(",")} `;
  }

  if (filterData.startDate && filterData.endDate) {
    filterExpression += `createddate:[${dateToIsoDateString(filterData.startDate)} TO ${dateToIsoDateString(
      filterData.endDate,
    )}] `;
  } else if (filterData.startDate) {
    filterExpression += `createddate:[${dateToIsoDateString(filterData.startDate)} TO] `;
  } else if (filterData.endDate) {
    filterExpression += `createddate:[TO ${dateToIsoDateString(filterData.endDate)}] `;
  }

  filterExpression = filterExpression.trim();

  return filterExpression;
}
