<template>
  <div class="returns-filter-fields">
    <VcSelect
      v-model="selectedRange"
      :label="$t('returns.filters.created_date')"
      :items="ranges"
      text-field="label"
      enable-teleport
      @change="applyRange"
    />

    <template v-if="selectedRange.id === CUSTOM_RANGE_ID">
      <div class="returns-filter-fields__range">
        <VcDatePicker
          :model-value="modelValue.startDate"
          class="returns-filter-fields__date"
          :label="$t('returns.filters.start_date')"
          :error="showRangeError"
          mask
          enable-teleport
          @update:model-value="patch({ startDate: $event })"
          @update:valid="startValid = $event"
        />

        <div class="returns-filter-fields__separator">&mdash;</div>

        <VcDatePicker
          :model-value="modelValue.endDate"
          class="returns-filter-fields__date"
          :label="$t('returns.filters.end_date')"
          :error="showRangeError"
          mask
          enable-teleport
          @update:model-value="patch({ endDate: $event })"
          @update:valid="endValid = $event"
        />
      </div>

      <VcInputDetails show-empty error :message="showRangeError ? $t('returns.filters.invalid_range') : undefined" />
    </template>

    <div v-if="statuses.length" class="returns-filter-fields__statuses">
      <VcLabel>{{ $t("returns.filters.status") }}</VcLabel>

      <VcCheckboxGroup
        :model-value="modelValue.statuses"
        class="returns-filter-fields__status-list"
        @update:model-value="patch({ statuses: $event as string[] })"
      >
        <VcCheckbox v-for="status in statuses" :key="status.code" :value="status.code">
          {{ status.label }}
        </VcCheckbox>
      </VcCheckboxGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { toLocalDateOnly } from "@/core/utilities/date";
import type { ReturnStatusOptionType, ReturnsFilterDataType } from "@/modules/returns/types";

interface IProps {
  modelValue: ReturnsFilterDataType;
  statuses: ReturnStatusOptionType[];
}

interface IEmits {
  (event: "update:modelValue", value: ReturnsFilterDataType): void;
  (event: "update:valid", value: boolean): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { t } = useI18n();

const CUSTOM_RANGE_ID = "custom";

type RangeType = { id: string; label: string; startDate?: string; endDate?: string };

const ranges = computed<RangeType[]>(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const from = (shift: (date: Date) => void): string => {
    const date = new Date(today);
    shift(date);
    return toLocalDateOnly(date);
  };

  return [
    { id: CUSTOM_RANGE_ID, label: t("returns.filters.custom_date") },
    {
      id: "lastDay",
      label: t("returns.filters.last_day"),
      startDate: from((date) => date.setDate(date.getDate() - 1)),
      endDate: toLocalDateOnly(today),
    },
    {
      id: "lastWeek",
      label: t("returns.filters.last_week"),
      startDate: from((date) => date.setDate(date.getDate() - 7)),
      endDate: toLocalDateOnly(today),
    },
    {
      id: "lastMonth",
      label: t("returns.filters.last_month"),
      startDate: from((date) => date.setMonth(date.getMonth() - 1)),
      endDate: toLocalDateOnly(today),
    },
    {
      id: "lastYear",
      label: t("returns.filters.last_year"),
      startDate: from((date) => date.setFullYear(date.getFullYear() - 1)),
      endDate: toLocalDateOnly(today),
    },
  ];
});

const selectedRange = ref<RangeType>(ranges.value[0]);

const startValid = ref(true);
const endValid = ref(true);

const isRangeOrderValid = computed(() => {
  const { startDate, endDate } = props.modelValue;

  if (!startDate || !endDate) {
    return true;
  }

  return new Date(startDate).getTime() <= new Date(endDate).getTime();
});

const showRangeError = computed(
  () => !isRangeOrderValid.value && Boolean(props.modelValue.startDate) && Boolean(props.modelValue.endDate),
);

function applyRange(range: RangeType): void {
  startValid.value = true;
  endValid.value = true;

  patch(
    range.id === CUSTOM_RANGE_ID
      ? { startDate: undefined, endDate: undefined }
      : { startDate: range.startDate, endDate: range.endDate },
  );
}

function patch(value: Partial<ReturnsFilterDataType>): void {
  emit("update:modelValue", { ...props.modelValue, ...value });
}

watch([startValid, endValid, isRangeOrderValid], ([start, end, order]) => emit("update:valid", start && end && order), {
  immediate: true,
});

// A reset elsewhere clears the dates, so the preset must stop claiming a range is still selected.
watch(
  () => !props.modelValue.startDate && !props.modelValue.endDate,
  (cleared) => {
    if (cleared) {
      selectedRange.value = ranges.value[0];
    }
  },
);
</script>

<style lang="scss">
.returns-filter-fields {
  @apply flex flex-col;

  &__range {
    @apply mt-3 flex items-end gap-3;

    @media (width < theme("screens.lg")) {
      @apply mt-4 flex-col;
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

  &__statuses {
    @apply mt-4;
  }

  &__status-list {
    @apply mt-2 space-y-3.5;
  }
}
</style>
