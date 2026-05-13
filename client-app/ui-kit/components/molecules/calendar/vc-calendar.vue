<template>
  <!--
    role="group" legalizes aria-label on reka's root <div> (axe aria-prohibited-attr).
    Calendar-internal keyboard nav stays with reka's <table role="grid">, so role="application"
    would be wrong — it strips browse-mode from screen readers unnecessarily.
  -->
  <CalendarRoot
    v-slot="{ weekDays, grid }"
    role="group"
    :calendar-label="t('ui_kit.calendar.aria_label')"
    :model-value="parsedModelValue"
    :placeholder="placeholderRef"
    :locale="resolvedLocale"
    :weekday-format="weekdayFormat"
    :week-starts-on="firstDayOfWeek"
    :min-value="minDateValue"
    :max-value="maxDateValue"
    :is-date-unavailable="isDateUnavailable"
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

<style lang="scss">
.vc-calendar {
  --radius: var(--vc-calendar-radius, var(--vc-radius, 0.75rem));
  --day-radius: var(--vc-calendar-day-radius, var(--vc-radius, 0.375rem));
  --focus-ring: rgb(from var(--color-primary-500) r g b / 0.35);

  --bg-color: var(--color-additional-50);
  --border-color: var(--color-neutral-200);
  --text-color: var(--color-neutral-800);

  $self: &;
  $disabled: "";
  $unavailable: "";
  $today: "";
  $outside: "";

  @apply inline-flex flex-col w-fit p-3 gap-2 bg-[--bg-color] text-[--text-color] border border-[--border-color] rounded-[--radius];

  font-family:
    "Lato",
    system-ui,
    -apple-system,
    sans-serif;

  &--size {
    &--md {
      --cell-size: 2.5rem;
      --cell-text: 0.875rem;
      --heading-text: 1rem;
      --weekday-text: 0.75rem;
      --grid-gap: 0.125rem;
    }

    &--sm {
      --cell-size: 2rem;
      --cell-text: 0.75rem;
      --heading-text: 0.875rem;
      --weekday-text: 0.625rem;
      --grid-gap: 0.125rem;

      @apply p-2 gap-1.5;
    }

    &--xs {
      --cell-size: 1.75rem;
      --cell-text: 0.6875rem;
      --heading-text: 0.8125rem;
      --weekday-text: 0.625rem;
      --grid-gap: 0.0625rem;

      @apply p-1.5 gap-1;
    }
  }

  &__header {
    @apply grid items-center gap-2 px-1;

    grid-template-columns: auto 1fr auto;
  }

  &__nav-group {
    @apply inline-flex items-center gap-0.5;
  }

  &__nav {
    @apply inline-flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-[--day-radius] text-neutral-700;

    --vc-icon-size: 0.625rem;

    width: var(--cell-size);
    height: var(--cell-size);
    transition:
      background 120ms ease,
      color 120ms ease;

    &:hover {
      @apply bg-primary-50 text-primary-700;
    }

    &:focus-visible {
      @apply outline outline-[3px] outline-[--focus-ring];

      outline-offset: 1px;
    }

    &[disabled],
    &[aria-disabled="true"],
    &[data-disabled] {
      @apply text-neutral-300 bg-transparent cursor-not-allowed pointer-events-none;
    }
  }

  &__heading {
    @apply text-center font-bold text-neutral-900;

    font-size: var(--heading-text);
    letter-spacing: 0.01em;
  }

  &__grid-wrapper {
    @apply flex flex-col gap-[--grid-gap];

    border-collapse: collapse;
  }

  &__weekrow {
    @apply grid;

    grid-template-columns: repeat(7, var(--cell-size));
    gap: var(--grid-gap);
  }

  &__weekday {
    @apply flex items-center justify-center text-neutral-700 font-bold uppercase;

    height: 1.5rem;
    font-size: var(--weekday-text);
    letter-spacing: 0.04em;
  }

  &__grid {
    @apply flex flex-col gap-[--grid-gap];
  }

  &__cell {
    @apply p-0;

    width: var(--cell-size);
    height: var(--cell-size);
  }

  &__day {
    @apply relative inline-flex items-center justify-center bg-transparent border-0 cursor-pointer select-none rounded-[--day-radius] text-neutral-800 font-normal;

    width: var(--cell-size);
    height: var(--cell-size);
    font-size: var(--cell-text);
    font-family: inherit;
    transition:
      background 120ms ease,
      color 120ms ease;

    &:hover {
      @apply bg-primary-50 text-primary-700;
    }

    /* today: 2px primary-500 ring (inset, doesn't shift layout) */
    &[data-today] {
      $today: &;

      @apply font-bold;

      box-shadow: inset 0 0 0 2px var(--color-primary-500);
    }

    /* outside-view (adjacent month padding) */
    &[data-outside-view] {
      $outside: &;

      @apply text-neutral-500 font-normal;

      &:hover {
        @apply bg-neutral-100 text-neutral-600;
      }
    }

    /* disabled (min/max boundary) */
    &[data-disabled] {
      $disabled: &;

      @apply text-neutral-500 cursor-not-allowed pointer-events-none bg-transparent;

      text-decoration: line-through;
      text-decoration-thickness: 1px;
      text-decoration-color: var(--color-neutral-400);
    }

    /* unavailable (disabledDate predicate — visually distinct from min/max) */
    &[data-unavailable] {
      $unavailable: &;

      @apply text-neutral-500 cursor-not-allowed pointer-events-none;

      background: repeating-linear-gradient(
        135deg,
        transparent 0,
        transparent 4px,
        var(--color-neutral-200) 4px,
        var(--color-neutral-200) 5px
      );
    }

    /* focus ring — sits on top of any state */
    &:focus-visible {
      @apply outline outline-[3px] outline-[--focus-ring];

      outline-offset: 1px;
      z-index: 1;
    }
  }

  &__footer {
    @apply flex justify-between items-center pt-2 mt-1 border-t border-neutral-200;
  }

  &__footer-btn {
    @apply bg-transparent border-0 cursor-pointer rounded-[--day-radius] uppercase text-primary-700;

    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    padding: 0.375rem 0.625rem;
    transition: background 120ms ease;

    &:hover {
      @apply bg-primary-50;
    }

    &--ghost {
      @apply text-neutral-600;

      &:hover {
        @apply bg-neutral-100 text-neutral-800;
      }
    }
  }

  /* TODO: VCST-XXXX Watermelon contrast — white text on yellow-green primary-500 fails WCAG AA. */

  /* Single-mode selected day: solid primary fill, white text, fully rounded. */
  &--mode--single &__day[data-selected] {
    @apply font-bold;

    background: var(--color-primary-500);
    color: var(--color-additional-50);
    box-shadow: none;
  }
}
</style>
