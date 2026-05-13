import { computed, ref, toValue, watch } from "vue";
import { useI18n } from "vue-i18n";
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
  /** Called when a valid ISO value should be emitted upstream. */
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

  /**
   * Parsed ISO of the current displayValue, or null if it can't be parsed.
   * Empty displayValue is treated as "no value" (null without it being an error).
   */
  const parsedIso = computed<string | null>(() => {
    const trimmed = displayValue.value.trim();
    if (!trimmed) {
      return null;
    }
    return parseDateInputToIso(trimmed, resolvedLocale.value);
  });

  const isEmpty = computed<boolean>(() => displayValue.value.trim().length === 0);

  const isValid = computed<boolean>(() => {
    if (isEmpty.value) {
      return true;
    }
    const iso = parsedIso.value;
    if (!iso) {
      return false;
    }
    if (opts.min?.value && iso < opts.min.value) {
      return false;
    }
    if (opts.max?.value && iso > opts.max.value) {
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
    if (opts.min?.value && iso < opts.min.value) {
      return t("ui_kit.date_input.min_date_error", { min: opts.min.value });
    }
    if (opts.max?.value && iso > opts.max.value) {
      return t("ui_kit.date_input.max_date_error", { max: opts.max.value });
    }
    return undefined;
  });

  function commit(): void {
    if (isEmpty.value) {
      // Empty → clear upstream model.
      if (opts.modelValue.value) {
        opts.onCommit(undefined);
      }
      return;
    }
    if (!isValid.value) {
      // Hold dirty text; errorText is surfaced until the user fixes it.
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

  function onInput(value: string): void {
    displayValue.value = value;
  }

  function onBlur(): void {
    const mode = toValue(opts.updateOn) ?? "blur";
    if (mode === "blur") {
      commit();
    }
  }

  function onEnter(): void {
    // Enter always commits, regardless of updateOn mode.
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
    onInput,
    onBlur,
    onEnter,
    onClear,
    /**
     * Programmatically commit the current `displayValue` upstream.
     * Same semantics as `onBlur` in `updateOn: "blur"` mode (and the
     * unconditional Enter commit): invalid input is held dirty, empty
     * clears an existing model, valid input emits the canonical ISO.
     *
     * Useful for callers that bypass the natural input/blur flow — e.g.
     * a paste handler that writes a formatted value into `displayValue`
     * directly and needs to flush it immediately.
     */
    commit,
  };
}
