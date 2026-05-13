import { computed, ref, toValue, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";
import { tryParseDate } from "@/ui-kit/components/molecules/calendar/use-calendar-base";
import { formatDateLocale, parseDateInputToIso } from "@/ui-kit/utilities/date";
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
 * Reactive orchestration for a date-text input.
 *
 * Owns the displayed text (locale-formatted), validates user input against
 * locale short format / ISO, surfaces a translated `errorText` when invalid,
 * and commits canonical ISO values upstream on blur and/or Enter.
 *
 * Invalid input is held in `displayValue` (kept dirty) until the user fixes
 * it — `onCommit` is NOT called for invalid input.
 */
export function useDateField(opts: IUseDateFieldOptions) {
  const { t, locale: i18nLocale } = useI18n();

  const resolvedLocale = computed<string>(() => opts.locale?.value ?? i18nLocale.value);

  const displayValue = ref<string>("");

  function syncDisplayFromModel(): void {
    const iso = opts.modelValue.value;
    if (!iso) {
      displayValue.value = "";
      return;
    }
    const cd = tryParseDate(iso);
    displayValue.value = cd ? formatDateLocale(cd, resolvedLocale.value) : "";
  }

  watch([() => opts.modelValue.value, resolvedLocale], syncDisplayFromModel, { immediate: true });

  const parsedIso = computed<string | null>(() => {
    const trimmed = displayValue.value.trim();
    if (!trimmed) {
      return null;
    }
    return parseDateInputToIso(trimmed, resolvedLocale.value);
  });

  const isEmpty = computed<boolean>(() => displayValue.value.trim().length === 0);

  /**
   * Parsed CalendarDate of the consumer's `min` boundary.
   *
   * If `min` is non-empty but unparseable, the consumer passed a non-ISO
   * value — surface it via a dev-only warning so the contract violation
   * is visible during development. The boundary is then ignored (returns
   * undefined) rather than corrupting validation with a bogus comparison.
   */
  const minDate = computed(() => {
    const value = opts.min?.value;
    if (!value) {
      return undefined;
    }
    const parsed = tryParseDate(value);
    if (!parsed && import.meta.env.DEV) {
      Logger.warn(`useDateField: min="${value}" is not a valid ISO YYYY-MM-DD`);
    }
    return parsed;
  });

  const maxDate = computed(() => {
    const value = opts.max?.value;
    if (!value) {
      return undefined;
    }
    const parsed = tryParseDate(value);
    if (!parsed && import.meta.env.DEV) {
      Logger.warn(`useDateField: max="${value}" is not a valid ISO YYYY-MM-DD`);
    }
    return parsed;
  });

  const isValid = computed<boolean>(() => {
    if (isEmpty.value) {
      return true;
    }
    const iso = parsedIso.value;
    if (!iso) {
      return false;
    }
    const parsedDate = tryParseDate(iso);
    if (!parsedDate) {
      return false;
    }
    if (minDate.value && parsedDate.compare(minDate.value) < 0) {
      return false;
    }
    if (maxDate.value && parsedDate.compare(maxDate.value) > 0) {
      return false;
    }
    return true;
  });

  const errorText = computed<string | undefined>(() => {
    if (isValid.value || isEmpty.value) {
      return undefined;
    }
    const iso = parsedIso.value;
    if (!iso) {
      return t("ui_kit.date_input.invalid_format");
    }
    const parsedDate = tryParseDate(iso);
    if (!parsedDate) {
      return t("ui_kit.date_input.invalid_format");
    }
    if (minDate.value && parsedDate.compare(minDate.value) < 0) {
      return t("ui_kit.date_input.min_date_error", { min: opts.min?.value });
    }
    if (maxDate.value && parsedDate.compare(maxDate.value) > 0) {
      return t("ui_kit.date_input.max_date_error", { max: opts.max?.value });
    }
    return undefined;
  });

  function commit(): void {
    if (isEmpty.value) {
      if (opts.modelValue.value) {
        opts.onCommit(undefined);
      }
      return;
    }
    if (!isValid.value) {
      return;
    }
    const iso = parsedIso.value;
    if (!iso) {
      return;
    }
    if (iso !== opts.modelValue.value) {
      opts.onCommit(iso);
    }
  }

  function onBlur(): void {
    const mode = toValue(opts.updateOn) ?? "blur";
    if (mode === "blur") {
      commit();
    }
  }

  function onEnter(): void {
    commit();
  }

  function onClear(): void {
    displayValue.value = "";
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
     * Commit the current displayValue unconditionally — bypasses the `updateOn` gate.
     * Used for programmatic commits (e.g. paste interception). For user-event-driven
     * commits, prefer `onBlur` or `onEnter` which respect `updateOn`.
     *
     * Behavior:
     * - Valid input → emit `onCommit(iso)`.
     * - Empty input + existing model → emit `onCommit(undefined)`.
     * - Invalid input → no emit; `errorText` is surfaced via `isValid` / `errorText`.
     */
    commit,
  };
}
