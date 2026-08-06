<template>
  <RangeCalendarRoot
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
    @update:start-value="onStartValueUpdate"
    @update:placeholder="onPlaceholderUpdate"
    @keydown="onCalendarKeydown"
  >
    <div class="vc-range-calendar__header">
      <button
        type="button"
        class="vc-range-calendar__nav vc-range-calendar__nav--year-prev"
        :aria-label="t('ui_kit.calendar.previous_year')"
        :disabled="prevYearDisabled"
        :aria-disabled="prevYearDisabled || undefined"
        @click="goToPreviousYear"
      >
        <VcIcon name="chevron-double-left" />
      </button>

      <RangeCalendarPrev
        class="vc-range-calendar__nav vc-range-calendar__nav--month-prev"
        :aria-label="t('ui_kit.calendar.previous_month')"
      >
        <VcIcon name="chevron-left" />
      </RangeCalendarPrev>

      <RangeCalendarHeading class="vc-range-calendar__heading" />

      <RangeCalendarNext
        class="vc-range-calendar__nav vc-range-calendar__nav--month-next"
        :aria-label="t('ui_kit.calendar.next_month')"
      >
        <VcIcon name="chevron-right" />
      </RangeCalendarNext>

      <button
        type="button"
        class="vc-range-calendar__nav vc-range-calendar__nav--year-next"
        :aria-label="t('ui_kit.calendar.next_year')"
        :disabled="nextYearDisabled"
        :aria-disabled="nextYearDisabled || undefined"
        @click="goToNextYear"
      >
        <VcIcon name="chevron-double-right" />
      </button>
    </div>

    <RangeCalendarGrid v-for="month in grid" :key="month.value.toString()" class="vc-range-calendar__grid-wrapper">
      <RangeCalendarGridHead>
        <RangeCalendarGridRow class="vc-range-calendar__weekrow">
          <RangeCalendarHeadCell v-for="day in weekDays" :key="day" class="vc-range-calendar__weekday">
            {{ day }}
          </RangeCalendarHeadCell>
        </RangeCalendarGridRow>
      </RangeCalendarGridHead>

      <RangeCalendarGridBody class="vc-range-calendar__grid">
        <RangeCalendarGridRow
          v-for="(weekDates, weekIndex) in month.rows"
          :key="weekIndex"
          class="vc-range-calendar__weekrow"
        >
          <RangeCalendarCell
            v-for="weekDate in weekDates"
            :key="weekDate.toString()"
            :date="weekDate"
            class="vc-range-calendar__cell"
          >
            <RangeCalendarCellTrigger :day="weekDate" :month="month.value" class="vc-range-calendar__day" />
          </RangeCalendarCell>
        </RangeCalendarGridRow>
      </RangeCalendarGridBody>
    </RangeCalendarGrid>

    <div v-if="showFooter" class="vc-range-calendar__footer">
      <button type="button" class="vc-range-calendar__footer-btn" @click="onClearClick">
        {{ t("ui_kit.calendar.clear") }}
      </button>
    </div>
  </RangeCalendarRoot>
</template>

<script setup lang="ts">
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "@internationalized/date";
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
import { computed, nextTick, toRef, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { dateValueToIso, todayDate, tryParseDate, useCalendarBase } from "./use-calendar-base";
import type { DateValue } from "@internationalized/date";
import type { ComponentPublicInstance } from "vue";

type RekaDateRangeType = { start: DateValue | undefined; end: DateValue | undefined };

interface IProps {
  modelValue?: VcDateRangeType;
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
  (event: "update:modelValue", value: VcDateRangeType | undefined): void;
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
  return tryParseDate(props.modelValue?.start) ?? tryParseDate(props.modelValue?.end) ?? todayDate();
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

const calendarRootRef = useTemplateRef<ComponentPublicInstance | null>("calendarRootRef");

const rootClasses = computed(() => ["vc-range-calendar", `vc-range-calendar--size--${props.size}`]);

const parsedModelValue = computed<RekaDateRangeType>(() => ({
  start: tryParseDate(props.modelValue?.start),
  end: tryParseDate(props.modelValue?.end),
}));

// Dedup snapshot: props.modelValue is still stale during reka's same-tick round trip.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
let lastKnown: VcDateRangeType | undefined = props.modelValue;

// Swallows reka's duplicate update:startValue echo after it swaps and commits a completed range.
let pendingCompleteRangeStart: string | undefined;

// reka cannot represent an end-only range and re-anchors it as start; that echo must not be forwarded.
let suppressExternalSyncEcho = false;

function isSameRange(a: VcDateRangeType | undefined, b: VcDateRangeType | undefined): boolean {
  return a?.start === b?.start && a?.end === b?.end;
}

function emitRange(value: VcDateRangeType | undefined): void {
  if (suppressExternalSyncEcho) {
    return;
  }
  if (isSameRange(value, lastKnown)) {
    return;
  }
  lastKnown = value;
  emit("update:modelValue", value);
}

function onUpdate(value: RekaDateRangeType | undefined): void {
  const start = dateValueToIso(value?.start);
  const end = dateValueToIso(value?.end);
  if (!start && !end) {
    pendingCompleteRangeStart = undefined;
    emitRange(undefined);
    return;
  }
  if (start && end) {
    pendingCompleteRangeStart = start;
    void nextTick(() => {
      pendingCompleteRangeStart = undefined;
    });
  }
  emitRange({ start, end });
}

function onClearClick(): void {
  emitRange(undefined);
}

// firstDayOfWeek is 0-based; startOfWeek/endOfWeek expect a DayOfWeek string.
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
  // Adjacent-month cells duplicate the same date — prefer the in-view one.
  const inView = root.querySelector<HTMLElement>(
    `[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`,
  );
  const cell = inView ?? root.querySelector<HTMLElement>(`[data-reka-calendar-cell-trigger][data-value="${iso}"]`);
  // preventScroll: body-portaled, a default focus() would scroll the whole document.
  cell?.focus({ preventScroll: true });
}

type CalendarKeyTargetType = { target: DateValue };

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

  // Scrolls the grid when the target spills into an adjacent month.
  placeholderRef.value = target;

  const targetIso = target.toString();
  void nextTick(() => {
    focusCellByIso(root, targetIso);
  });
}

