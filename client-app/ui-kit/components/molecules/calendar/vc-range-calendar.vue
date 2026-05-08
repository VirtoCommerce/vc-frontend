<template>
  <RangeCalendarRoot
    v-slot="{ weekDays, grid }"
    :model-value="parsedModelValue"
    :placeholder="placeholderRef"
    :locale="resolvedLocale"
    :weekday-format="weekdayFormat"
    :week-starts-on="firstDayOfWeek"
    :min-value="minDateValue"
    :max-value="maxDateValue"
    :is-date-unavailable="isDateUnavailable"
    :number-of-months="numberOfMonths"
    fixed-weeks
    :class="rootClasses"
    :data-test-id="dataTestId"
    @update:model-value="onUpdate"
    @update:placeholder="onPlaceholderUpdate"
  >
    <div class="vc-calendar__header">
      <div class="vc-calendar__nav-group">
        <button
          type="button"
          class="vc-calendar__nav"
          :aria-label="t('ui_kit.calendar.previous_year')"
          :disabled="prevYearDisabled"
          :aria-disabled="prevYearDisabled || undefined"
          @click="goToPreviousYear"
        >
          <VcIcon name="chevron-double-left" />
        </button>

        <RangeCalendarPrev class="vc-calendar__nav" :aria-label="t('ui_kit.calendar.previous_month')">
          <VcIcon name="chevron-left" />
        </RangeCalendarPrev>
      </div>

      <RangeCalendarHeading class="vc-calendar__heading" />

      <div class="vc-calendar__nav-group">
        <RangeCalendarNext class="vc-calendar__nav" :aria-label="t('ui_kit.calendar.next_month')">
          <VcIcon name="chevron-right" />
        </RangeCalendarNext>

        <button
          type="button"
          class="vc-calendar__nav"
          :aria-label="t('ui_kit.calendar.next_year')"
          :disabled="nextYearDisabled"
          :aria-disabled="nextYearDisabled || undefined"
          @click="goToNextYear"
        >
          <VcIcon name="chevron-double-right" />
        </button>
      </div>
    </div>

    <RangeCalendarGrid v-for="month in grid" :key="month.value.toString()" class="vc-calendar__grid-wrapper">
      <RangeCalendarGridHead>
        <RangeCalendarGridRow class="vc-calendar__weekrow">
          <RangeCalendarHeadCell v-for="day in weekDays" :key="day" class="vc-calendar__weekday">
            {{ day }}
          </RangeCalendarHeadCell>
        </RangeCalendarGridRow>
      </RangeCalendarGridHead>

      <RangeCalendarGridBody class="vc-calendar__grid">
        <RangeCalendarGridRow
          v-for="(weekDates, weekIndex) in month.rows"
          :key="weekIndex"
          class="vc-calendar__weekrow"
        >
          <RangeCalendarCell
            v-for="weekDate in weekDates"
            :key="weekDate.toString()"
            :date="weekDate"
            class="vc-calendar__cell"
          >
            <RangeCalendarCellTrigger :day="weekDate" :month="month.value" class="vc-calendar__day" />
          </RangeCalendarCell>
        </RangeCalendarGridRow>
      </RangeCalendarGridBody>
    </RangeCalendarGrid>

    <div v-if="showFooter" class="vc-calendar__footer">
      <button type="button" class="vc-calendar__footer-btn" @click="onTodayClick">
        {{ t("ui_kit.calendar.today") }}
      </button>

      <button type="button" class="vc-calendar__footer-btn vc-calendar__footer-btn--ghost" @click="onClearClick">
        {{ t("ui_kit.calendar.clear") }}
      </button>
    </div>
  </RangeCalendarRoot>
</template>

<script setup lang="ts">
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarHeading,
  RangeCalendarNext,
  RangeCalendarPrev,
  RangeCalendarRoot,
} from "reka-ui";
import { computed, toRef, watch } from "vue";
import { dateValueToIso, tryParseDate, useCalendarBase } from "./use-calendar-base";
import type { DateValue } from "@internationalized/date";

interface IProps {
  modelValue?: VcRangeCalendarValueType;
  size?: VcCalendarSizeType;
  min?: string;
  max?: string;
  disabledDate?: VcCalendarDisabledDateType;
  showFooter?: boolean;
  locale?: string;
  firstDayOfWeek?: VcCalendarFirstDayOfWeekType;
  weekdayFormat?: VcCalendarWeekdayFormatType;
  numberOfMonths?: number;
  dataTestId?: string;
}

interface IEmits {
  (event: "update:modelValue", value: VcRangeCalendarValueType): void;
  (event: "change", value: VcRangeCalendarValueType): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  modelValue: undefined,
  size: "md",
  min: undefined,
  max: undefined,
  disabledDate: undefined,
  showFooter: false,
  locale: undefined,
  firstDayOfWeek: undefined,
  weekdayFormat: "short",
  numberOfMonths: 1,
  dataTestId: undefined,
});

function getInitialPlaceholder(): DateValue {
  if (props.modelValue && typeof props.modelValue === "object") {
    const start = tryParseDate(props.modelValue.start);
    if (start) {
      return start;
    }
  }
  return base.todayDate();
}

const base = useCalendarBase({
  size: toRef(props, "size"),
  locale: toRef(props, "locale"),
  min: toRef(props, "min"),
  max: toRef(props, "max"),
  disabledDate: toRef(props, "disabledDate"),
  initialPlaceholder: getInitialPlaceholder,
});

const {
  t,
  placeholderRef,
  resolvedLocale,
  minDateValue,
  maxDateValue,
  isDateUnavailable,
  prevYearDisabled,
  nextYearDisabled,
  onPlaceholderUpdate,
  goToPreviousYear,
  goToNextYear,
} = base;

const rootClasses = computed(() => ["vc-calendar", `vc-calendar--size--${props.size}`, "vc-calendar--mode--range"]);

const parsedModelValue = computed(() => {
  if (!props.modelValue || typeof props.modelValue !== "object") {
    return { start: undefined, end: undefined };
  }
  return {
    start: tryParseDate(props.modelValue.start),
    end: tryParseDate(props.modelValue.end),
  };
});

function onUpdate(value: { start?: DateValue; end?: DateValue } | null | undefined): void {
  const next: VcRangeCalendarValueType = {
    start: dateValueToIso(value?.start),
    end: dateValueToIso(value?.end),
  };
  emit("update:modelValue", next);
  if (next.start && next.end) {
    emit("change", next);
  }
}

function onTodayClick(): void {
  const now = base.todayDate();
  placeholderRef.value = now;
  onUpdate({ start: now, end: undefined });
}

function onClearClick(): void {
  const cleared: VcRangeCalendarValueType = { start: undefined, end: undefined };
  emit("update:modelValue", cleared);
  emit("change", cleared);
}

watch(
  () => props.modelValue,
  (next) => {
    // Sync placeholder to incoming model value so external state changes scroll the view
    if (next && typeof next === "object") {
      const start = tryParseDate(next.start);
      if (start) {
        placeholderRef.value = start;
      }
    }
  },
);
</script>

<style lang="scss" src="./calendar.scss"></style>
