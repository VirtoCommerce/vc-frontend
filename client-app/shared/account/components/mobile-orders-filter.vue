<template>
  <!-- Mobile filters -->
  <div v-if="isMobile" class="mobile-orders-filter">
    <VcWidget v-if="facets?.length" :title="$t('shared.account.orders_filter.status_label')" size="sm" collapsible>
      <VcCheckboxGroup v-model="filterData.statuses" class="mobile-orders-filter__statuses">
        <VcCheckbox v-for="facet in statusFacet?.items" :key="facet.term" :value="facet.term">
          <div
            :class="[
              'mobile-orders-filter__status-content',
              {
                'mobile-orders-filter__status-content--selected': isSelectedStatus(facet.term),
              },
            ]"
          >
            <div class="mobile-orders-filter__status-label">{{ facet.label }}</div>

            <VcBadge variant="outline" size="sm" rounded>{{ facet.count }}</VcBadge>
          </div>
        </VcCheckbox>
      </VcCheckboxGroup>
    </VcWidget>

    <slot name="buyerNameFilterType" />

    <VcWidget :title="$t('shared.account.orders_filter.created_date_label')" size="sm">
      <div class="mobile-orders-filter__date-section">
        <slot name="dateFilterType" />
      </div>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { useUserOrders } from "../composables";
import { useUserOrdersFilter } from "../composables/useUserOrdersFilter";

const { facets } = useUserOrders({});
const { filterData } = useUserOrdersFilter();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const statusFacet = computed(() => facets.value?.find((facet) => facet.name === STATUS_ORDERS_FACET_NAME));

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}
</script>

<style lang="scss">
.mobile-orders-filter {
  @apply flex flex-col gap-4;

  @media (width >= theme("screens.lg")) {
    @apply gap-5;
  }

  &__statuses {
    @apply space-y-4;
  }

  &__status-content {
    @apply flex gap-1 text-neutral;

    &--selected {
      @apply font-bold text-inherit;
    }
  }

  &__status-label {
    @apply min-w-0 grow truncate;
  }

  &__date-section {
    @apply flex flex-col space-y-3;
  }
}
</style>
