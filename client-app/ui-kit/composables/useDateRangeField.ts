import { computed, ref, toValue } from "vue";
import { useI18n } from "vue-i18n";
import type { MaybeRefOrGetter } from "vue";

export interface IUseDateRangeFieldOptions {
  modelValue: MaybeRefOrGetter<VcDateRange | undefined>;
  error: MaybeRefOrGetter<boolean | undefined>;
  message: MaybeRefOrGetter<string | undefined>;
}

export function useDateRangeField(opts: IUseDateRangeFieldOptions) {
  const { t } = useI18n();

  const startFormatValid = ref(true);
  const endFormatValid = ref(true);

  // Partial and empty ranges are always order-valid.
  const orderValid = computed<boolean>(() => {
    const range = toValue(opts.modelValue);
    if (!range?.start || !range.end) {
      return true;
    }
    return range.start <= range.end; // ISO YYYY-MM-DD compares lexicographically
  });

  const isValid = computed<boolean>(() => startFormatValid.value && endFormatValid.value && orderValid.value);

  const internalErrorText = computed<string | undefined>(() => {
    if (!startFormatValid.value || !endFormatValid.value) {
      return t("ui_kit.date_input.invalid_format");
    }
    if (!orderValid.value) {
      return t("ui_kit.date_range_input.invalid_range");
    }
    return undefined;
  });

  // External error/message props win over internal validation, as in VcDateInput.
  const computedError = computed<boolean>(() => !!toValue(opts.error) || !!internalErrorText.value);
  const computedMessage = computed<string | undefined>(() => {
    if (toValue(opts.error)) {
      return toValue(opts.message);
    }
    return internalErrorText.value ?? toValue(opts.message);
  });

  function setSegmentValid(which: "start" | "end", valid: boolean): void {
    if (which === "start") {
      startFormatValid.value = valid;
    } else {
      endFormatValid.value = valid;
    }
  }

  /** A range with neither endpoint collapses to `undefined`. */
  function mergeRange(which: "start" | "end", value: string | undefined): VcDateRange | undefined {
    const range = toValue(opts.modelValue);
    const next: VcDateRange = {
      start: which === "start" ? value : range?.start,
      end: which === "end" ? value : range?.end,
    };
    if (!next.start && !next.end) {
      return undefined;
    }
    return next;
  }

  return {
    isValid,
    computedError,
    computedMessage,
    orderValid,
    setSegmentValid,
    mergeRange,
  };
}
