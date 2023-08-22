<template>
  <div class="flex flex-col justify-between lg:justify-start">
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-14 lg:space-y-0">
      <div v-if="availableStatuses.length" class="flex flex-col space-y-4">
        <div class="font-bold uppercase lg:normal-case lg:text-gray-400">
          {{ $t("shared.account.orders-filter.status-label") }}
        </div>
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
      <div class="flex flex-col space-y-3">
        <div class="font-bold uppercase lg:normal-case lg:text-gray-400">
          {{ $t("shared.account.orders-filter.created-date-label") }}
        </div>
        <div>
          <VcDateSelector v-model="filterData.startDate" :label="$t('shared.account.orders-filter.start-date-label')" />
        </div>
        <div>
          <VcDateSelector v-model="filterData.endDate" :label="$t('shared.account.orders-filter.end-date-label')" />
        </div>
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
import { inject } from "vue";
import { configInjectionKey } from "@/core/injection-keys";
import { useUserOrdersFilter } from "../composables";

interface IEmits {
  (event: "change"): void;
}

const emit = defineEmits<IEmits>();

const config = inject(configInjectionKey);

const { filterData, applyFilters, resetFilters, isFilterEmpty, isFilterDirty } = useUserOrdersFilter();

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
