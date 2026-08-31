import { computed, ref, toValue, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";
import { formatDateLocale, parseDateInput, tryParseDate } from "@/ui-kit/utilities/date";
import type { CalendarDate } from "@internationalized/date";
import type { MaybeRef, Ref } from "vue";

export type VcDateFieldUpdateOnType = "blur" | "enter";

/** Why the typed date is rejected; each value is also its `ui_kit.date_input.*` message key. */
type DateFieldFailureType = "invalid_format" | "min_date_error" | "max_date_error" | "unavailable_date";

export interface IUseDateFieldOptions {
  /** ISO YYYY-MM-DD from parent (the source of truth). */
  modelValue: Ref<string | undefined>;
  /** Optional locale override; falls back to the i18n locale. */
  locale?: Ref<string | undefined>;
  /** When to commit user input. Default "blur". Enter always commits regardless. */
  updateOn?: MaybeRef<VcDateFieldUpdateOnType>;
  /** ISO YYYY-MM-DD min boundary. */
  min?: Ref<string | undefined>;
  /** ISO YYYY-MM-DD max boundary. */
  max?: Ref<string | undefined>;
  /** Predicate that returns true to mark a date unavailable. Receives ISO YYYY-MM-DD. */
  disabledDate?: Ref<VcCalendarDisabledDateType | undefined>;
  onCommit: (iso: string | undefined) => void;
}

/**
 * Owns the locale-formatted display text for a date-text input and commits canonical ISO upstream.
 * Invalid input is held in `displayValue` until corrected — `onCommit` is not called for it.
 */
export function useDateField(opts: IUseDateFieldOptions) {
  const { t, locale: i18nLocale } = useI18n();

  const resolvedLocale = computed<string>(() => opts.locale?.value ?? i18nLocale.value);

  const displayValue = ref<string>("");
  const touched = ref<boolean>(false);

  function syncDisplayFromModel(): void {
    const iso = opts.modelValue.value;
    if (!iso) {
      displayValue.value = "";
      return;
    }
    const cd = tryParseDate(iso);
    displayValue.value = cd ? formatDateLocale(cd, resolvedLocale.value) : "";
  }

  watch(
    () => opts.modelValue.value,
    () => {
      syncDisplayFromModel();
      touched.value = false;
    },
    { immediate: true },
  );
  watch(resolvedLocale, syncDisplayFromModel);

  const parsedDate = computed<CalendarDate | null>(() => {
    const trimmed = displayValue.value.trim();
    if (!trimmed) {
      return null;
    }
    return parseDateInput(trimmed, resolvedLocale.value);
  });

  const isEmpty = computed<boolean>(() => displayValue.value.trim().length === 0);

  const minDate = computed(() => tryParseDate(opts.min?.value));
  const maxDate = computed(() => tryParseDate(opts.max?.value));

  // A throwing consumer predicate must not break field validation.
  function isDisabledDateHit(cd: CalendarDate): boolean {
    const fn = opts.disabledDate?.value;
    if (!fn) {
      return false;
    }
    try {
      return fn(cd.toString());
    } catch (error) {
      Logger.error("VcDateInput: disabledDate predicate threw", { date: cd.toString(), error });
      return false;
    }
  }

  // One ladder for both readers: `isValid` wants the verdict, `errorText` the reason. Keeping the
  // rungs in two places also ran the consumer's disabledDate predicate twice for a date it rejects.
  const failure = computed<DateFieldFailureType | undefined>(() => {
    if (isEmpty.value) {
      return undefined;
    }
    const cd = parsedDate.value;
    if (!cd) {
      return "invalid_format";
    }
    if (minDate.value && cd.compare(minDate.value) < 0) {
      return "min_date_error";
    }
    if (maxDate.value && cd.compare(maxDate.value) > 0) {
      return "max_date_error";
    }
    if (isDisabledDateHit(cd)) {
      return "unavailable_date";
    }
    return undefined;
  });

  const isValid = computed<boolean>(() => !failure.value);

  // Keys stay literal so `yarn check-locales` can still see them.
  const errorText = computed<string | undefined>(() => {
    if (!touched.value) {
      return undefined;
    }
    switch (failure.value) {
      case "invalid_format":
        return t("ui_kit.date_input.invalid_format");
      case "min_date_error":
        return t("ui_kit.date_input.min_date_error", { min: opts.min?.value });
      case "max_date_error":
        return t("ui_kit.date_input.max_date_error", { max: opts.max?.value });
      case "unavailable_date":
        return t("ui_kit.date_input.unavailable_date");
      default:
        return undefined;
    }
  });

  function commit(): void {
    touched.value = true;
    if (isEmpty.value) {
      if (opts.modelValue.value !== undefined) {
        opts.onCommit(undefined);
      }
      return;
    }
    if (!isValid.value) {
      return;
    }
    // isValid guarantees parsedDate is non-null when not empty.
    const iso = parsedDate.value!.toString();
    if (iso !== opts.modelValue.value) {
      opts.onCommit(iso);
    }
  }

  /**
   * Empties the text without reading the model. `reset` cannot serve a CLEAR: an uncontrolled parent
   * never writes the model back, so repainting from it puts the cleared dates straight back and the
   * button reads as broken. VcInput clears the same way — its defineModel keeps a local value.
   */
  function clearText(): void {
    displayValue.value = "";
    touched.value = false;
  }

  function onBlur(): void {
    const mode = toValue(opts.updateOn) ?? "blur";
    if (mode === "blur") {
      commit();
    }
  }

  // Enter commits whatever `updateOn` says; `commit` marks the field touched itself.
  function onEnter(): void {
    commit();
  }

  function onClear(): void {
    clearText();
    if (opts.modelValue.value !== undefined) {
      opts.onCommit(undefined);
    }
  }

  function reset(): void {
    syncDisplayFromModel();
    touched.value = false;
  }

  return {
    clearText,
    displayValue,
    errorText,
    isValid,
    onBlur,
    onEnter,
    onClear,
    reset,
    /** Commit displayValue unconditionally (bypasses `updateOn`). Used for programmatic commits like paste. */
    commit,
  };
}
