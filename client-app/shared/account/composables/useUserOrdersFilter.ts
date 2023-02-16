import moment from "moment";
import { computed, ref, Ref } from "vue";
import { OrdersFilterData, OrdersFilterChipsItem } from "@/shared/account";

const filterData: Ref<OrdersFilterData> = ref({ statuses: [] });
const appliedFilterData: Ref<OrdersFilterData> = ref({ ...filterData.value });

export default () => {
  const isFilterEmpty = computed(() => {
    const { statuses, startDate, endDate } = appliedFilterData.value;
    return !statuses.length && !startDate && !endDate;
  });

  const isFilterDirty = computed(() => {
    return JSON.stringify(filterData.value) !== JSON.stringify(appliedFilterData.value);
  });

  const filterChipsItems = computed(() => {
    const items: OrdersFilterChipsItem[] = [];

    if (appliedFilterData.value.statuses.length) {
      for (const status of appliedFilterData.value.statuses) {
        items.push({ fieldName: "statuses", value: status, label: status });
      }
    }
    if (appliedFilterData.value.startDate) {
      const formattedDate = moment(appliedFilterData.value.startDate).format("YYYY-MM-DD");
      items.push({
        fieldName: "startDate",
        value: appliedFilterData.value.startDate,
        label: `Start: ${formattedDate}`,
      });
    }
    if (appliedFilterData.value.endDate) {
      const formattedDate = moment(appliedFilterData.value.endDate).format("YYYY-MM-DD");
      items.push({
        fieldName: "endDate",
        value: appliedFilterData.value.endDate,
        label: `End: ${formattedDate}`,
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
    if (item.fieldName === "statuses") {
      appliedFilterData.value.statuses.splice(appliedFilterData.value.statuses.indexOf(item.value as string), 1);
    }

    if (item.fieldName === "startDate") {
      appliedFilterData.value.startDate = undefined;
    }

    if (item.fieldName === "endDate") {
      appliedFilterData.value.endDate = undefined;
    }

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
