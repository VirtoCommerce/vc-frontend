<template>
  <div class="flex flex-col justify-between lg:justify-start">
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-14 lg:space-y-0">
      <div v-if="availableStatuses.length" class="flex flex-col space-y-4">
        <div class="font-bold uppercase lg:normal-case lg:text-gray-400">
          {{ $t("shared.account.orders-filter.status-label") }}
        </div>
        <VcCheckbox
          :class="{ 'font-bold': isSelectedStatus(status), 'text-gray-500': !isSelectedStatus(status) }"
          v-for="status in availableStatuses"
          :key="status"
          v-model="filterData.statuses"
          :value="status"
        >
          {{ status }}
        </VcCheckbox>
      </div>
      <div class="flex flex-col space-y-3">
        <div class="font-bold uppercase lg:normal-case lg:text-gray-400">
          {{ $t("shared.account.orders-filter.created-date-label") }}
        </div>
        <div>
          <VcDateSelector
            v-model="filterData.startDate"
            :label="$t('shared.account.orders-filter.start-date-label')"
          ></VcDateSelector>
        </div>
        <div>
          <VcDateSelector
            v-model="filterData.endDate"
            :label="$t('shared.account.orders-filter.end-date-label')"
          ></VcDateSelector>
        </div>
      </div>
    </div>
    <div class="flex-grow lg:flex-grow-0"></div>
    <div class="mt-8 flex flex-col lg:flex-row-reverse space-y-4 lg:justify-start lg:space-y-0">
      <VcButton
        class="uppercase px-8 w-full lg:w-auto"
        :size="isMobile ? 'md' : 'sm'"
        :is-disabled="!isFilterDirty"
        @click="apply"
        >{{ $t("shared.account.orders-filter.apply-button") }}</VcButton
      >
      <VcButton
        class="uppercase px-8 w-full lg:w-auto lg:mr-3"
        kind="secondary"
        is-outline
        :is-disabled="isFilterEmpty && !isFilterDirty"
        :size="isMobile ? 'md' : 'sm'"
        @click="reset"
        >{{ $t("shared.account.orders-filter.reset-button") }}</VcButton
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject } from "vue";
import { configInjectionKey } from "@core/injection-keys";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useUserOrdersFilter } from "@/shared/account/";

const config = inject(configInjectionKey);

const { filterData, applyFilters, resetFilters, isFilterEmpty, isFilterDirty } = useUserOrdersFilter();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const availableStatuses = config?.orders_statuses || [];

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}

const emit = defineEmits(["change"]);

function onChange() {
  emit("change");
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
