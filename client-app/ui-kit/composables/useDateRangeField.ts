import { computed, nextTick, ref, toValue, watch } from "vue";
import { useI18n } from "vue-i18n";
import { isDateRangeInOrder } from "@/ui-kit/utilities/date";
import type { MaybeRefOrGetter } from "vue";

export interface IUseDateRangeFieldOptions {
  modelValue: MaybeRefOrGetter<VcDateRangeType | undefined>;
  error: MaybeRefOrGetter<boolean | undefined>;
  message: MaybeRefOrGetter<string | undefined>;
  required: MaybeRefOrGetter<boolean | undefined>;
  /** Id of the shell's details row; the segments reference it through `aria-describedby`. */
  detailsId: string;
  /** Drops the named segment's uncommitted text. Called on every commit for a segment holding rejected text. */
  resetSegment?: (which: "start" | "end") => void;
}

export function useDateRangeField(opts: IUseDateRangeFieldOptions) {
  const { t } = useI18n();

  const startSegmentValid = ref(true);
  const endSegmentValid = ref(true);
  const startErrorText = ref<string | undefined>(undefined);
  const endErrorText = ref<string | undefined>(undefined);

  // Partial, empty, and unparseable endpoints are always order-valid.
  const orderValid = computed<boolean>(() => {
    const range = toValue(opts.modelValue);
    return isDateRangeInOrder(range?.start, range?.end);
  });

  const isValid = computed<boolean>(() => startSegmentValid.value && endSegmentValid.value && orderValid.value);

  // Segments are hide-details, so their touched-gated per-reason message is relayed here.
  // An invalid-but-untouched segment shows nothing, matching standalone VcDateInput.
  const internalErrorText = computed<string | undefined>(() => {
    if (startErrorText.value) {
      return startErrorText.value;
    }
    if (endErrorText.value) {
      return endErrorText.value;
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

  // Segments are hide-details and the asterisk lives on the group label, so both are wired by hand.
  const segmentAria = computed<Record<string, string | null>>(() => ({
    "aria-invalid": computedError.value ? "true" : "false",
    "aria-describedby": computedMessage.value ? opts.detailsId : null,
    "aria-required": toValue(opts.required) ? "true" : null,
  }));

  function setSegmentValid(which: "start" | "end", valid: boolean): void {
    if (which === "start") {
      startSegmentValid.value = valid;
    } else {
      endSegmentValid.value = valid;
    }
  }

  function setSegmentErrorText(which: "start" | "end", text: string | undefined): void {
    if (which === "start") {
      startErrorText.value = text;
    } else {
      endErrorText.value = text;
    }
  }

  // Two commits in one task (clear a segment while the other holds uncommitted text) both read the
  // pre-update prop, dropping the first edit. Boxed so an emitted `undefined` stays distinguishable.
  let lastEmitted: { range: VcDateRangeType | undefined } | undefined;

  function dropLastEmitted(): void {
    lastEmitted = undefined;
  }

  watch(() => toValue(opts.modelValue), dropLastEmitted);

  // Rejected text can never commit, yet it keeps the whole shell invalid while the model holds a good
  // range — and a segment only resyncs from a change to its OWN half, so text rejected in one segment
  // outlives a commit made in the other. Any commit to the range is the moment to drop it. Text that is
  // merely uncommitted stays: it can still be committed with Enter.
  watch(
    () => {
      const range = toValue(opts.modelValue);
      return [range?.start, range?.end] as const;
    },
    () => {
      if (!startSegmentValid.value) {
        opts.resetSegment?.("start");
      }
      if (!endSegmentValid.value) {
        opts.resetSegment?.("end");
      }
    },
  );

  /** A range with neither endpoint collapses to `undefined`. */
  function mergeRange(which: "start" | "end", value: string | undefined): VcDateRangeType | undefined {
    const range = lastEmitted ? lastEmitted.range : toValue(opts.modelValue);
    const next: VcDateRangeType = {
      start: which === "start" ? value : range?.start,
      end: which === "end" ? value : range?.end,
    };
    const merged = !next.start && !next.end ? undefined : next;
    lastEmitted = { range: merged };
    // The snapshot only has to bridge two commits within one task. An uncontrolled parent never
    // changes the model, so the watch alone would leave it stale and merge into a rejected endpoint.
    void nextTick(dropLastEmitted);
    return merged;
  }

  return {
    isValid,
    /** Validation message the shell produced itself; external `message` is not part of it. */
    internalErrorText,
    computedError,
    computedMessage,
    orderValid,
    segmentAria,
    setSegmentValid,
    setSegmentErrorText,
    mergeRange,
  };
}
