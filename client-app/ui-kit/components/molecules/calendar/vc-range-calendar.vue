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
    :disabled="disabled"
    :readonly="readonly"
    allow-non-contiguous-ranges
    fixed-weeks
    prevent-deselect
    :class="rootClasses"
    :data-test-id="dataTestId"
    @update:model-value="onUpdate"
    @update:start-value="onStartValueUpdate"
    @update:valid-model-value="onValidModelValueUpdate"
    @update:placeholder="onPlaceholderUpdate"
    @keydown.capture="onCalendarKeydownCapture"
    @keydown="onCalendarKeydown"
    @pointerdown="endEscapeRevert"
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
            <RangeCalendarCellTrigger
              :day="weekDate"
              :month="month.value"
              class="vc-range-calendar__day"
              v-bind="dayAttrs(weekDate)"
            />
          </RangeCalendarCell>
        </RangeCalendarGridRow>
      </RangeCalendarGridBody>
    </RangeCalendarGrid>

    <div v-if="showFooter" class="vc-range-calendar__footer">
      <button
        type="button"
        class="vc-range-calendar__footer-btn"
        :disabled="disabled || readonly"
        :aria-disabled="disabled || readonly || undefined"
        @click="onClearClick"
      >
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
import { computed, nextTick, shallowRef, toRef, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { tryParseDate } from "@/ui-kit/utilities/date";
import { dateValueToIso, isToday, todayDate, useCalendarBase } from "./use-calendar-base";
import type { DateValue } from "@internationalized/date";
import type { DateRange } from "reka-ui";
import type { ComponentPublicInstance } from "vue";

interface IProps {
  /** Both endpoints as ISO YYYY-MM-DD. A start-only value renders as an in-progress pick. */
  modelValue?: VcDateRangeType;
  size?: VcCalendarSizeType;
  /** ISO YYYY-MM-DD min boundary; earlier days render disabled. */
  min?: string;
  /** ISO YYYY-MM-DD max boundary; later days render disabled. */
  max?: string;
  /**
   * Predicate that returns true to mark a date unavailable (hatched, distinct from min/max). Receives ISO YYYY-MM-DD.
   * The grid reads it once at mount: reka takes the predicate by value, so swapping it later does not re-filter the rendered days.
   *
   * An unavailable day cannot BE an endpoint, but a range may span one: the grid runs with reka's
   * `allowNonContiguousRanges`, so such a day renders inside the band and keeps its own strike-through.
   * Without it reka refuses the completing pick outright and the repeat press destroys the anchor.
   */
  disabledDate?: VcCalendarDisabledDateType;
  /**
   * Freeze the grid. The shell also gates its own update handler, but without this reka still mutates
   * its internal start/end on a click and paints a range the model does not hold.
   */
  disabled?: boolean;
  /** As `disabled`, but the days stay focusable for reading. */
  readonly?: boolean;
  /** Show the footer (Clear button). */
  showFooter?: boolean;
  /** Override locale; defaults to active i18n locale. */
  locale?: string;
  firstDayOfWeek?: VcCalendarFirstDayOfWeekType;
  weekdayFormat?: VcCalendarWeekdayFormatType;
  dataTestId?: string;
}

interface IEmits {
  /** Fires for the anchor pick (start only) as well as the completed range. */
  (event: "update:modelValue", value: VcDateRangeType | undefined): void;
  /** The footer Clear button was pressed, even when the range was already empty. */
  (event: "clear"): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  disabled: false,
  readonly: false,
  showFooter: false,
  weekdayFormat: "short",
});

// First candidate that parses wins; today is the floor.
function preferredPlaceholder(...isoCandidates: (string | undefined)[]): DateValue {
  return isoCandidates.map((iso) => tryParseDate(iso)).find((parsed) => !!parsed) ?? todayDate();
}

function getInitialPlaceholder(): DateValue {
  return preferredPlaceholder(props.modelValue?.start, props.modelValue?.end);
}

const { t } = useI18n();

const calendarRootRef = useTemplateRef<ComponentPublicInstance | null>("calendarRootRef");

