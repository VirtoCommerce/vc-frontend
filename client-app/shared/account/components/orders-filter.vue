<template>
  <div class="flex flex-col justify-between lg:justify-start">
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-14 lg:space-y-0">
      <div v-if="availableStatuses.length" class="flex flex-col space-y-4">
        <div class="font-extrabold uppercase lg:normal-case lg:text-gray-400">Status</div>
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
      <div class="flex flex-col space-y-3">
        <div class="font-extrabold uppercase lg:normal-case lg:text-gray-400">Created date</div>
        <div>
          <VcDateSelector v-model="startDate" label="Start date"></VcDateSelector>
        </div>
        <div>
          <VcDateSelector v-model="endDate" label="End date"></VcDateSelector>
        </div>
      </div>
    </div>
    <div class="flex-grow lg:flex-grow-0"></div>
    <div class="mt-8 flex flex-col lg:flex-row-reverse space-y-4 lg:justify-start lg:space-y-0">
      <VcButton class="uppercase px-8 w-full lg:w-auto" :size="isMobile ? 'md' : 'sm'" @click="applyFilters"
        >Apply</VcButton
      >
      <VcButton
        class="uppercase px-8 w-full lg:w-auto lg:mr-3"
        kind="secondary"
        is-outline
        :size="isMobile ? 'md' : 'sm'"
        @click="resetFilters"
        >{{ $t("common.buttons.reset") }}</VcButton
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { VcCheckbox, VcDateSelector, VcButton } from "@/components";
import { cfg } from "@/core/utilities";
import { PropType, toRef } from "vue";
import { OrdersFilterData } from "../types";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

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
