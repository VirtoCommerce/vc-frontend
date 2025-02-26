<template>
  <!-- Mobile filters -->
  <div v-if="isMobile" class="flex flex-col gap-4 lg:gap-5">
    <VcWidget v-if="!!facets" :title="$t('shared.account.orders_filter.status_label')" size="sm" collapsible>
      <VcCheckboxGroup v-model="filterData.statuses" class="space-y-4">
        <VcCheckbox
          v-for="facet in statusFacet?.items"
          :key="facet.term"
          :value="facet.term"
          :class="[{ 'font-bold': isSelectedStatus(facet.term), 'text-neutral': !isSelectedStatus(facet.term) }]"
        >
          <div class="flex gap-1">
            <div class="min-w-0 grow truncate">{{ facet.label }}</div>
            <VcBadge variant="outline" rounded>{{ facet.count }}</VcBadge>
          </div>
        </VcCheckbox>
      </VcCheckboxGroup>
    </VcWidget>

    <VcWidget title="Buyer name" size="sm">
      <slot name="buyerNameFilterType" />
    </VcWidget>

    <VcWidget :title="$t('shared.account.orders_filter.created_date_label')" size="sm">
      <div class="flex flex-col space-y-3">
        <slot name="dateFilterType" />
      </div>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { useUserOrders, useUserOrdersFilter } from "../composables";

const { facets } = useUserOrders({});
const { filterData } = useUserOrdersFilter();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const statusFacet = computed(() => facets.value?.find((facet) => facet.name === STATUS_ORDERS_FACET_NAME));

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}
</script>
