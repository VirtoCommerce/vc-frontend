<template>
  <div class="flex flex-col justify-between lg:justify-start">
    <div class="flex flex-col gap-4 space-y-8 lg:flex-row lg:space-y-0">
      <div v-if="!!facets" class="flex w-48 flex-col space-y-4">
        <div class="font-bold uppercase lg:normal-case lg:text-gray-400">
          {{ $t("shared.account.orders-filter.status-label") }}
        </div>
        <VcCheckbox
          v-for="facet in facets"
          :key="facet.term"
          v-model="filterData.statuses"
          :value="facet.term"
          :class="{ 'font-bold': isSelectedStatus(facet.term), 'text-gray-500': !isSelectedStatus(facet.term) }"
        >
          <div class="flex w-full max-w-full gap-1">
            <div class="min-w-0 truncate">{{ facet.label }}</div>
            <VcBadge variant="outline" rounded>{{ facet.count }}</VcBadge>
          </div>
        </VcCheckbox>
      </div>
      <div class="flex w-48 flex-col space-y-3">
        <div class="font-bold uppercase lg:normal-case lg:text-gray-400">
          {{ $t("shared.account.orders-filter.created-date-label") }}
        </div>

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
    </div>
    <div class="grow lg:grow-0"></div>
    <div class="mt-8 flex justify-end gap-3">
      <VcButton
        color="secondary"
        variant="outline"
        :disabled="isFilterEmpty && !isFilterDirty"
        size="sm"
        @click="reset"
      >
        {{ $t("shared.account.orders-filter.reset-button") }}
      </VcButton>

      <VcButton size="sm" :disabled="!isFilterDirty" @click="apply">
        {{ $t("shared.account.orders-filter.apply-button") }}
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "@vueuse/core";
import { ref } from "vue";
import { toDateISOString } from "@/core/utilities";
import { useUserOrders, useUserOrdersFilter } from "../composables";
import type { DateFilterType } from "@/core/types";

interface IEmits {
  (event: "change", dateFilterType: DateFilterType): void;
}

interface IProps {
  dateFilterType?: DateFilterType;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { facets } = useUserOrders({});
const { filterData, applyFilters, resetFilters, isFilterEmpty, isFilterDirty, dateFilterTypes } = useUserOrdersFilter();

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
}

function onChange() {
  emit("change", selectedDateFilter.value);
}

function apply() {
  applyFilters();
  onChange();
}

function reset() {
  resetFilters();
  onChange();
}
</script>
