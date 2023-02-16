<template>
  <div class="flex flex-col justify-between lg:justify-start">
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-14 lg:space-y-0">
      <div v-if="availableStatuses.length" class="flex flex-col space-y-4">
        <div class="font-bold uppercase lg:normal-case lg:text-gray-400">
          {{ $t("shared.account.orders-filter.status-label") }}
        </div>
        <VcCheckbox
          v-for="status in availableStatuses"
          :key="status"
          v-model="filterData.statuses"
          :value="status"
          :class="{ 'font-bold': isSelectedStatus(status), 'text-gray-500': !isSelectedStatus(status) }"
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
    <div class="grow lg:grow-0"></div>
    <div class="mt-8 flex flex-col space-y-4 lg:flex-row-reverse lg:justify-start lg:space-y-0">
      <VcButton
        class="w-full px-8 uppercase lg:w-auto"
        :size="isMobile ? 'md' : 'sm'"
        :is-disabled="!isFilterDirty"
        @click="apply"
        >{{ $t("shared.account.orders-filter.apply-button") }}</VcButton
      >
      <VcButton
        class="w-full px-8 uppercase lg:mr-3 lg:w-auto"
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
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { inject } from "vue";
import { configInjectionKey } from "@/core/constants";
import { useUserOrdersFilter } from "@/shared/account/";

const emit = defineEmits(["change"]);

const config = inject(configInjectionKey);

const { filterData, applyFilters, resetFilters, isFilterEmpty, isFilterDirty } = useUserOrdersFilter();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const availableStatuses = config?.orders_statuses || [];

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}

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