function parseRange(value: VcDateRangeType | undefined): DateRange {
  return { start: tryParseDate(value?.start), end: tryParseDate(value?.end) };
}

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const initialRange = props.modelValue;

// Pushed, not computed: a swallowed Escape revert has to re-read a model that did not change.
const parsedModelValue = shallowRef<DateRange>(parseRange(initialRange));

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
  clampToBounds,
  onCalendarKeydown: baseOnCalendarKeydown,
  focusActiveCell,
} = useCalendarBase({
  locale: toRef(props, "locale"),
  min: toRef(props, "min"),
  max: toRef(props, "max"),
  disabledDate: toRef(props, "disabledDate"),
  firstDayOfWeek: toRef(props, "firstDayOfWeek"),
  initialPlaceholder: getInitialPlaceholder,
  getRoot: () => calendarRootRef.value?.$el as Element | null | undefined,
  getSelectedIso: () => parsedModelValue.value.start?.toString() ?? parsedModelValue.value.end?.toString(),
});

const rootClasses = computed(() => ["vc-range-calendar", `vc-range-calendar--size--${props.size}`]);

// reka marks today with a data attribute only; aria-current is what a reader announces.
function dayAttrs(date: DateValue): Record<string, string> {
  return isToday(date) ? { "aria-current": "date" } : {};
}

// Dedup snapshot: props.modelValue is still stale during reka's same-tick round trip.
let lastKnown: VcDateRangeType | undefined = initialRange;

// What reka would restore on Escape. It refreshes only on in-grid completions, so an outside commit stales it.
let rekaRevertTarget: VcDateRangeType | undefined = initialRange;

// Outside commits plus complete in-grid picks — not the anchor we emit ourselves; Escape cancels that.
let committedRange: VcDateRangeType | undefined = initialRange;

// Swallows reka's duplicate update:startValue echo after it swaps and commits a completed range.
let pendingCompleteRangeStart: string | undefined;

// reka cannot represent an end-only range and re-anchors it as start; that echo must not be forwarded.
let suppressExternalSyncEcho = false;

// Every push INTO reka draws a same-tick echo, so the guard is armed for exactly one tick.
function suppressEchoForOneTick(): void {
  suppressExternalSyncEcho = true;
  void nextTick(() => {
    suppressExternalSyncEcho = false;
  });
}

// reka restores startValue and endValue separately; only the whole range it settles on may leave.
// "stale" aims at a target that would destroy or resurrect a range.
let pendingRevert: "fresh" | "stale" | undefined;

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

function toRange(value: DateRange | undefined): VcDateRangeType | undefined {
  const start = dateValueToIso(value?.start);
  const end = dateValueToIso(value?.end);
  return start || end ? { start, end } : undefined;
}

// reka refreshes its Escape target on an in-grid completion but ALSO on a revert we refused. Only the
// first is a commit, and what we last emitted is the test: a refused revert never reaches the model.
function onValidModelValueUpdate(value: DateRange | undefined): void {
  rekaRevertTarget = toRange(value);
  if (isSameRange(rekaRevertTarget, lastKnown)) {
    committedRange = rekaRevertTarget;
  }
}

// reka re-reads the model only on a prop change, so after a swallowed revert the grid needs this.
function resyncRekaWithModel(): void {
  // reka answers with echoes of our own value, exactly like an external sync.
  suppressEchoForOneTick();
  parsedModelValue.value = parseRange(props.modelValue);
  // reka moved its placeholder to the revert target; nothing else would bring the grid back.
  placeholderRef.value = clampToBounds(getInitialPlaceholder());
}

function onUpdate(value: DateRange | undefined): void {
  // The authoritative end of a revert: reka writes both values in one handler, so the whole value lands
  // here. Clearing the guard on the conclusion keeps it independent of the flush shape.
  const isStaleRevert = pendingRevert === "stale";
  endEscapeRevert();

  if (isStaleRevert) {
    // Against the range we hold: forwarding reka's would drop a typed value or resurrect a deleted one.
    emitRange(committedRange);
    resyncRekaWithModel();
    return;
  }

  const range = toRange(value);
  if (!range) {
    pendingCompleteRangeStart = undefined;
    emitRange(undefined);
    return;
  }
  const { start, end } = range;
  // reka rewrites an end-only range as a start anchor; on an Escape revert that echo arrives here.
  if (start && !end && lastKnown?.end && !lastKnown.start && start === lastKnown.end) {
    return;
  }
  if (start && end) {
    pendingCompleteRangeStart = start;
    void nextTick(() => {
      pendingCompleteRangeStart = undefined;
    });
  }
  emitRange(range);
}

