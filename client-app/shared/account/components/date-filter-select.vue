<template>
  <VcSelect v-model="selectedDateFilter" :items="dateFilterTypes" text-field="label" @change="handleChangeType" />

  <template v-if="selectedDateFilter.id === DateFilterId.CUSTOM">
    <VcDateSelector
      v-model="selectedDateFilter.startDate"
      :label="$t('shared.account.orders_filter.start_date_label')"
      @update:model-value="$emit('change', selectedDateFilter)"
    />

    <VcDateSelector
      v-model="selectedDateFilter.endDate"
      :label="$t('shared.account.orders_filter.end_date_label')"
      @update:model-value="$emit('change', selectedDateFilter)"
    />
  </template>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue";
import { DateFilterId } from "@/core/enums";
import { useUserOrdersFilter } from "../composables";
import type { DateFilterType } from "@/core/types";

interface IEmits {
  (event: "change", dateFilterType: DateFilterType): void;
}

interface IProps {
  dateFilterType?: DateFilterType;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { dateFilterTypes } = useUserOrdersFilter();

const { dateFilterType } = toRefs(props);

const selectedDateFilter = ref<DateFilterType>(dateFilterType.value ?? dateFilterTypes.value[0]);

function handleChangeType(): void {
  if (selectedDateFilter.value.id === DateFilterId.CUSTOM) {
    selectedDateFilter.value.startDate = undefined;
    selectedDateFilter.value.endDate = undefined;
  }

  emit("change", selectedDateFilter.value);
}
</script>
