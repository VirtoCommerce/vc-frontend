<template>
  <CalendarRoot
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

        <CalendarPrev class="vc-calendar__nav" :aria-label="t('ui_kit.calendar.previous_month')">
          <VcIcon name="chevron-left" />
        </CalendarPrev>
      </div>

      <CalendarHeading class="vc-calendar__heading" />

      <div class="vc-calendar__nav-group">
        <CalendarNext class="vc-calendar__nav" :aria-label="t('ui_kit.calendar.next_month')">
          <VcIcon name="chevron-right" />
        </CalendarNext>

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

    <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="vc-calendar__grid-wrapper">
      <CalendarGridHead>
        <CalendarGridRow class="vc-calendar__weekrow">
          <CalendarHeadCell v-for="day in weekDays" :key="day" class="vc-calendar__weekday">
            {{ day }}
          </CalendarHeadCell>
        </CalendarGridRow>
      </CalendarGridHead>

      <CalendarGridBody class="vc-calendar__grid">
        <CalendarGridRow v-for="(weekDates, weekIndex) in month.rows" :key="weekIndex" class="vc-calendar__weekrow">
          <CalendarCell
            v-for="weekDate in weekDates"
            :key="weekDate.toString()"
            :date="weekDate"
            class="vc-calendar__cell"
          >
            <CalendarCellTrigger :day="weekDate" :month="month.value" class="vc-calendar__day" />
          </CalendarCell>
        </CalendarGridRow>
      </CalendarGridBody>
    </CalendarGrid>

    <div v-if="showFooter" class="vc-calendar__footer">
      <button type="button" class="vc-calendar__footer-btn" @click="onTodayClick">
        {{ t("ui_kit.calendar.today") }}
      </button>

      <button type="button" class="vc-calendar__footer-btn vc-calendar__footer-btn--ghost" @click="onClearClick">
        {{ t("ui_kit.calendar.clear") }}
      </button>
    </div>
  </CalendarRoot>
</template>

<script setup lang="ts">
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
} from "reka-ui";
import { computed, toRef, watch } from "vue";
import { dateValueToIso, todayDate, tryParseDate, useCalendarBase } from "./use-calendar-base";
import type { DateValue } from "@internationalized/date";

interface IProps {
  modelValue?: VcCalendarValueType;
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
  (event: "update:modelValue", value: VcCalendarValueType): void;
  (event: "change", value: VcCalendarValueType): void;
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
  if (typeof props.modelValue === "string") {
    const parsed = tryParseDate(props.modelValue);
    if (parsed) {
      return parsed;
    }
  }
  return todayDate();
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

const rootClasses = computed(() => ["vc-calendar", `vc-calendar--size--${props.size}`, "vc-calendar--mode--single"]);

const parsedModelValue = computed<DateValue | undefined>(() => {
  if (typeof props.modelValue !== "string") {
    return undefined;
  }
  return tryParseDate(props.modelValue);
});

function onUpdate(value: DateValue | DateValue[] | undefined): void {
  // Single mode only ever yields a single DateValue (or undefined)
  const single = Array.isArray(value) ? value[0] : value;
  const iso = dateValueToIso(single);
  emit("update:modelValue", iso);
  emit("change", iso);
}

function onTodayClick(): void {
  const now = todayDate();
  placeholderRef.value = now;
  onUpdate(now);
}

function onClearClick(): void {
  emit("update:modelValue", undefined);
  emit("change", undefined);
}

watch(
  () => props.modelValue,
  (next) => {
    // Sync placeholder to incoming model value so external state changes scroll the view
    if (typeof next === "string") {
      const parsed = tryParseDate(next);
      if (parsed) {
        placeholderRef.value = parsed;
      }
    }
  },
);
</script>

<style lang="scss" src="./vc-calendar.scss"></style>
