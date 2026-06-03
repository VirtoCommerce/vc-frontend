<template>
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
    @keydown="onCalendarKeydown"
  >
    <div class="vc-calendar__header">
      <button
        type="button"
        class="vc-calendar__nav vc-calendar__nav--year-prev"
        :aria-label="t('ui_kit.calendar.previous_year')"
        :disabled="prevYearDisabled"
        :aria-disabled="prevYearDisabled || undefined"
        @click="goToPreviousYear"
      >
        <VcIcon name="chevron-double-left" />
      </button>

      <CalendarPrev
        class="vc-calendar__nav vc-calendar__nav--month-prev"
        :aria-label="t('ui_kit.calendar.previous_month')"
      >
        <VcIcon name="chevron-left" />
      </CalendarPrev>

      <CalendarHeading class="vc-calendar__heading" />

      <CalendarNext class="vc-calendar__nav vc-calendar__nav--month-next" :aria-label="t('ui_kit.calendar.next_month')">
        <VcIcon name="chevron-right" />
      </CalendarNext>

      <button
        type="button"
        class="vc-calendar__nav vc-calendar__nav--year-next"
        :aria-label="t('ui_kit.calendar.next_year')"
        :disabled="nextYearDisabled"
        :aria-disabled="nextYearDisabled || undefined"
        @click="goToNextYear"
      >
        <VcIcon name="chevron-double-right" />
      </button>
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
      <button
        type="button"
        class="vc-calendar__footer-btn"
        :disabled="todayDisabled"
        :aria-disabled="todayDisabled || undefined"
        @click="onTodayClick"
      >
        {{ t("ui_kit.calendar.today") }}
      </button>

      <button type="button" class="vc-calendar__footer-btn vc-calendar__footer-btn--ghost" @click="onClearClick">
        {{ t("ui_kit.calendar.clear") }}
      </button>
    </div>
  </CalendarRoot>
</template>

