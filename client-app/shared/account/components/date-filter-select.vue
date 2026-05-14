<template>
  <div class="date-filter-select">
    <VcSelect
      v-model="selectedDateFilter"
      :label="label"
      :items="dateFilterTypes"
      text-field="label"
      enable-teleport
      @change="handleChangeType"
    />

    <div v-if="selectedDateFilter.id === DateFilterId.CUSTOM" class="date-filter-select__custom">
      <VcDatePicker
        v-model="selectedDateFilter.startDate"
        class="date-filter-select__date"
        :label="$t('shared.account.orders_filter.start_date_label')"
        :max="selectedDateFilter.endDate"
        mask
        enable-teleport
        @update:model-value="$emit('change', selectedDateFilter)"
      />

      <div class="date-filter-select__separator">&mdash;</div>

      <VcDatePicker
        v-model="selectedDateFilter.endDate"
        class="date-filter-select__date"
        :label="$t('shared.account.orders_filter.end_date_label')"
        :min="selectedDateFilter.startDate"
        mask
        enable-teleport
        @update:model-value="$emit('change', selectedDateFilter)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue";
import { DateFilterId } from "@/core/enums";
import { useUserOrdersFilter } from "../composables/useUserOrdersFilter";
import type { DateFilterType } from "@/core/types";

interface IEmits {
  (event: "change", dateFilterType: DateFilterType): void;
}

interface IProps {
  dateFilterType?: DateFilterType;
  label?: string;
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

<style lang="scss">
.date-filter-select {
  @apply flex flex-col gap-3;

  @media (width >= theme("screens.lg")) {
    @apply gap-5;
  }

  &__custom {
    @apply flex items-end gap-3;

    @media (width < theme("screens.lg")) {
      @apply flex-col;
    }
  }

  &__date {
    @apply grow;

    @media (width < theme("screens.lg")) {
      @apply w-full;
    }
  }

  &__separator {
    @apply text-2xl/[2.75rem];

    @media (width < theme("screens.lg")) {
      @apply hidden;
    }
  }
}
</style>
