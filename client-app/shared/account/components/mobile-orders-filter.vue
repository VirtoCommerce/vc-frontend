<template>
  <!-- Mobile filters -->
  <div v-if="isMobile" class="flex flex-col gap-4 lg:gap-5">
    <VcWidget
      v-if="availableStatuses.length"
      :title="$t('shared.account.orders-filter.status-label')"
      size="sm"
      collapsible
    >
      <div class="flex flex-col space-y-4">
        <VcCheckbox
          v-for="status in availableStatuses"
          :key="status.code"
          v-model="filterData.statuses"
          :value="status.code"
          :class="{ 'font-bold': isSelectedStatus(status.code), 'text-gray-500': !isSelectedStatus(status.code) }"
        >
          {{ status.code }}
        </VcCheckbox>
      </div>
    </VcWidget>

    <VcWidget :title="$t('shared.account.orders-filter.created-date-label')" size="sm">
      <div class="flex flex-col space-y-3">
        <div>
          <VcDateSelector v-model="filterData.startDate" :label="$t('shared.account.orders-filter.start-date-label')" />
        </div>
        <div>
          <VcDateSelector v-model="filterData.endDate" :label="$t('shared.account.orders-filter.end-date-label')" />
        </div>
      </div>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { inject } from "vue";
import { configInjectionKey } from "@/core/injection-keys";
import { useUserOrdersFilter } from "../composables";

const config = inject(configInjectionKey);

const { filterData } = useUserOrdersFilter();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const availableStatuses = config?.orders_statuses || [];

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}
</script>
