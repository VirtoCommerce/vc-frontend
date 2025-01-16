<template>
  <VcSelect v-model="selectedDateFilter" :items="dateFilterTypes" text-field="label" @change="handleChangeType" />

  <div v-if="selectedDateFilter.id === DateFilterId.CUSTOM" class="flex items-end gap-3 max-lg:flex-col">
    <div class="grow max-lg:w-full">
      <VcDateSelector
        v-model="selectedDateFilter.startDate"
        :label="$t('shared.account.orders_filter.start_date_label')"
        @update:model-value="$emit('change', selectedDateFilter)"
      />
    </div>

    <div class="text-2xl/[2.75rem] max-lg:hidden">&mdash;</div>

    <div class="grow max-lg:w-full">
      <VcDateSelector
        v-model="selectedDateFilter.endDate"
        :label="$t('shared.account.orders_filter.end_date_label')"
        @update:model-value="$emit('change', selectedDateFilter)"
      />
    </div>
  </div>
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
  if (selectedDateFilter.value.id === (DateFilterId.CUSTOM as DateFilterType["id"])) {
    selectedDateFilter.value.startDate = undefined;
    selectedDateFilter.value.endDate = undefined;
  }

  emit("change", selectedDateFilter.value);
}
</script>
