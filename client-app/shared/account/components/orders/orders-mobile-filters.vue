<template>
  <VcButton :disabled="loading" icon @click="filtersVisible = true">
    <VcIcon name="filter" />

    <span>{{ $t("common.buttons.filters") }}</span>
  </VcButton>

  <VcPopupSidebar :is-visible="filtersVisible" @hide="filtersVisible = false">
    <MobileOrdersFilter>
      <template #buyerNameFilterType>
        <VcWidget v-if="showCustomerNameFilter" :title="$t('common.labels.buyer_name')" size="sm">
          <VcSelect v-model="filterData.customerNames" :items="organizationCustomerNames ?? []" multiple />
        </VcWidget>
      </template>

      <template #dateFilterType>
        <DateFilterSelect :date-filter-type="selectedDateFilterType" @change="handleOrdersDateFilterChange" />
      </template>
    </MobileOrdersFilter>

    <template #footer>
      <VcButton
        :disabled="isFilterEmpty && !isFilterDirty"
        class="me-auto"
        color="secondary"
        variant="outline"
        size="sm"
        icon="reset"
        :title="$t('common.buttons.reset')"
        @click="handleReset"
      />

      <VcButton
        :disabled="isFilterEmpty && !isFilterDirty"
        variant="outline"
        size="sm"
        min-width="6.25rem"
        @click="filtersVisible = false"
      >
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton :disabled="!isFilterDirty" size="sm" min-width="6.25rem" @click="handleApply">
        {{ $t("common.buttons.apply") }}
      </VcButton>
    </template>
  </VcPopupSidebar>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue";
import { useUserOrdersFilter } from "../../composables/useUserOrdersFilter";
import DateFilterSelect from "../date-filter-select.vue";
import MobileOrdersFilter from "../mobile-orders-filter.vue";
import type { OrderScopeType } from "../../types";

interface IProps {
  orderScope: OrderScopeType;
  loading: boolean;
}

const props = defineProps<IProps>();

const {
  filterData,
  isFilterEmpty,
  isFilterDirty,
  organizationCustomerNames,
  showCustomerNameFilter,
  applyFilters,
  resetFilters,
  selectedDateFilterType,
  handleOrdersDateFilterChange,
} = useUserOrdersFilter(toRef(() => props.orderScope));

const filtersVisible = ref(false);

function handleApply() {
  applyFilters();
  filtersVisible.value = false;
}

function handleReset() {
  resetFilters();
  filtersVisible.value = false;
}
</script>
