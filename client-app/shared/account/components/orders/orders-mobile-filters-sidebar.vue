<template>
  <VcPopupSidebar :is-visible="visible" @hide="emit('update:visible', false)">
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
        @click="emit('update:visible', false)"
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
import { toRef } from "vue";
import { useUserOrdersFilter } from "../../composables/useUserOrdersFilter";
import DateFilterSelect from "../date-filter-select.vue";
import MobileOrdersFilter from "../mobile-orders-filter.vue";
import type { OrderScopeType } from "../../types";

interface IProps {
  visible: boolean;
  orderScope: OrderScopeType;
}

interface IEmits {
  (e: "update:visible", value: boolean): void;
}

const emit = defineEmits<IEmits>();
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

function handleApply() {
  applyFilters();
  emit("update:visible", false);
}

function handleReset() {
  resetFilters();
  emit("update:visible", false);
}
</script>
