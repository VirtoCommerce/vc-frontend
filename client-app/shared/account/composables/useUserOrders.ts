import { computed, readonly, ref, shallowRef } from "vue";
import { getOrders } from "@/core/api/graphql/orders";
import { DEFAULT_ORDERS_PER_PAGE, STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { Logger, toEndDateFilterValue, toStartDateFilterValue } from "@/core/utilities";
import { useUserOrdersFilter } from "./useUserOrdersFilter";
import type { CustomerOrderType, FacetTermType } from "@/core/api/graphql/types";
import type { OrdersFilterDataType } from "@/shared/account";
import type { MaybeRef, Ref } from "vue";

export interface IUseUserOrdersOptions {
  itemsPerPage?: MaybeRef<number>;
}

const facets = shallowRef<FacetTermType[] | undefined>();

export function useUserOrders(options: IUseUserOrdersOptions) {
  const itemsPerPage = ref(options.itemsPerPage ?? DEFAULT_ORDERS_PER_PAGE);

  const { appliedFilterData, setFacetsLocalization } = useUserOrdersFilter();

  const orders: Ref<CustomerOrderType[]> = shallowRef<CustomerOrderType[]>([]);
  const loading: Ref<boolean> = ref(false);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");

  const sort: Ref<Sort> = ref(new Sort("createdDate", SortDirection.Descending));

  async function fetchOrders() {
    loading.value = true;

    const filterExpression = getFilterExpression(keyword.value, appliedFilterData.value);

    try {
      const response = await getOrders({
        sort: sort.value.toString(),
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        filter: filterExpression,
        facet: STATUS_ORDERS_FACET_NAME,
      });
      orders.value = response.items ?? [];
      pages.value = Math.ceil((response.totalCount ?? 0) / itemsPerPage.value);
      facets.value = response.term_facets?.find((item) => item.name === STATUS_ORDERS_FACET_NAME)?.terms;
      setFacetsLocalization(facets.value);
    } catch (e) {
      Logger.error(`${useUserOrders.name}.${fetchOrders.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    sort,
    fetchOrders,
    loading: readonly(loading),
    orders: computed(() => orders.value),
    facets: computed(() => facets.value),
    itemsPerPage,
    pages,
    page,
    keyword,
  };
}

function getFilterExpression(keyword: string, filterData: OrdersFilterDataType): string {
  let filterExpression = "";
  if (keyword) {
    filterExpression += `${keyword} `;
  }
  if (filterData.statuses.length) {
    const statuses = filterData.statuses.map((status) => `"${status}"`);
    filterExpression += `status:${statuses.join(",")} `;
  }

  const startDateFilterValue = toStartDateFilterValue(filterData.startDate);
  const endDateFilterValue = toEndDateFilterValue(filterData.endDate);
  if (startDateFilterValue || endDateFilterValue) {
    let createdDateFilterValue = "";
    if (startDateFilterValue) {
      createdDateFilterValue += `"${startDateFilterValue}" `;
    }
    createdDateFilterValue += "TO";
    if (endDateFilterValue) {
      createdDateFilterValue += ` "${endDateFilterValue}"`;
    }
    filterExpression += `createddate:[${createdDateFilterValue}]`;
  }

  filterExpression = filterExpression.trim();

  return filterExpression;
}
