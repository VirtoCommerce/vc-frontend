<template>
  <!-- Mobile filters -->
  <div v-if="isMobile" class="flex flex-col gap-4 lg:gap-5">
    <VcWidget v-if="!!facets" :title="$t('shared.account.orders-filter.status-label')" size="sm" collapsible>
      <div class="flex flex-col space-y-4">
        <VcCheckbox
          v-for="facet in facets"
          :key="facet.term"
          v-model="filterData.statuses"
          :value="facet.term"
          :class="[{ 'font-bold': isSelectedStatus(facet.term), 'text-gray-500': !isSelectedStatus(facet.term) }]"
        >
          <div class="flex gap-1">
            <div class="min-w-0 grow truncate">{{ facet.label }}</div>
            <VcBadge variant="outline" rounded>{{ facet.count }}</VcBadge>
          </div>
        </VcCheckbox>
      </div>
    </VcWidget>

    <VcWidget :title="$t('shared.account.orders-filter.created-date-label')" size="sm">
      <div class="flex flex-col space-y-3">
        <VcSelect
          v-model="selectedDateFilter"
          :items="dateFilterTypes"
          text-field="label"
          @change="setDateFilterType"
        />

        <template v-if="selectedDateFilter.id === 'custom'">
          <VcDateSelector v-model="filterData.startDate" :label="$t('shared.account.orders-filter.start-date-label')" />
          <VcDateSelector v-model="filterData.endDate" :label="$t('shared.account.orders-filter.end-date-label')" />
        </template>
      </div>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { ref, toRefs } from "vue";
import { toDateISOString } from "@/core/utilities";
import { useUserOrders, useUserOrdersFilter } from "../composables";
import type { DateFilterType } from "@/core/types";

interface IEmits {
  (event: "change", dateFilterType: DateFilterType): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  dateFilterType?: DateFilterType;
}

const { facets } = useUserOrders({});
const { filterData, dateFilterTypes } = useUserOrdersFilter();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const { dateFilterType } = toRefs(props);

const selectedDateFilter = ref<DateFilterType>(dateFilterType.value ?? dateFilterTypes.value[0]);

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}

function setDateFilterType(value: DateFilterType): void {
  if (value.id !== "custom" && !!value.startDate && !!value.endDate) {
    filterData.value.startDate = toDateISOString(value.startDate);
    filterData.value.endDate = toDateISOString(value.endDate);
  }
  emit("change", selectedDateFilter.value);
}
</script>
