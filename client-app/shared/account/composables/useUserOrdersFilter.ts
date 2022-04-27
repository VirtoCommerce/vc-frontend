import { computed, readonly, ref, Ref, shallowRef } from "vue";
import { OrdersFilterData, OrdersFilterChipsItem } from "@/shared/account";
import { dateToIsoDateString, nameOf } from "@core/utilities";

const filterData: Ref<OrdersFilterData> = ref({ statuses: [] });
const appliedFilterData: Ref<OrdersFilterData> = ref({ ...filterData.value });

export default () => {
  const isFilterEmpty = computed(() => {
    const { statuses, startDate, endDate } = appliedFilterData.value;
    return !statuses.length && !startDate && !endDate;
  });

  const isFilterDirty = computed(() => {
    return JSON.stringify(filterData.value) != JSON.stringify(appliedFilterData.value);
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

  function applyFilters() {
    if (JSON.stringify(appliedFilterData.value) === JSON.stringify(filterData.value)) {
      return;
    }
    appliedFilterData.value = { ...filterData.value };
  }

  function resetFilters() {
    filterData.value = { statuses: [] };
    appliedFilterData.value = { ...filterData.value };
  }

  function resetDataToApplied() {
    filterData.value = { ...appliedFilterData.value };
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
    appliedFilterData.value = { ...appliedFilterData.value };
    filterData.value = { ...appliedFilterData.value };
  }

  return {
    filterData,
    appliedFilterData: computed(() => appliedFilterData.value),
    isFilterEmpty,
    isFilterDirty,
    filterChipsItems,
    applyFilters,
    resetFilters,
    resetDataToApplied,
    removeFilterChipsItem,
  };
};
