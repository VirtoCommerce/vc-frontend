<template>
  <div class="flex flex-col">
    <div class="flex flex-col lg:flex-row lg:space-x-14">
      <div v-if="availableStatuses.length" class="flex flex-col space-y-4">
        <div class="font-bold text-gray-400">Status filter</div>
        <VcCheckbox
          :class="{ 'font-bold': isSelectedStatus(status) }"
          v-for="status in availableStatuses"
          :key="status"
          v-model="statuses"
          :value="status"
        >
          {{ status }}
        </VcCheckbox>
      </div>
      <div class="flex flex-col space-y-2">
        <div class="font-bold text-gray-400">Created date</div>
        <div>
          <VcDateSelector v-model="startDate" label="Start date"></VcDateSelector>
        </div>
        <div>
          <VcDateSelector v-model="endDate" label="End date"></VcDateSelector>
        </div>
      </div>
    </div>
    <div class="mt-8 flex justify-end space-x-3">
      <VcButton class="uppercase px-8" kind="secondary" is-outline size="sm" @click="resetFilters">{{
        $t("common.buttons.reset")
      }}</VcButton>
      <VcButton class="uppercase px-8" size="sm" @click="applyFilters">Apply</VcButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { VcCheckbox, VcDateSelector, VcButton } from "@/components";
import { cfg } from "@/core/utilities";
import { PropType, toRef } from "vue";
import { OrdersFilterData } from "../types";

const availableStatuses = cfg?.orders_statuses || [];

function isSelectedStatus(status: string) {
  return statuses.value.indexOf(status) !== -1;
}

const props = defineProps({
  value: {
    type: Object as PropType<OrdersFilterData>,
    required: true,
  },
});

const statuses = toRef(props.value, "statuses");
const startDate = toRef(props.value, "startDate");
const endDate = toRef(props.value, "endDate");

const emit = defineEmits<{ (e: "change", filter: OrdersFilterData): void }>();

function onChange() {
  const eventPayload: OrdersFilterData = {
    statuses: statuses.value,
    startDate: startDate?.value,
    endDate: endDate?.value,
  };

  emit("change", eventPayload);
}

function applyFilters() {
  onChange();
}

function resetFilters() {
  statuses.value = [];
  startDate.value = undefined;
  endDate.value = undefined;
  onChange();
}
</script>
