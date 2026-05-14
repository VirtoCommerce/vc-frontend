import { computed, ref, toValue, watch } from "vue";
import { useI18n } from "vue-i18n";
import { tryParseDate } from "@/ui-kit/components/molecules/calendar/use-calendar-base";
import { formatDateLocale, parseDateInput } from "@/ui-kit/utilities/date";
import type { CalendarDate } from "@internationalized/date";
import type { MaybeRef, Ref } from "vue";

export type VcDateFieldUpdateOnType = "blur" | "enter";

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

  const isValid = computed<boolean>(() => {
    if (isEmpty.value) {
      return true;
    }
    const cd = parsedDate.value;
    if (!cd) {
      return false;
    }
    if (minDate.value && cd.compare(minDate.value) < 0) {
      return false;
    }
    if (maxDate.value && cd.compare(maxDate.value) > 0) {
      return false;
    }
    return true;
  });

  const errorText = computed<string | undefined>(() => {
    if (!touched.value || isValid.value || isEmpty.value) {
      return undefined;
    }
    const cd = parsedDate.value;
    if (!cd) {
      return t("ui_kit.date_input.invalid_format");
    }
    if (minDate.value && cd.compare(minDate.value) < 0) {
      return t("ui_kit.date_input.min_date_error", { min: opts.min?.value });
    }
    if (maxDate.value && cd.compare(maxDate.value) > 0) {
      return t("ui_kit.date_input.max_date_error", { max: opts.max?.value });
    }
    return undefined;
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
    // isValid guarantees parsedDate is non-null when isEmpty is false (checked above).
    const iso = parsedDate.value!.toString();
    if (iso !== opts.modelValue.value) {
      opts.onCommit(iso);
    }
  }

  function onBlur(): void {
    const mode = toValue(opts.updateOn) ?? "blur";
    if (mode === "blur") {
      touched.value = true;
      commit();
    }
  }

  function onEnter(): void {
    touched.value = true;
    commit();
  }

  function onClear(): void {
    displayValue.value = "";
    touched.value = false;
    if (opts.modelValue.value !== undefined) {
      opts.onCommit(undefined);
    }
  }

  return {
    displayValue,
    errorText,
    isValid,
    onBlur,
    onEnter,
    onClear,
    /**
     * Commit displayValue unconditionally (bypasses `updateOn`). Used for programmatic commits like paste.
     * - Valid → `onCommit(iso)`.
     * - Empty + existing model → `onCommit(undefined)`.
     * - Invalid → no emit; surfaces via `errorText`.
     */
    commit,
  };
}
