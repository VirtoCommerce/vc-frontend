import { getLocalTimeZone, parseDate, today as todayInLocalTz } from "@internationalized/date";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";
import type { CalendarDate, DateValue } from "@internationalized/date";
import type { Ref } from "vue";

export interface IUseCalendarBaseOptions {
  locale: Ref<string | undefined>;
  min: Ref<string | undefined>;
  max: Ref<string | undefined>;
  disabledDate: Ref<VcCalendarDisabledDateType | undefined>;
  initialPlaceholder: () => DateValue;
}

/**
 * In dev, a non-empty unparseable value logs a warning — that's a contract
 * violation by the consumer (we accept ISO YYYY-MM-DD only). Empty/undefined
 * is legitimate and stays silent.
 */
export function tryParseDate(value: string | undefined): CalendarDate | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return parseDate(value);
  } catch (error) {
    if (import.meta.env.DEV) {
      Logger.warn(`tryParseDate: "${value}" is not a valid ISO YYYY-MM-DD`, error);
    }
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
  const { locale: i18nLocale } = useI18n();

  const placeholderRef = ref(opts.initialPlaceholder()) as Ref<DateValue>;

  const resolvedLocale = computed(() => opts.locale.value ?? i18nLocale.value);
  const minDateValue = computed(() => tryParseDate(opts.min.value));
  const maxDateValue = computed(() => tryParseDate(opts.max.value));

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
