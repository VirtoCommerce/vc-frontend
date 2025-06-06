import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { DateFilterId } from "@/core/enums";
import { toEndDateFilterValue, toStartDateFilterValue } from "@/core/utilities";
import type { DateFilterType } from "@/core/types";
import type { OrdersFilterDataType, OrdersFilterChipsItemType, OrderFacetType } from "@/shared/account";
import type { Ref } from "vue";

const filterData: Ref<OrdersFilterDataType> = ref({ statuses: [], customerNames: [] });
const appliedFilterData: Ref<OrdersFilterDataType> = ref({ ...filterData.value });
const facetLocalization: Ref<OrderFacetType[] | undefined> = ref();

function getFirstDayOfWeek(currentDate: Date): Date {
  const date = new Date(currentDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  return new Date(date.setDate(diff));
}

export function useUserOrdersFilter() {
  const { d, t } = useI18n();

  function getDateFilterRanges(): DateFilterType[] {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const lastDayStartDate = new Date(currentDate);
    lastDayStartDate.setDate(currentDate.getDate() - 1);

    const firstDayOfWeek = getFirstDayOfWeek(currentDate);

    const lastWeekStartDate = new Date(currentDate);
    lastWeekStartDate.setDate(firstDayOfWeek.getDate() - 7);

    const lastWeekEndDate = new Date(currentDate);
    lastWeekEndDate.setDate(firstDayOfWeek.getDate());

    const lastMonthStartDate = new Date(currentDate);
    lastMonthStartDate.setMonth(currentDate.getMonth() - 1);
    lastMonthStartDate.setDate(1);

    const lastMonthEndDate = new Date(currentDate);
    lastMonthEndDate.setDate(1);

    const lastYearStartDate = new Date(currentDate);
    lastYearStartDate.setFullYear(currentDate.getFullYear() - 1);
    lastYearStartDate.setMonth(0);
    lastYearStartDate.setDate(1);

    const lastYearEndDate = new Date(currentDate);
    lastYearEndDate.setFullYear(currentDate.getFullYear());
    lastYearEndDate.setMonth(0);
    lastYearEndDate.setDate(1);

    return [
      {
        id: DateFilterId.CUSTOM,
        label: t("common.labels.custom_date"),
      },
      {
        id: DateFilterId.LAST_DAY,
        label: t("common.labels.last_day"),
        startDate: lastDayStartDate.toISOString(),
        endDate: currentDate.toISOString(),
      },
      {
        id: DateFilterId.LAST_WEEK,
        label: t("common.labels.last_week"),
        startDate: lastWeekStartDate.toISOString(),
        endDate: lastWeekEndDate.toISOString(),
      },
      {
        id: DateFilterId.LAST_MONTH,
        label: t("common.labels.last_month"),
        startDate: lastMonthStartDate.toISOString(),
        endDate: lastMonthEndDate.toISOString(),
      },
      {
        id: DateFilterId.LAST_YEAR,
        label: t("common.labels.last_year"),
        startDate: lastYearStartDate.toISOString(),
        endDate: lastYearEndDate.toISOString(),
      },
    ];
  }

  const isFilterEmpty = computed(() => {
    const { statuses, startDate, endDate, customerNames } = appliedFilterData.value;
    return !statuses.length && !startDate && !endDate && !customerNames?.length;
  });

  const isFilterDirty = computed(() => {
    return JSON.stringify(filterData.value) !== JSON.stringify(appliedFilterData.value);
  });

  const filterChipsItems = computed(() => {
    const items: OrdersFilterChipsItemType[] = [];

    if (appliedFilterData.value.statuses.length) {
      for (const status of appliedFilterData.value.statuses) {
        items.push({ fieldName: "statuses", value: status, label: getFacetLocalization("status", status) ?? status });
      }
    }

    if (appliedFilterData.value.customerNames?.length) {
      for (const customerName of appliedFilterData.value.customerNames) {
        items.push({ fieldName: "customerNames", value: customerName, label: customerName });
      }
    }

    const startDateFilterValue = toStartDateFilterValue(appliedFilterData.value.startDate);
    const endDateFilterValue = toEndDateFilterValue(appliedFilterData.value.endDate);
    if (startDateFilterValue) {
      const formattedDate = d(startDateFilterValue);
      items.push({
        fieldName: "startDate",
        value: appliedFilterData.value.startDate,
        label: t("common.labels.starts_from", [formattedDate]),
      });
    }
    if (endDateFilterValue) {
      const formattedDate = d(endDateFilterValue);
      items.push({
        fieldName: "endDate",
        value: appliedFilterData.value.endDate,
        label: t("common.labels.ends_to", [formattedDate]),
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
    filterData.value = { statuses: [], customerNames: [], startDate: undefined, endDate: undefined };
    appliedFilterData.value = { ...filterData.value };
  }

  function resetDataToApplied() {
    filterData.value = { ...appliedFilterData.value };
  }

  function removeFilterChipsItem(item: OrdersFilterChipsItemType) {
    if (item.fieldName === "statuses") {
      appliedFilterData.value.statuses.splice(appliedFilterData.value.statuses.indexOf(item.value as string), 1);
    }

    if (item.fieldName === "customerNames") {
      appliedFilterData.value.customerNames?.splice(
        appliedFilterData.value.customerNames.indexOf(item.value as string),
        1,
      );
    }

    if (item.fieldName === "startDate") {
      appliedFilterData.value.startDate = undefined;
    }

    if (item.fieldName === "endDate") {
      appliedFilterData.value.endDate = undefined;
    }

    filterData.value = { ...appliedFilterData.value };
  }

  function setFacetsLocalization(facets: OrderFacetType[] | undefined) {
    facetLocalization.value = facets;
  }

  function getFacetLocalization(facetName: string, term: string): string | undefined {
    const facet = facetLocalization.value?.find((el) => el.name === facetName);
    return facet?.items?.find((el) => el.term === term)?.label;
  }

  return {
    filterData,
    appliedFilterData: computed(() => appliedFilterData.value),
    dateFilterTypes: computed(() => getDateFilterRanges()),
    isFilterEmpty,
    isFilterDirty,
    filterChipsItems,
    applyFilters,
    resetFilters,
    resetDataToApplied,
    removeFilterChipsItem,
    setFacetsLocalization,
  };
}
