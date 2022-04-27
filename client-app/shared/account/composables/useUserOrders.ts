import { OrdersFilterChipsItem } from "./../types/index";
import { computed, readonly, ref, Ref, shallowRef } from "vue";
import { CustomerOrderType } from "@core/api/graphql/types";
import { getMyOrders } from "@core/api/graphql/account";
import { dateToIsoDateString, Logger, nameOf } from "@core/utilities";
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
  const appliedFilterData: Ref<OrdersFilterData> = ref({ ...filterData.value });

  const isFilterEmpty = computed(() => {
    const { statuses, startDate, endDate } = appliedFilterData.value;
    return !statuses.length && !startDate && !endDate;
  });

  const filterChipsItems = computed(() => {
    const items: OrdersFilterChipsItem[] = [];

    if (appliedFilterData.value.statuses.length) {
      for (const status of appliedFilterData.value.statuses) {
        items.push({ fieldName: nameOf<OrdersFilterData>("statuses"), value: status, label: status });
      }
    }
    if (appliedFilterData.value.startDate) {
      const isoDateString = dateToIsoDateString(appliedFilterData.value.startDate) as string;
      items.push({
        fieldName: nameOf<OrdersFilterData>("startDate"),
        value: isoDateString,
        label: `Start: ${isoDateString}`,
      });
    }
    if (appliedFilterData.value.endDate) {
      const isoDateString = dateToIsoDateString(appliedFilterData.value.endDate) as string;
      items.push({
        fieldName: nameOf<OrdersFilterData>("endDate"),
        value: isoDateString,
        label: `End: ${isoDateString}`,
      });
    }
    return items;
  });

  function resetFilters() {
    filterData.value = { statuses: [] };
    appliedFilterData.value = { ...filterData.value };
    page.value = 1;
    loadOrders();
  }

  function removeFilterChipsItem(item: OrdersFilterChipsItem) {
    if (item.fieldName === nameOf<OrdersFilterData>("statuses")) {
      appliedFilterData.value.statuses.splice(appliedFilterData.value.statuses.indexOf(item.value), 1);
    }

    if (item.fieldName === nameOf<OrdersFilterData>("startDate")) {
      appliedFilterData.value.startDate = undefined;
    }

    if (item.fieldName === nameOf<OrdersFilterData>("endDate")) {
      appliedFilterData.value.endDate = undefined;
    }

    filterData.value = { ...appliedFilterData.value };
    page.value = 1;
    loadOrders();
  }

  async function loadOrders() {
    loading.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    const filterExpression = getFilterExpression(keyword.value, appliedFilterData.value);

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
    appliedFilterData,
    isFilterEmpty,
    filterChipsItems,
    resetFilters,
    removeFilterChipsItem,
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
