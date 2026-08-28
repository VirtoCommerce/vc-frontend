import {
  endOfMonth,
  endOfWeek,
  getLocalTimeZone,
  isSameDay,
  startOfMonth,
  startOfWeek,
  today as todayInLocalTz,
} from "@internationalized/date";
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";
import { tryParseDate } from "@/ui-kit/utilities/date";
import type { DateValue } from "@internationalized/date";
import type { Ref } from "vue";

export interface IUseCalendarBaseOptions {
  locale: Ref<string | undefined>;
  min: Ref<string | undefined>;
  max: Ref<string | undefined>;
  /** Advisory lower bound: earlier days are marked, never disabled. */
  softMin?: Ref<string | undefined>;
  /** Advisory upper bound: later days are marked, never disabled. */
  softMax?: Ref<string | undefined>;
  disabledDate: Ref<VcCalendarDisabledDateType | undefined>;
  firstDayOfWeek: Ref<VcCalendarFirstDayOfWeekType | undefined>;
  initialPlaceholder: () => DateValue;
  /** The calendar's root element, for focus management. */
  getRoot: () => Element | null | undefined;
  /** ISO date of the selected value the focus entry point should prefer. */
  getSelectedIso: () => string | undefined;
}

export function dateValueToIso(value: DateValue | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  return value.toString();
}

export function todayDate(): DateValue {
  return todayInLocalTz(getLocalTimeZone());
}

/** reka marks today with a data attribute only; both calendars need the ARIA state too. */
export function isToday(date: DateValue): boolean {
  return isSameDay(date, todayDate());
}

// reka handles only arrows/space/enter; we add Home/End/PageUp/PageDown (APG date-grid gap).
// firstDayOfWeek is a number (0=Sunday); startOfWeek/endOfWeek expect a DayOfWeek string.
const DAY_OF_WEEK_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

type CalendarKeyTargetType = { target: DateValue };

// Home/End: ctrl/meta = month (else week). PageUp/Down: shift = year (else month), per APG.
type CalendarKeyModifiersType = { ctrlOrMeta: boolean; shift: boolean };

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
  // preventScroll: the calendar is body-portaled, so a default focus() would scroll the whole document to it.
  cell?.focus({ preventScroll: true });
}

export function useCalendarBase(opts: IUseCalendarBaseOptions) {
  const { locale: i18nLocale } = useI18n();

  const resolvedLocale = computed(() => opts.locale.value ?? i18nLocale.value);
  const minDateValue = computed(() => tryParseDate(opts.min.value));
  const maxDateValue = computed(() => tryParseDate(opts.max.value));

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

  const placeholderRef = ref(clampToBounds(opts.initialPlaceholder())) as Ref<DateValue>;

  // A hard bound can arrive or move after mount, which would leave the view on a month with every day
  // disabled. Only out-of-bounds views are pulled back in, so month/year navigation inside the bounds
  // stays free. Soft bounds are excluded by design — they must never move the user's view.
  watch([minDateValue, maxDateValue], () => {
    placeholderRef.value = clampToBounds(placeholderRef.value);
  });

  const softMinDateValue = computed(() => tryParseDate(opts.softMin?.value));
  const softMaxDateValue = computed(() => tryParseDate(opts.softMax?.value));

  // Deliberately absent from clampToBounds and the nav guards: a soft bound only paints the day,
  // so every month stays reachable and every marked day stays selectable.
  function isOutsideSoftBounds(date: DateValue): boolean {
    const min = softMinDateValue.value;
    if (min && date.compare(min) < 0) {
      return true;
    }
    const max = softMaxDateValue.value;
    if (max && date.compare(max) > 0) {
      return true;
    }
    return false;
  }

  const isDateUnavailable = computed(() => {
    const fn = opts.disabledDate.value;
    if (!fn) {
      return undefined;
    }
    return (date: DateValue) => {
      try {
        return fn(date.toString());
      } catch (error) {
        Logger.error("VcCalendar: disabledDate predicate threw", { date: date.toString(), error });
        return false;
      }
    };
  });

  const prevYearDisabled = computed<boolean>(() => {
    const min = minDateValue.value;
    if (!min) {
      return false;
    }
    // Compare via first-of-month to mirror CalendarPrev's month-nav boundary semantics.
    const prev = placeholderRef.value.subtract({ years: 1 }).set({ day: 1 });
    const minMonthStart = min.set({ day: 1 });
    return prev.compare(minMonthStart) < 0;
  });

  const nextYearDisabled = computed<boolean>(() => {
    const max = maxDateValue.value;
    if (!max) {
      return false;
    }
    const next = placeholderRef.value.add({ years: 1 }).set({ day: 1 });
    const maxMonthStart = max.set({ day: 1 });
    return next.compare(maxMonthStart) > 0;
  });

  function onPlaceholderUpdate(value: DateValue): void {
    placeholderRef.value = value;
  }

  function goToPreviousYear(): void {
    if (prevYearDisabled.value) {
      return;
    }
    placeholderRef.value = placeholderRef.value.subtract({ years: 1 });
  }

  function goToNextYear(): void {
    if (nextYearDisabled.value) {
      return;
    }
    placeholderRef.value = placeholderRef.value.add({ years: 1 });
  }

  const mappedFirstDay = computed(() => {
    const value = opts.firstDayOfWeek.value;
    if (value === undefined) {
      return undefined;
    }
    return DAY_OF_WEEK_NAMES[value];
  });

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

  // Focus-entry for the day grid: selected → today → first focusable in-view cell.
  function focusActiveCell(): void {
    const root = opts.getRoot();
    if (!(root instanceof HTMLElement)) {
      return;
    }

    const selectedIso = opts.getSelectedIso();
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

  return {
    placeholderRef,
    resolvedLocale,
    minDateValue,
    maxDateValue,
    isDateUnavailable,
    isOutsideSoftBounds,
    prevYearDisabled,
    nextYearDisabled,
    onPlaceholderUpdate,
    goToPreviousYear,
    goToNextYear,
    clampToBounds,
    onCalendarKeydown,
    focusActiveCell,
  };
}
