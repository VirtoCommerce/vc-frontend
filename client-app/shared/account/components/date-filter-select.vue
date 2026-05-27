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

    <template v-if="selectedDateFilter.id === DateFilterId.CUSTOM">
      <div class="date-filter-select__range">
        <VcDatePicker
          v-model="selectedDateFilter.startDate"
          class="date-filter-select__date"
          :label="$t('shared.account.orders_filter.start_date_label')"
          :error="showRangeError"
          mask
          enable-teleport
          @update:model-value="$emit('change', selectedDateFilter)"
          @update:valid="startValid = $event"
        />

        <div class="date-filter-select__separator">&mdash;</div>

        <VcDatePicker
          v-model="selectedDateFilter.endDate"
          class="date-filter-select__date"
          :label="$t('shared.account.orders_filter.end_date_label')"
          :error="showRangeError"
          mask
          enable-teleport
          @update:model-value="$emit('change', selectedDateFilter)"
          @update:valid="endValid = $event"
        />
      </div>

      <VcInputDetails
        show-empty
        :message="showRangeError ? $t('shared.account.orders_filter.invalid_range') : undefined"
        error
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from "vue";
import { DateFilterId } from "@/core/enums";
import { useUserOrdersFilter } from "../composables/useUserOrdersFilter";
import type { DateFilterType } from "@/core/types";

interface IEmits {
  (event: "change", dateFilterType: DateFilterType): void;
  (event: "update:valid", value: boolean): void;
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

// Per-input format validity from the date pickers. Default true — empty inputs are valid.
const startValid = ref(true);
const endValid = ref(true);

// Start must not be after end; empty/partial ranges are valid.
const isRangeOrderValid = computed(() => {
  const { startDate, endDate } = selectedDateFilter.value;
  if (!startDate || !endDate) {
    return true;
  }
  return new Date(startDate).getTime() <= new Date(endDate).getTime();
});

const showRangeError = computed(
  () => !isRangeOrderValid.value && !!selectedDateFilter.value.startDate && !!selectedDateFilter.value.endDate,
);

const isDateRangeValid = computed(() => startValid.value && endValid.value && isRangeOrderValid.value);

// Immediate to seed the valid mount state.
watch(isDateRangeValid, (valid) => emit("update:valid", valid), { immediate: true });

function handleChangeType(): void {
  if (selectedDateFilter.value.id === (DateFilterId.CUSTOM as DateFilterType["id"])) {
    selectedDateFilter.value.startDate = undefined;
    selectedDateFilter.value.endDate = undefined;
  } else {
    // Pickers are unmounted and won't re-emit validity, so reset it here.
    startValid.value = true;
    endValid.value = true;
  }

  emit("change", selectedDateFilter.value);
}
</script>

<style lang="scss">
.date-filter-select {
  @apply flex flex-col;

  &__range {
    @apply flex items-end mt-3 gap-3;

    @media (width < theme("screens.lg")) {
      @apply flex-col mt-4;
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
