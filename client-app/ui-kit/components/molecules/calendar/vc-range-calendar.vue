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
  modelValue?: VcDateRange;
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
  (event: "update:modelValue", value: VcDateRange | undefined): void;
  (event: "update:valid", value: boolean): void;
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

const rootClasses = computed(() => [
  "vc-range-calendar",
  `vc-range-calendar--size--${props.size}`,
  "vc-range-calendar--mode--range",
]);

const parsedModelValue = computed<RekaDateRangeType>(() => ({
  start: tryParseDate(props.modelValue?.start),
  end: tryParseDate(props.modelValue?.end),
}));

// Empty range is valid; reka's own `update:validModelValue` carries a DateRange payload
// (not a boolean — verified in node_modules), so range-order validity is left to VcDateRangeInput.
emit("update:valid", true);

// Dedup: reka's controlled round trip can fire update:startValue and update:modelValue
// back-to-back within the same tick, before props.modelValue reflects the emission — so track
// the last-emitted range ourselves instead of trusting the (still-stale) prop. Kept in sync with
// external prop changes too (below), so a later user pick is never compared against a stale value.
// Reactivity loss is intentional: this is a plain snapshot we resync manually, not a live binding.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
let lastKnown: VcDateRange | undefined = props.modelValue;

// Picking an earlier date than the anchor makes reka swap+commit the completed range
// (update:modelValue fires first, correct) THEN resync its own start/end refs to match the
// swap, which re-fires update:startValue for the SAME start as a trailing echo. Track that
// echo here so onStartValueUpdate can swallow it instead of clobbering the just-committed
// range back down to a partial one. Cleared via nextTick — only ever relevant same-tick.
let pendingCompleteRangeStart: string | undefined;

function isSameRange(a: VcDateRange | undefined, b: VcDateRange | undefined): boolean {
  return a?.start === b?.start && a?.end === b?.end;
}

function emitRange(value: VcDateRange | undefined): void {
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
  // preventScroll: VcRangeCalendar is body-portaled, so a default focus() would scroll the whole document to it.
  cell?.focus({ preventScroll: true });
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

// Anchor-fill: forwards reka's first-pick event as a partial range so the start segment fills
// immediately. emitRange's lastKnown check does the echo-guarding: a bare-anchor echo (lastKnown
// already {start: iso, end: undefined}) is swallowed, but a committed range (end already set)
// re-anchoring on the same start date differs from lastKnown and still clears end.
function onStartValueUpdate(value: DateValue | undefined): void {
  const iso = dateValueToIso(value);
  if (!iso) {
    return;
  }
  if (pendingCompleteRangeStart === iso) {
    pendingCompleteRangeStart = undefined;
    return;
  }
  emitRange({ start: iso, end: undefined });
}

// View-scroll: reka's placeholder scrolls the visible month. The single VcCalendar
// syncs it from modelValue (vc-calendar.vue:373-384); use-calendar-base does NOT.
// The visible month follows the LAST-EDITED endpoint (prefer end when both change).
watch(
  () => [props.modelValue?.start, props.modelValue?.end] as const,
  ([newStart, newEnd], [oldStart, oldEnd]) => {
    // External prop change is now the settled truth — resync so a later user pick that happens
    // to match an old self-emission isn't compared against stale state.
    lastKnown = props.modelValue;
    let targetIso = newEnd !== oldEnd ? newEnd : undefined;
    if (!targetIso && newStart !== oldStart) {
      targetIso = newStart;
    }
    const parsed = tryParseDate(targetIso) ?? tryParseDate(newEnd) ?? tryParseDate(newStart);
    placeholderRef.value = parsed ?? todayDate();
  },
);

// Focus-entry for the day grid: range start → today → first focusable in-view cell.
function focusActiveCell(): void {
  const root = calendarRootRef.value?.$el;
  if (!(root instanceof HTMLElement)) {
    return;
  }

  const startIso = parsedModelValue.value.start?.toString();
  if (startIso) {
    focusCellByIso(root, startIso);
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

  &--mode--range &__day {
    /* range-middle: reka marks ALL span cells data-selected, incl. endpoints — exclude them */
    &[data-selected]:not([data-selection-start]):not([data-selection-end]) {
      @apply text-primary-800;

      background: var(--color-primary-100);
      border-radius: 0;
    }

    /* endpoints: solid fill, rounded on the outer edge only */
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

    /* hover-preview band (picking 2nd endpoint): same tint, dashed bracket top+bottom.
       Excludes the endpoints — reka marks the anchor data-highlighted too while previewing,
       and the solid endpoint fill above must keep winning over the preview tint. */
    &[data-highlighted]:not([data-highlighted-end]):not([data-selection-start]):not([data-selection-end]) {
      @apply text-primary-800;

      background: var(--color-primary-100);
      border-top: 1px dashed var(--color-primary-500);
      border-bottom: 1px dashed var(--color-primary-500);
      border-radius: 0;
    }

    /* preview end (hover target): deeper fill, closes the bracket on the end edge.
       Excludes the anchor — hovering back past the start date makes it the preview "end" too. */
    &[data-highlighted-end]:not([data-selection-start]):not([data-selection-end]) {
      @apply font-bold text-primary-900;

      background: var(--color-primary-200);
      border: 1px dashed var(--color-primary-500);
      border-start-start-radius: 0;
      border-end-start-radius: 0;
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
}
</style>