function onClearClick(): void {
  // The button is disabled too, but a programmatic click would still reach this.
  if (props.disabled || props.readonly) {
    return;
  }
  // The props watch skips our own echo, so this is the only place that can tell Escape the range is gone.
  committedRange = undefined;
  emitRange(undefined);
  // emitRange dedups an already-empty model, but shells still need to react to the explicit action.
  emit("clear");
}

// Capture phase: reka's cell trigger stops arrows/Enter/Space from bubbling
// (RangeCalendarCellTrigger.js: handleArrowKey calls stopPropagation), so a keyboard pick after an
// unanswered Escape would meet a guard still armed. reka's revert lands within the same task — its
// Escape handler writes startValue/endValue and the pre-flush pair watcher writes modelValue
// (RangeCalendarRoot.js:290, :260) — so only a synthetic same-task key sequence disarms it early.
function onCalendarKeydownCapture(event: KeyboardEvent): void {
  if (event.key !== "Escape") {
    endEscapeRevert();
  }
}

function onCalendarKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    pendingRevert = isSameRange(rekaRevertTarget, committedRange) ? "fresh" : "stale";
    return;
  }
  endEscapeRevert();
  baseOnCalendarKeydown(event);
}

// A fresh gesture means the revert landed or never will; a guard left armed swallows the next pick.
function endEscapeRevert(): void {
  pendingRevert = undefined;
}

function onStartValueUpdate(value: DateValue | undefined): void {
  if (pendingRevert) {
    return;
  }
  const iso = dateValueToIso(value);
  if (!iso) {
    return;
  }
  if (pendingCompleteRangeStart === iso) {
    pendingCompleteRangeStart = undefined;
    return;
  }
  if (lastKnown?.end && !lastKnown.start) {
    return;
  }
  emitRange({ start: iso, end: undefined });
}

// use-calendar-base does not sync the placeholder on model changes — this watch does.
// Two sources rather than one array getter: a fresh array never compares equal, so a prop object that
// carries the same two dates would re-run all of this — moving the view and arming the echo guard.
watch([() => props.modelValue?.start, () => props.modelValue?.end], ([newStart, newEnd], [oldStart]) => {
  parsedModelValue.value = parseRange(props.modelValue);
  // Our own anchor returns as a prop change too; only a value we did not emit is a commit.
  if (!isSameRange(props.modelValue, lastKnown)) {
    committedRange = props.modelValue;
  }
  // Resync so a later user pick isn't deduped against a stale snapshot.
  lastKnown = props.modelValue;
  // Swallow reka's same-tick echo from being fed this external value.
  suppressEchoForOneTick();
  // A changed start must win: reka's placeholder-follows-startValue overrides any end preference later.
  const startChanged = newStart !== oldStart;
  placeholderRef.value = clampToBounds(preferredPlaceholder(startChanged ? newStart : newEnd, newEnd, newStart));
});

defineExpose({ focusActiveCell });
</script>

