<template>
  <!-- Mobile filters -->
  <div v-if="isMobile" class="flex flex-col gap-4 lg:gap-5">
    <VcCard
      v-if="availableStatuses.length"
      :title="$t('shared.account.orders-filter.status-label')"
      is-collapsible
      shadow
    >
      <div class="flex flex-col space-y-4">
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
    </VcCard>

    <VcCard :title="$t('shared.account.orders-filter.created-date-label')" shadow>
      <div class="flex flex-col space-y-3">
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
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { inject } from "vue";
import { configInjectionKey } from "@/core/injection-keys";
import { useUserOrdersFilter } from "@/shared/account/";

const config = inject(configInjectionKey);

const { filterData } = useUserOrdersFilter();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const availableStatuses = config?.orders_statuses || [];

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}
</script>