<script setup lang="ts">
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "@internationalized/date";
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
import { computed, nextTick, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { dateValueToIso, todayDate, tryParseDate, useCalendarBase } from "./use-calendar-base";
import type { DateValue } from "@internationalized/date";

interface IProps {
  modelValue?: string;
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
  (event: "update:modelValue", value: string | undefined): void;
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
  return tryParseDate(props.modelValue) ?? todayDate();
}

const { t } = useI18n();

const base = useCalendarBase({
  locale: toRef(props, "locale"),
  min: toRef(props, "min"),
  max: toRef(props, "max"),
  disabledDate: toRef(props, "disabledDate"),
  initialPlaceholder: getInitialPlaceholder,
});

const {
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

const parsedModelValue = computed<DateValue | undefined>(() => tryParseDate(props.modelValue));

function onUpdate(value: DateValue | DateValue[] | undefined): void {
  const single = Array.isArray(value) ? value[0] : value;
  const iso = dateValueToIso(single);
  emit("update:modelValue", iso);
}

const todayDisabled = computed<boolean>(() => {
  const now = todayDate();
  if (minDateValue.value && now.compare(minDateValue.value) < 0) {
    return true;
  }
  if (maxDateValue.value && now.compare(maxDateValue.value) > 0) {
    return true;
  }
  const predicate = isDateUnavailable.value;
  if (predicate && predicate(now)) {
    return true;
  }
  return false;
});

function onTodayClick(): void {
  if (todayDisabled.value) {
    return;
  }
  const now = todayDate();
  placeholderRef.value = now;
  onUpdate(now);
}

function onClearClick(): void {
  emit("update:modelValue", undefined);
}

// reka-ui's CalendarRoot/CalendarCellTrigger only handle arrows/space/enter — Home/End/PageUp/PageDown
// are NOT covered. We fill the APG date-grid gap here so Home/End move focus within the grid.
// firstDayOfWeek prop is a number (0=Sunday); startOfWeek/endOfWeek expect a DayOfWeek string.
const DAY_OF_WEEK_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const mappedFirstDay = computed(() => {
  const value = props.firstDayOfWeek;
  if (value === undefined) {
    return undefined;
  }
  return DAY_OF_WEEK_NAMES[value];
});

function clampToBounds(date: DateValue): DateValue {
  let result = date;
  const min = minDateValue.value;
  const max = maxDateValue.value;
  if (min && result.compare(min) < 0) {
    result = min;
  }
  if (max && result.compare(max) > 0) {
    result = max;
  }
  return result;
}

function getFocusedCellDate(root: HTMLElement): DateValue | undefined {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) {
    return undefined;
  }
  if (!root.contains(active)) {
    return undefined;
  }
  // Only day cells carry both attributes; nav buttons and footer do not.
  if (!active.hasAttribute("data-reka-calendar-cell-trigger")) {
    return undefined;
  }
  const iso = active.getAttribute("data-value");
  if (!iso) {
    return undefined;
  }
  return tryParseDate(iso);
}

function focusCellByIso(root: HTMLElement, iso: string): void {
  // Prefer the in-view cell; adjacent-month cells render with data-outside-view.
  const inView = root.querySelector<HTMLElement>(
    `[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`,
  );
  const cell = inView ?? root.querySelector<HTMLElement>(`[data-reka-calendar-cell-trigger][data-value="${iso}"]`);
  cell?.focus();
}

type CalendarKeyTargetType = { target: DateValue };

// Home/End: ctrl/meta switches week→month (non-APG bonus). PageUp/Down: Shift switches month→year (APG-correct).
type CalendarKeyModifiersType = { ctrlOrMeta: boolean; shift: boolean };

function resolveKeyTarget(
  key: string,
  focused: DateValue,
  modifiers: CalendarKeyModifiersType,
): CalendarKeyTargetType | undefined {
  const { ctrlOrMeta, shift } = modifiers;
  let target: DateValue;

  switch (key) {
    case "Home":
      if (ctrlOrMeta) {
        target = startOfMonth(focused);
      } else {
        target = startOfWeek(focused, resolvedLocale.value, mappedFirstDay.value);
      }
      break;
    case "End":
      if (ctrlOrMeta) {
        target = endOfMonth(focused);
      } else {
        target = endOfWeek(focused, resolvedLocale.value, mappedFirstDay.value);
      }
      break;
    case "PageDown":
      // Shift = next year per WAI-ARIA APG Date Picker Dialog; plain = next month.
      target = shift ? focused.add({ years: 1 }) : focused.add({ months: 1 });
      break;
    case "PageUp":
      // Shift = previous year per WAI-ARIA APG Date Picker Dialog; plain = previous month.
      target = shift ? focused.add({ years: -1 }) : focused.add({ months: -1 });
      break;
    default:
      // Let reka handle arrows/space/enter.
      return undefined;
  }

  return { target };
}

// Mirror reka's arrow nav for the keys reka doesn't provide (Home/End/PageUp/PageDown):
// clamp to min/max and land on the target, including data-unavailable cells (focusable, not selectable per APG).
function onCalendarKeydown(event: KeyboardEvent): void {
  const root = event.currentTarget;
  if (!(root instanceof HTMLElement)) {
    return;
  }

  const focused = getFocusedCellDate(root);
  if (!focused) {
    return;
  }

  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;
  const resolvedKey = resolveKeyTarget(event.key, focused, { ctrlOrMeta, shift });
  if (!resolvedKey) {
    return;
  }

  event.preventDefault();

  const target = clampToBounds(resolvedKey.target);

  // Update placeholder so the grid scrolls when the target spills into an adjacent month.
  placeholderRef.value = target;

  const targetIso = target.toString();
  void nextTick(() => {
    focusCellByIso(root, targetIso);
  });
}

// Sync placeholder to incoming model value so external state changes scroll the view.
watch(
  () => props.modelValue,
  (next) => {
    const parsed = tryParseDate(next);
    if (parsed) {
      placeholderRef.value = parsed;
    } else {
      placeholderRef.value = getInitialPlaceholder();
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

  @apply inline-flex flex-col p-3 gap-2 bg-[--bg-color] text-[--text-color] border border-[--border-color] rounded-[--radius];

  max-width: 100%;

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
    @apply grid items-center;

    grid-template-columns: repeat(7, var(--cell-size));
    gap: var(--grid-gap);
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

    grid-column: 3 / 6;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    @apply flex items-center justify-center text-neutral-700 font-bold uppercase tracking-wider;

    height: 1.5rem;
    font-size: var(--weekday-text);
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
    transition:
      background 120ms ease,
      color 120ms ease;

    &:hover {
      @apply bg-primary-50 text-primary-700;
    }

    /* inset ring so it doesn't shift layout */
    &[data-today] {
      @apply font-bold;

      box-shadow: inset 0 0 0 2px var(--color-primary-500);
    }

    &[data-outside-view] {
      @apply text-neutral-500 font-normal;

      &:hover {
        @apply bg-neutral-100 text-neutral-600;
      }
    }

    &[data-disabled] {
      @apply text-neutral-500 cursor-not-allowed pointer-events-none bg-transparent;

      text-decoration: line-through;
      text-decoration-thickness: 1px;
      text-decoration-color: var(--color-neutral-400);
    }

    /* disabledDate predicate — visually distinct from min/max */
    &[data-unavailable] {
      @apply text-neutral-500 cursor-not-allowed pointer-events-none;

      background: repeating-linear-gradient(
        135deg,
        transparent 0,
        transparent 4px,
        var(--color-neutral-200) 4px,
        var(--color-neutral-200) 5px
      );
    }

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
    @apply bg-transparent border-0 cursor-pointer rounded-[--day-radius] uppercase text-primary-700 text-xs font-black tracking-wider;

    font-family: inherit;
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

    &[disabled],
    &[aria-disabled="true"] {
      @apply text-neutral-400 cursor-not-allowed;

      &:hover {
        @apply bg-transparent text-neutral-400;
      }
    }
  }

  &--mode--single &__day[data-selected] {
    @apply font-bold;

    background: var(--color-primary-500);
    color: var(--color-additional-50);
    box-shadow: none;
  }
}
</style>