<style lang="scss">
.vc-range-calendar {
  // Own keys first, so restyling VcCalendar cannot reshape this one; its keys stay as the fallback.
  --radius: var(--vc-range-calendar-radius, var(--vc-calendar-radius, var(--vc-radius, 0.75rem)));
  --day-radius: var(--vc-range-calendar-day-radius, var(--vc-calendar-day-radius, var(--vc-radius, 0.375rem)));
  // 0.8, not the house 0.3-0.35: at 0.35 this composites to 1.56-1.77 : 1, under WCAG 1.4.11's 3:1.
  // Dark needs the same value, so it is not re-declared in the dark layer.
  --focus-ring: rgb(from var(--color-primary-500) r g b / 0.8);

  // Own key, then the palette. Deliberately not VcCalendar's --vc-calendar-selected-* keys (restyling
  // it must not repaint this) and not the shared --color-vc-* ones; 700 not 500 — see vc-calendar.
  --selected-bg: var(--vc-range-calendar-selected-bg, var(--color-primary-700));
  --selected-text: var(--vc-range-calendar-selected-text, var(--color-additional-50));

  --bg-color: var(--color-additional-50);
  --border-color: var(--color-neutral-200);
  --text-color: var(--color-neutral-800);

  // Two dark presets leave primary-200 uninverted, collapsing the light pairing to 1.02 : 1.
  --preview-bg: var(--color-primary-200);
  --preview-text: var(--color-primary-900);

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

      /* The endpoint fill overrides the hatch and the muted text, so the strike is the surviving cue. */
      text-decoration: line-through;
      text-decoration-thickness: 1px;
    }

    &:focus-visible {
      @apply outline outline-[3px] outline-[--focus-ring];

      outline-offset: 1px;
      z-index: 1;
    }

    /* Kept last: these tie with :hover and the state attributes above, so source order decides. */
    &[data-selection-start],
    &[data-selection-end] {
      @apply font-bold;

      background: var(--selected-bg);
      color: var(--selected-text);

      /* [data-outside-view]:hover is one attribute more specific, so source order cannot save these. */
      &:hover,
      &[data-outside-view]:hover {
        background: var(--selected-bg);
        color: var(--selected-text);
      }
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

    /* Committed band and hover preview read the same, and reka never sets both. Endpoints and run edges
       are excluded so their own fills win. Split the list if the two states must ever differ. */
    &[data-selected]:not([data-selection-start]):not([data-selection-end]),
    &[data-highlighted]:not([data-highlighted-start]):not([data-highlighted-end]):not([data-selection-start]):not(
        [data-selection-end]
      ) {
      @apply text-primary-800;

      background: var(--color-primary-100);
      /* The fill alone is 1.20-1.33 : 1, so it cannot be the only cue (WCAG 1.4.1); these rails clear 3:1. */
      border-top: 1px dashed var(--color-primary-500);
      border-bottom: 1px dashed var(--color-primary-500);
      border-radius: 0;
    }

    /* preview end; the anchor is excluded so its solid endpoint fill wins */
    &[data-highlighted-end]:not([data-selection-start]):not([data-selection-end]) {
      @apply font-bold;

      background: var(--preview-bg);
      color: var(--preview-text);
      border: 1px dashed var(--color-primary-500);
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }

    /* preview start; mirror of preview end */
    &[data-highlighted-start]:not([data-selection-start]):not([data-selection-end]) {
      @apply font-bold;

      background: var(--preview-bg);
      color: var(--preview-text);
      border: 1px dashed var(--color-primary-500);
      border-start-end-radius: 0;
      border-end-end-radius: 0;
    }

    /* today inside a middle/preview cell: keep the inset ring legible */
    &[data-today][data-selected]:not([data-selection-start]):not([data-selection-end]),
    &[data-today][data-highlighted] {
      box-shadow: inset 0 0 0 2px var(--color-primary-500);
    }

    /* today as an endpoint: the ring reads against the fill, so it takes the same ink as the digits */
    &[data-today][data-selection-start],
    &[data-today][data-selection-end] {
      box-shadow: inset 0 0 0 2px var(--selected-text);
    }
  }

  // justify-end, not justify-between: with a single button the latter degrades to flex-start and would
  // put Clear on the opposite edge from the same button in vc-calendar's two-button footer. Assumes
  // exactly one button — a second action needs a gap and probably justify-between back.
  &__footer {
    @apply flex justify-end items-center pt-2 mt-1 border-t border-neutral-200;
  }

  // Clear is the footer's only action here, and it is a ghost one — VcCalendar's primary Today button
  // has no counterpart in a range calendar.
  &__footer-btn {
    @apply bg-transparent border-0 cursor-pointer rounded-[--day-radius] uppercase text-neutral-600 text-xs font-black tracking-wider;

    font-family: inherit;
    padding: 0.375rem 0.625rem;
    transition: background 120ms ease;

    &:hover {
      @apply bg-neutral-100 text-neutral-800;
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
