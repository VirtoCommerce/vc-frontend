import { computed, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { CUSTOMER_NAME_FACET_NAME } from "@/core/constants";
import { DateFilterId } from "@/core/enums";
import { toEndDateFilterValue, toStartDateFilterValue, toDateISOString } from "@/core/utilities";
import { useUser } from "./useUser";
import { facets } from "./useUserOrders";
import type { DateFilterType } from "@/core/types";
import type { OrdersFilterDataType, OrdersFilterChipsItemType, OrderFacetType, OrderScopeType } from "@/shared/account";
import type { MaybeRef, Ref } from "vue";

const filterData: Ref<OrdersFilterDataType> = ref({ statuses: [], customerNames: [] });
const appliedFilterData: Ref<OrdersFilterDataType> = ref({ ...filterData.value });
const facetLocalization: Ref<OrderFacetType[] | undefined> = ref();
const selectedDateFilterType: Ref<DateFilterType | undefined> = ref();

function getFirstDayOfWeek(currentDate: Date): Date {
  const date = new Date(currentDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  return new Date(date.setDate(diff));
}

function applyFilters() {
  if (JSON.stringify(appliedFilterData.value) === JSON.stringify(filterData.value)) {
    return;
  }
  appliedFilterData.value = { ...filterData.value };
}

function resetFilterData() {
  filterData.value = { statuses: [], customerNames: [], startDate: undefined, endDate: undefined };
  appliedFilterData.value = { ...filterData.value };
}

function setFacetsLocalization(localizationFacets: OrderFacetType[] | undefined) {
  facetLocalization.value = localizationFacets;
}

function getFacetLocalization(facetName: string, term: string): string | undefined {
  const facet = facetLocalization.value?.find((el) => el.name === facetName);
  return facet?.items?.find((el) => el.term === term)?.label;
}

function handleOrdersDateFilterChange(dateFilterType: DateFilterType): void {
  filterData.value.startDate = dateFilterType.startDate ? toDateISOString(dateFilterType.startDate) : undefined;
  filterData.value.endDate = dateFilterType.endDate ? toDateISOString(dateFilterType.endDate) : undefined;
  selectedDateFilterType.value = dateFilterType;
}

export function useUserOrdersFilter(orderScope?: MaybeRef<OrderScopeType>) {
  const { d, t } = useI18n();
  const { isOrganizationMaintainer } = useUser();

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

  const dateFilterTypes = computed(() => getDateFilterRanges());

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

  const organizationCustomerNames = computed(() =>
    facets.value?.find((item) => item.name === CUSTOMER_NAME_FACET_NAME)?.items?.map((item) => item.label),
  );

  const showCustomerNameFilter = computed(() => {
    const scope = orderScope ? unref(orderScope) : undefined;
    return isOrganizationMaintainer.value && scope === "organization" && !!organizationCustomerNames.value?.length;
  });

  function resetFilters() {
    resetFilterData();
    selectedDateFilterType.value = dateFilterTypes.value[0];
    selectedDateFilterType.value.startDate = undefined;
    selectedDateFilterType.value.endDate = undefined;
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

    if (item.fieldName === "startDate" || item.fieldName === "endDate") {
      selectedDateFilterType.value = dateFilterTypes.value[0];
      selectedDateFilterType.value.startDate = appliedFilterData.value?.startDate;
      selectedDateFilterType.value.endDate = appliedFilterData.value?.endDate;
    }
  }

  return {
    filterData,
    appliedFilterData: computed(() => appliedFilterData.value),
    dateFilterTypes,
    isFilterEmpty,
    isFilterDirty,
    filterChipsItems,
    organizationCustomerNames,
    showCustomerNameFilter,
    applyFilters,
    resetFilters,
    resetFilterData,
    removeFilterChipsItem,
    setFacetsLocalization,
    selectedDateFilterType,
    handleOrdersDateFilterChange,
  };
}
