<template>
  <CalendarRoot
    ref="calendarRootRef"
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
            <CalendarCellTrigger
              :day="weekDate"
              :month="month.value"
              class="vc-calendar__day"
              :aria-describedby="getDayDescriptionId(weekDate)"
            >
              <template v-if="hasDayContent" #default="dayProps">
                {{ dayProps.dayValue }}

                <slot name="day" v-bind="dayProps" :date="weekDate.toString()" />

                <span v-if="getDayDescriptionId(weekDate)" :id="getDayDescriptionId(weekDate)" class="sr-only">
                  {{ getDayDescription(weekDate) }}
                </span>
              </template>
            </CalendarCellTrigger>
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
import { uniqueId } from "lodash-es";
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
import { computed, nextTick, toRef, useSlots, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { dateValueToIso, todayDate, tryParseDate, useCalendarBase } from "./use-calendar-base";
import type { DateValue } from "@internationalized/date";
import type { ComponentPublicInstance } from "vue";

interface IProps {
  modelValue?: string;
  size?: VcCalendarSizeType;
  min?: string;
  max?: string;
  /**
   * Displayed month, as any ISO `YYYY-MM-DD` date inside it. Optional: left unset, the calendar
   * keeps owning the month and only reports it through `update:month`.
   */
  month?: string;
  disabledDate?: VcCalendarDisabledDateType;
  showFooter?: boolean;
  locale?: string;
  firstDayOfWeek?: VcCalendarFirstDayOfWeekType;
  weekdayFormat?: VcCalendarWeekdayFormatType;
  /**
   * Screen-reader text per day, keyed by ISO `YYYY-MM-DD`. Rendered as a visually hidden span and
   * referenced with `aria-describedby` — a prop rather than markup because reka's own `aria-label`
   * on the cell keeps anything rendered inside it out of the accessible name.
   */
  dayDescriptions?: Record<string, string>;
  dataTestId?: string;
}

interface IEmits {
  (event: "update:modelValue", value: string | undefined): void;
  /**
   * First day of the displayed month, ISO `YYYY-MM-DD`. Fires once on mount with the starting
   * month, then on every month change: header arrows, year arrows, keyboard paging, or a
   * `modelValue` / `month` change that lands in another month. Day moves inside a month are silent.
   */
  (event: "update:month", value: string): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  modelValue: undefined,
  size: "md",
  min: undefined,
  max: undefined,
  month: undefined,
  disabledDate: undefined,
  showFooter: false,
  locale: undefined,
  firstDayOfWeek: undefined,
  weekdayFormat: "short",
  dayDescriptions: undefined,
  dataTestId: undefined,
});

function getInitialPlaceholder(): DateValue {
  return tryParseDate(props.month) ?? tryParseDate(props.modelValue) ?? todayDate();
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

const slots = useSlots();

// reka's CalendarRoot forwards its root element via `$el`.
const calendarRootRef = useTemplateRef<ComponentPublicInstance | null>("calendarRootRef");

const rootClasses = computed(() => ["vc-calendar", `vc-calendar--size--${props.size}`, "vc-calendar--mode--single"]);

const parsedModelValue = computed<DateValue | undefined>(() => tryParseDate(props.modelValue));

// Day cell composition. `day` renders after the day number, which the calendar keeps drawing itself
// so the size/selected/today typography stays owned here; `.vc-calendar__day` is positioned, so
// decorations can be placed absolutely. A description cannot be slot content: reka's explicit
// aria-label on the trigger excludes everything inside it from the accessible name, so the text is
// rendered visually hidden and referenced with aria-describedby instead. Reka's cell slot is handed
// over only when one of the two is in use, keeping an undecorated calendar's DOM byte-identical.
const hasDayContent = computed<boolean>(() => !!slots.day || Object.keys(props.dayDescriptions ?? {}).length > 0);

const dayDescriptionIdPrefix = uniqueId("vc-calendar-day-");

function getDayDescription(date: DateValue): string | undefined {
  return props.dayDescriptions?.[date.toString()] || undefined;
}

function getDayDescriptionId(date: DateValue): string | undefined {
  // The grid renders one month, so an ISO date appears at most once and is a safe id suffix.
  return getDayDescription(date) ? `${dayDescriptionIdPrefix}-${date.toString()}` : undefined;
}

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

// reka handles only arrows/space/enter; we add Home/End/PageUp/PageDown (APG date-grid gap).
// firstDayOfWeek is a number (0=Sunday); startOfWeek/endOfWeek expect a DayOfWeek string.
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
  // Only day cells carry this (empty-valued) marker; nav/footer do not.
  if (active.dataset.rekaCalendarCellTrigger === undefined) {
    return undefined;
  }
  const iso = active.dataset.value;
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
  // preventScroll: VcCalendar is body-portaled, so a default focus() would scroll the whole document to it.
  cell?.focus({ preventScroll: true });
}

// Focus-entry for the day grid: selected → today → first focusable in-view cell.
function focusActiveCell(): void {
  const root = calendarRootRef.value?.$el;
  if (!(root instanceof HTMLElement)) {
    return;
  }

  const selected = parsedModelValue.value;
  if (selected) {
    focusCellByIso(root, selected.toString());
    if (getFocusedCellDate(root)) {
      return;
    }
  }

  const now = todayDate();
  focusCellByIso(root, now.toString());
  if (getFocusedCellDate(root)) {
    return;
  }

  const firstInView = root.querySelector<HTMLElement>("[data-reka-calendar-cell-trigger]:not([data-outside-view])");
  firstInView?.focus({ preventScroll: true });
}

type CalendarKeyTargetType = { target: DateValue };

// Home/End: ctrl/meta = month (else week). PageUp/Down: shift = year (else month), per APG.
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
      target = shift ? focused.add({ years: 1 }) : focused.add({ months: 1 });
      break;
    case "PageUp":
      target = shift ? focused.add({ years: -1 }) : focused.add({ months: -1 });
      break;
    default:
      // Let reka handle arrows/space/enter.
      return undefined;
  }

  return { target };
}

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

  // Scroll the grid when the target spills into an adjacent month.
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

// Same for a consumer-driven month.
watch(
  () => props.month,
  (next) => {
    const parsed = tryParseDate(next);
    if (parsed) {
      placeholderRef.value = parsed;
    }
  },
);

// Every way of changing the view — header arrows, year arrows, keyboard paging, a modelValue or
// month jump — lands on the placeholder, so one watcher reports them all. Keyed on the month start
// so day-level moves within a month stay silent.
watch(
  () => placeholderRef.value.set({ day: 1 }).toString(),
  (monthStart) => {
    emit("update:month", monthStart);
  },
  { immediate: true },
);

defineExpose({
  focusActiveCell,
});
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

  // The four nav buttons keep their cell width; the heading takes whatever is left instead of a fixed three
  // cells, which is not enough for a long month name at the smaller sizes ("September 2026" ellipsized at `sm`).
  &__header {
    @apply grid items-center;

    grid-template-columns: var(--cell-size) var(--cell-size) 1fr var(--cell-size) var(--cell-size);
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

    grid-column: 3;
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
