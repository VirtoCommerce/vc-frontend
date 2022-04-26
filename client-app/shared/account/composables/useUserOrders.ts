import { OrdersFilterChipsItem } from "./../types/index";
import { computed, readonly, ref, Ref, shallowRef } from "vue";
import { CustomerOrderType } from "@core/api/graphql/types";
import { getMyOrders } from "@core/api/graphql/account";
import { dateToIsoDateString, isObjectEmpty, Logger } from "@core/utilities";
import { getSortingExpression, ISortInfo, OrdersFilterData } from "@/shared/account";
import { sortDescending } from "@core/constants";

export default () => {
  const orders: Ref<CustomerOrderType[]> = shallowRef<CustomerOrderType[]>([]);
  const loading: Ref<boolean> = ref(false);
  const itemsPerPage: Ref<number> = ref(10);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");

  // TODO: refine the sorting logic
  const sort: Ref<ISortInfo> = ref({
    column: "createdDate",
    direction: sortDescending,
  });

  const filterData: Ref<OrdersFilterData> = ref({ statuses: [] });

  const isFilterEmpty = computed(() => {
    const res = isObjectEmpty(filterData.value, true);
    return res;
  });

  const filterChipsItems = computed(() => {
    const items: OrdersFilterChipsItem[] = [];

    if (filterData.value.statuses.length) {
      for (const status of filterData.value.statuses) {
        items.push({ fieldName: "status", value: status, label: status });
      }
    }
    if (filterData.value.startDate) {
      const isoDateString = dateToIsoDateString(filterData.value.startDate) as string;
      items.push({ fieldName: "startDate", value: isoDateString, label: `Start: ${isoDateString}` });
    }
    if (filterData.value.endDate) {
      const isoDateString = dateToIsoDateString(filterData.value.endDate) as string;
      items.push({ fieldName: "endDate", value: isoDateString, label: `End: ${isoDateString}` });
    }
    return items;
  });

  async function loadOrders() {
    loading.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    const filterExpression = getFilterExpression(keyword.value, filterData.value);

    try {
      const response = await getMyOrders({
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
    filterData,
    isFilterEmpty,
    filterChipsItems,
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
