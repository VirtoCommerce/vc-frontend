import { getLocalTimeZone, parseDate, today as todayInLocalTz } from "@internationalized/date";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { CalendarDate, DateValue } from "@internationalized/date";
import type { Ref } from "vue";

export interface IUseCalendarBaseOptions {
  size: Ref<VcCalendarSizeType>;
  locale: Ref<string | undefined>;
  min: Ref<string | undefined>;
  max: Ref<string | undefined>;
  disabledDate: Ref<VcCalendarDisabledDateType | undefined>;
  initialPlaceholder: () => DateValue;
}

/**
 * Safely parses an ISO YYYY-MM-DD string into a CalendarDate.
 * Returns undefined when the input is missing or malformed.
 */
export function tryParseDate(value: string | undefined): CalendarDate | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return parseDate(value);
  } catch {
    return undefined;
  }
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

export function useCalendarBase(opts: IUseCalendarBaseOptions) {
  const { t, locale: i18nLocale } = useI18n();

  const placeholderRef = ref(opts.initialPlaceholder()) as Ref<DateValue>;

  const resolvedLocale = computed(() => opts.locale.value ?? i18nLocale.value);
  const minDateValue = computed(() => tryParseDate(opts.min.value));
  const maxDateValue = computed(() => tryParseDate(opts.max.value));

  const isDateUnavailable = computed(() => {
    const fn = opts.disabledDate.value;
    if (!fn) {
      return undefined;
    }
    return (date: DateValue) => fn(date.toString());
  });

  const prevYearDisabled = computed<boolean>(() => {
    const min = minDateValue.value;
    if (!min) {
      return false;
    }
    // Disable when subtracting a year would put the placeholder strictly before min.
    // Compare via first-of-month to mirror month-nav (CalendarPrev) boundary semantics.
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

  return {
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
  };
}
