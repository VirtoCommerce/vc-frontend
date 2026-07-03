<template>
  <VcPopover placement="bottom-end" class="orders-desktop-filters" :offset-options="8" :disabled="loading" lazy>
    <template #default="{ triggerProps }">
      <VcButton :disabled="loading" variant="outline" v-bind="triggerProps">
        <VcIcon name="filter" />

        <span>{{ $t("common.buttons.filters") }}</span>
      </VcButton>
    </template>

    <template #content="{ close }">
      <OrdersFilter
        :is-date-range-valid="isDateRangeValid"
        @apply="
          applyFilters();
          close();
        "
        @reset="
          resetFilters();
          close();
        "
        @close="close"
      >
        <DateFilterSelect
          :date-filter-type="selectedDateFilterType"
          :label="$t('shared.account.orders_filter.created_date_label')"
          @change="handleOrdersDateFilterChange"
          @update:valid="isDateRangeValid = $event"
        />

        <VcSelect
          v-if="showCustomerNameFilter"
          v-model="filterData.customerNames"
          :label="$t('common.labels.buyer_name')"
          :items="organizationCustomerNames ?? []"
          multiple
          enable-teleport
        />
      </OrdersFilter>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue";
import { useUserOrdersFilter } from "../../composables/useUserOrdersFilter";
import DateFilterSelect from "../date-filter-select.vue";
import OrdersFilter from "../orders-filter.vue";
import type { OrderScopeType } from "../../types";

interface IProps {
  orderScope: OrderScopeType;
  loading: boolean;
}

const props = defineProps<IProps>();

const {
  filterData,
  selectedDateFilterType,
  handleOrdersDateFilterChange,
  applyFilters,
  resetFilters,
  showCustomerNameFilter,
  organizationCustomerNames,
} = useUserOrdersFilter(toRef(() => props.orderScope));

// Default true — empty inputs are valid; updated via DateFilterSelect's update:valid.
const isDateRangeValid = ref(true);
</script>
