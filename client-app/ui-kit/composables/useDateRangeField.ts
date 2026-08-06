import { computed, ref, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { toDateOnlyString } from "@/ui-kit/utilities/date";
import type { MaybeRefOrGetter } from "vue";

export interface IUseDateRangeFieldOptions {
  modelValue: MaybeRefOrGetter<VcDateRangeType | undefined>;
  error: MaybeRefOrGetter<boolean | undefined>;
  message: MaybeRefOrGetter<string | undefined>;
}

export function useDateRangeField(opts: IUseDateRangeFieldOptions) {
  const { t } = useI18n();

  const startFormatValid = ref(true);
  const endFormatValid = ref(true);
  const startErrorText = ref<string | undefined>(undefined);
  const endErrorText = ref<string | undefined>(undefined);

  // Partial and empty ranges are always order-valid.
  const orderValid = computed<boolean>(() => {
    const range = toValue(opts.modelValue);
    // Date-only so a full-ISO endpoint still compares lexicographically against a bare YYYY-MM-DD.
    const start = toDateOnlyString(range?.start);
    const end = toDateOnlyString(range?.end);
    if (!start || !end) {
      return true;
    }
    return start <= end;
  });

  const isValid = computed<boolean>(() => startFormatValid.value && endFormatValid.value && orderValid.value);

  // Segments are hide-details, so their own per-reason message is relayed here; it is absent while
  // a segment is invalid but untouched, hence the format fallback.
  const internalErrorText = computed<string | undefined>(() => {
    if (!startFormatValid.value) {
      return startErrorText.value ?? t("ui_kit.date_input.invalid_format");
    }
    if (!endFormatValid.value) {
      return endErrorText.value ?? t("ui_kit.date_input.invalid_format");
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

  function setSegmentErrorText(which: "start" | "end", text: string | undefined): void {
    if (which === "start") {
      startErrorText.value = text;
    } else {
      endErrorText.value = text;
    }
  }

  /** A range with neither endpoint collapses to `undefined`. */
  function mergeRange(which: "start" | "end", value: string | undefined): VcDateRangeType | undefined {
    const range = toValue(opts.modelValue);
    const next: VcDateRangeType = {
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
    setSegmentErrorText,
    mergeRange,
  };
}