function onStartValueUpdate(value: DateValue | undefined): void {
  const iso = dateValueToIso(value);
  if (!iso) {
    return;
  }
  if (pendingCompleteRangeStart === iso) {
    pendingCompleteRangeStart = undefined;
    return;
  }
  if (lastKnown?.end && !lastKnown?.start) {
    return;
  }
  emitRange({ start: iso, end: undefined });
}

// use-calendar-base does not sync the placeholder — the visible month follows the last-edited endpoint.
watch(
  () => [props.modelValue?.start, props.modelValue?.end] as const,
  ([newStart, newEnd], [oldStart, oldEnd]) => {
    // Resync so a later user pick isn't deduped against a stale snapshot.
    lastKnown = props.modelValue;
    // Swallow reka's same-tick echo from being fed this external value.
    suppressExternalSyncEcho = true;
    void nextTick(() => {
      suppressExternalSyncEcho = false;
    });
    let targetIso = newEnd !== oldEnd ? newEnd : undefined;
    if (!targetIso && newStart !== oldStart) {
      targetIso = newStart;
    }
    const parsed = tryParseDate(targetIso) ?? tryParseDate(newEnd) ?? tryParseDate(newStart);
    placeholderRef.value = parsed ?? todayDate();
  },
);

function focusActiveCell(): void {
  const root = calendarRootRef.value?.$el;
  if (!(root instanceof HTMLElement)) {
    return;
  }

  const selectedIso = parsedModelValue.value.start?.toString() ?? parsedModelValue.value.end?.toString();
  if (selectedIso) {
    focusCellByIso(root, selectedIso);
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

defineExpose({ focusActiveCell });
</script>

<style lang="scss">
.vc-range-calendar {
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

    /* Kept last: these tie with :hover and the state attributes above, so source order decides. */
    /* range-middle: reka marks ALL span cells data-selected, incl. endpoints — exclude them */
    &[data-selected]:not([data-selection-start]):not([data-selection-end]) {
      @apply text-primary-800;

      background: var(--color-primary-100);
      border-radius: 0;
    }

    &[data-selection-start],
    &[data-selection-end] {
      @apply font-bold text-additional-50;

      background: var(--color-primary-500);
    }

    &[data-selection-start] {
      border-start-end-radius: 0;
      border-end-end-radius: 0;
    }

    &[data-selection-end] {
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }

    /* single-day range: both endpoints on one cell → full radius */
    &[data-selection-start][data-selection-end] {
      border-radius: var(--day-radius);
    }

    /* backward preview: the anchor is visually the right endpoint; :not excludes the lone anchor */
    &[data-selection-start][data-highlighted-end]:not([data-highlighted-start]) {
      border-start-start-radius: 0;
      border-end-start-radius: 0;
      border-start-end-radius: var(--day-radius);
      border-end-end-radius: var(--day-radius);
    }

    /* hover-preview band; endpoints and run edges are excluded so their own fills win */
    &[data-highlighted]:not([data-highlighted-start]):not([data-highlighted-end]):not([data-selection-start]):not(
        [data-selection-end]
      ) {
      @apply text-primary-800;

      background: var(--color-primary-100);
      border-top: 1px dashed var(--color-primary-500);
      border-bottom: 1px dashed var(--color-primary-500);
      border-radius: 0;
    }

    /* preview end; the anchor is excluded so its solid endpoint fill wins */
    &[data-highlighted-end]:not([data-selection-start]):not([data-selection-end]) {
      @apply font-bold text-primary-900;

      background: var(--color-primary-200);
      border: 1px dashed var(--color-primary-500);
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }

    /* preview start; mirror of preview end */
    &[data-highlighted-start]:not([data-selection-start]):not([data-selection-end]) {
      @apply font-bold text-primary-900;

      background: var(--color-primary-200);
      border: 1px dashed var(--color-primary-500);
      border-start-end-radius: 0;
      border-end-end-radius: 0;
    }

    /* today inside a middle/preview cell: keep the inset ring legible */
    &[data-today][data-selected]:not([data-selection-start]):not([data-selection-end]),
    &[data-today][data-highlighted] {
      box-shadow: inset 0 0 0 2px var(--color-primary-500);
    }

    /* today that is also an endpoint: invert ring to white so it reads on the fill */
    &[data-today][data-selection-start],
    &[data-today][data-selection-end] {
      box-shadow: inset 0 0 0 2px var(--color-additional-50);
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
}
</style>
