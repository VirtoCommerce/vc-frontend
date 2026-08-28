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

    <VcDateRangePicker
      v-if="selectedDateFilter.id === DateFilterId.CUSTOM"
      v-model="range"
      class="date-filter-select__range"
      mask
      enable-teleport
      show-empty-details
      show-footer
      :layout="layout"
      :label="combinedLabel"
      :start-label="$t('shared.account.orders_filter.start_date_label')"
      :end-label="$t('shared.account.orders_filter.end_date_label')"
      @update:valid="rangeValid = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
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
  layout?: VcDateRangePickerLayoutType;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  layout: "combined",
});

const { t } = useI18n();

const { dateFilterTypes } = useUserOrdersFilter();

const { dateFilterType } = toRefs(props);

const selectedDateFilter = ref<DateFilterType>(dateFilterType.value ?? dateFilterTypes.value[0]);

// An empty range is valid.
const rangeValid = ref(true);

// "combined" turns startLabel/endLabel into aria-labels, so its one visible label has to name the pair.
// "split" already labels each field, so a group label there would only repeat them.
const combinedLabel = computed(() =>
  props.layout === "combined" ? t("shared.account.orders_filter.date_range_label") : undefined,
);

const range = computed<VcDateRangeType | undefined>({
  get() {
    const { startDate, endDate } = selectedDateFilter.value;
    // Collapsed to undefined for an empty range, as the picker's own merge does.
    return startDate || endDate ? { start: startDate, end: endDate } : undefined;
  },
  set(value) {
    selectedDateFilter.value.startDate = value?.start;
    selectedDateFilter.value.endDate = value?.end;
    // Emitted here, not from a template listener, so it always runs after the setter.
    emit("change", selectedDateFilter.value);
  },
});

// Not immediate: the picker reports its own validity as it mounts, so announcing the seed first would
// claim an out-of-order range is valid. Consumers hold the same default until that first report.
watch(rangeValid, (valid) => emit("update:valid", valid));

function handleChangeType(): void {
  if (selectedDateFilter.value.id === (DateFilterId.CUSTOM as DateFilterType["id"])) {
    selectedDateFilter.value.startDate = undefined;
    selectedDateFilter.value.endDate = undefined;
  } else {
    // The picker is unmounted and won't re-emit validity.
    rangeValid.value = true;
  }

  emit("change", selectedDateFilter.value);
}
</script>

<style lang="scss">
.date-filter-select {
  @apply flex flex-col;

  &__range {
    @apply mt-3;

    @media (width < theme("screens.lg")) {
      @apply mt-4;
    }
  }
}
</style>
