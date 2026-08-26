import { beforeEach, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useDateRangeField } from "@/ui-kit/composables";

vi.mock("vue-i18n", () => ({
  useI18n: vi.fn().mockReturnValue({ t: (key: string) => key, locale: { value: "en-US" } }),
}));

interface IRunOptions {
  modelValue?: VcDateRangeType;
  error?: boolean;
  message?: string;
  required?: boolean;
  detailsId?: string;
}

function setup(options: IRunOptions = {}) {
  const scope = effectScope();
  const modelValue = ref<VcDateRangeType | undefined>(options.modelValue);
  const error = ref<boolean | undefined>(options.error);
  const message = ref<string | undefined>(options.message);
  const required = ref<boolean | undefined>(options.required);
  const detailsId = options.detailsId ?? "range-details";

  let field!: ReturnType<typeof useDateRangeField>;
  scope.run(() => {
    field = useDateRangeField({ modelValue, error, message, required, detailsId });
  });

  return { field, modelValue, error, message, required, detailsId, scope };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useDateRangeField — order validity", () => {
  test("treats an empty range as valid", () => {
    const { field } = setup();
    expect(field.orderValid.value).toBe(true);
    expect(field.isValid.value).toBe(true);
  });

  test.each<[string, VcDateRangeType]>([
    ["start only", { start: "2026-10-08", end: undefined }],
    ["end only", { start: undefined, end: "2026-10-01" }],
  ])("treats a partial range (%s) as valid", (_name, range) => {
    const { field } = setup({ modelValue: range });
    expect(field.orderValid.value).toBe(true);
    expect(field.isValid.value).toBe(true);
  });

  test("treats start === end as valid", () => {
    const { field } = setup({ modelValue: { start: "2026-10-08", end: "2026-10-08" } });
    expect(field.orderValid.value).toBe(true);
  });

  test("treats a full-ISO start against a date-only end of the same day as valid", () => {
    const { field } = setup({ modelValue: { start: "2026-10-08T00:00:00.000Z", end: "2026-10-08" } });
    expect(field.orderValid.value).toBe(true);
    expect(field.isValid.value).toBe(true);
  });

  test("flags start > end as invalid", () => {
    const { field } = setup({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
    expect(field.orderValid.value).toBe(false);
    expect(field.isValid.value).toBe(false);
  });

  test("recomputes when the range changes", () => {
    const { field, modelValue } = setup({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
    expect(field.isValid.value).toBe(true);

    modelValue.value = { start: "2026-10-20", end: "2026-10-14" };
    expect(field.isValid.value).toBe(false);
  });
});

describe("useDateRangeField — segment validity", () => {
  test("marks the field invalid but message-free while a segment is invalid and untouched", () => {
    const { field } = setup();
    field.setSegmentValid("start", false);
    expect(field.isValid.value).toBe(false);
    expect(field.computedError.value).toBe(false);
    expect(field.computedMessage.value).toBeUndefined();
  });

  test("tracks each segment independently", () => {
    const { field } = setup();
    field.setSegmentValid("end", false);
    expect(field.isValid.value).toBe(false);

    field.setSegmentValid("start", false);
    field.setSegmentValid("end", true);
    expect(field.isValid.value).toBe(false);

    field.setSegmentValid("start", true);
    expect(field.isValid.value).toBe(true);
  });

  test("relays a touched segment's own message", () => {
    const { field } = setup();
    field.setSegmentValid("start", false);
    field.setSegmentErrorText("start", "ui_kit.date_input.min_date_error");
    expect(field.computedError.value).toBe(true);
    expect(field.computedMessage.value).toBe("ui_kit.date_input.min_date_error");
  });

  test("reports each segment's own message", () => {
    const { field } = setup();
    field.setSegmentValid("end", false);
    field.setSegmentErrorText("end", "ui_kit.date_input.max_date_error");
    expect(field.computedMessage.value).toBe("ui_kit.date_input.max_date_error");

    field.setSegmentValid("end", true);
    field.setSegmentErrorText("end", undefined);
    field.setSegmentValid("start", false);
    field.setSegmentErrorText("start", "ui_kit.date_input.min_date_error");
    expect(field.computedMessage.value).toBe("ui_kit.date_input.min_date_error");
  });

  test("prefers the start segment's message when both segments report one", () => {
    const { field } = setup();
    field.setSegmentValid("start", false);
    field.setSegmentErrorText("start", "ui_kit.date_input.min_date_error");
    field.setSegmentValid("end", false);
    field.setSegmentErrorText("end", "ui_kit.date_input.max_date_error");
    expect(field.computedMessage.value).toBe("ui_kit.date_input.min_date_error");
  });

  test("drops the segment message once that segment is valid again", () => {
    const { field } = setup();
    field.setSegmentValid("start", false);
    field.setSegmentErrorText("start", "ui_kit.date_input.min_date_error");
    expect(field.computedMessage.value).toBe("ui_kit.date_input.min_date_error");

    field.setSegmentValid("start", true);
    field.setSegmentErrorText("start", undefined);
    expect(field.computedError.value).toBe(false);
    expect(field.computedMessage.value).toBeUndefined();
  });

  test("keeps invalid_range while a malformed segment is still untouched", () => {
    const { field } = setup({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
    expect(field.computedMessage.value).toBe("ui_kit.date_range_input.invalid_range");

    field.setSegmentValid("end", false);
    expect(field.computedMessage.value).toBe("ui_kit.date_range_input.invalid_range");
  });

  test("prefers a segment's own message over invalid_range too", () => {
    const { field } = setup({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
    field.setSegmentValid("end", false);
    field.setSegmentErrorText("end", "ui_kit.date_input.max_date_error");
    expect(field.computedMessage.value).toBe("ui_kit.date_input.max_date_error");
  });
});

describe("useDateRangeField — error/message precedence", () => {
  test("stays non-error with no external error and a valid range", () => {
    const { field } = setup();
    expect(field.computedError.value).toBe(false);
    expect(field.computedMessage.value).toBeUndefined();
  });

  test("passes an informational message through while valid", () => {
    const { field } = setup({ message: "Pick a range" });
    expect(field.computedError.value).toBe(false);
    expect(field.computedMessage.value).toBe("Pick a range");
  });

  test("raises the error flag from the external prop alone", () => {
    const { field } = setup({ error: true });
    expect(field.computedError.value).toBe(true);
    expect(field.isValid.value).toBe(true);
  });

  test("lets the external message win over an internal one", () => {
    const { field } = setup({ error: true, message: "external" });
    field.setSegmentValid("start", false);
    expect(field.computedMessage.value).toBe("external");
  });

  test("shows the internal message when the external error is not set", () => {
    const { field } = setup({ modelValue: { start: "2026-10-20", end: "2026-10-01" }, message: "hint" });
    expect(field.computedMessage.value).toBe("ui_kit.date_range_input.invalid_range");
  });

  test("falls back to no message when the external error carries none", () => {
    const { field } = setup({ error: true });
    expect(field.computedMessage.value).toBeUndefined();
  });
});

describe("useDateRangeField — segment ARIA", () => {
  test("keeps the optional keys off while the field is clean", () => {
    const { field } = setup();
    expect(field.segmentAria.value).toEqual({
      "aria-invalid": "false",
      "aria-describedby": null,
      "aria-required": null,
    });
  });

  test("points aria-describedby at the details row whenever a message is shown", () => {
    const { field, detailsId } = setup({ message: "Pick a range" });
    expect(field.segmentAria.value["aria-describedby"]).toBe(detailsId);
    expect(field.segmentAria.value["aria-invalid"]).toBe("false");
  });

  test("raises aria-invalid together with the shell error", () => {
    const { field, detailsId } = setup({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
    expect(field.segmentAria.value["aria-invalid"]).toBe("true");
    expect(field.segmentAria.value["aria-describedby"]).toBe(detailsId);
  });

  test("tracks the required option", () => {
    const { field, required } = setup({ required: true });
    expect(field.segmentAria.value["aria-required"]).toBe("true");

    required.value = false;
    expect(field.segmentAria.value["aria-required"]).toBeNull();
  });
});

describe("useDateRangeField — mergeRange", () => {
  test("replaces only the start endpoint", () => {
    const { field } = setup({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
    expect(field.mergeRange("start", "2026-10-01")).toEqual({ start: "2026-10-01", end: "2026-10-14" });
  });

  test("replaces only the end endpoint", () => {
    const { field } = setup({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
    expect(field.mergeRange("end", "2026-10-20")).toEqual({ start: "2026-10-08", end: "2026-10-20" });
  });

  test("seeds a range from an undefined model", () => {
    const { field } = setup();
    expect(field.mergeRange("end", "2026-10-14")).toEqual({ start: undefined, end: "2026-10-14" });
  });

  test("keeps a range with one endpoint left", () => {
    const { field } = setup({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
    expect(field.mergeRange("start", undefined)).toEqual({ start: undefined, end: "2026-10-14" });
  });

  test("collapses a range with neither endpoint to undefined", () => {
    const { field } = setup({ modelValue: { start: undefined, end: "2026-10-14" } });
    expect(field.mergeRange("end", undefined)).toBeUndefined();
  });

  test("reads the current model, not the one captured at setup", () => {
    const { field, modelValue } = setup();
    modelValue.value = { start: "2026-10-08", end: undefined };
    expect(field.mergeRange("end", "2026-10-14")).toEqual({ start: "2026-10-08", end: "2026-10-14" });
  });
});

// The prop is still the pre-update value for a second commit in the same task (clearing one segment
// commits the other's typed text), so merging into it silently drops the first edit.
describe("useDateRangeField — two commits before the prop updates", () => {
  test("keeps both edits", () => {
    const { field } = setup({ modelValue: { start: "2026-08-08", end: undefined } });
    expect(field.mergeRange("end", "2026-08-20")).toEqual({ start: "2026-08-08", end: "2026-08-20" });
    expect(field.mergeRange("start", undefined)).toEqual({ start: undefined, end: "2026-08-20" });
  });

  test("keeps both edits in the opposite commit order", () => {
    const { field } = setup({ modelValue: { start: "2026-08-08", end: undefined } });
    expect(field.mergeRange("start", undefined)).toBeUndefined();
    expect(field.mergeRange("end", "2026-08-20")).toEqual({ start: undefined, end: "2026-08-20" });
  });

  test("does not resurrect an endpoint that a collapsed range already dropped", () => {
    const { field } = setup({ modelValue: { start: "2026-08-08", end: "2026-08-20" } });
    expect(field.mergeRange("start", undefined)).toEqual({ start: undefined, end: "2026-08-20" });
    expect(field.mergeRange("end", undefined)).toBeUndefined();
    expect(field.mergeRange("start", "2026-09-01")).toEqual({ start: "2026-09-01", end: undefined });
  });

  // An uncontrolled parent never applies the emit, so the model watch never fires and only the
  // end-of-task drop stops the next commit from merging into a rejected endpoint.
  test("goes back to the prop once the task ends, even if the model never changed", async () => {
    const { field } = setup();
    expect(field.mergeRange("start", "2026-06-15")).toEqual({ start: "2026-06-15", end: undefined });

    await nextTick();

    expect(field.mergeRange("end", "2026-07-20")).toEqual({ start: undefined, end: "2026-07-20" });
  });

  test("goes back to the prop once the model has actually changed", async () => {
    const { field, modelValue } = setup({ modelValue: { start: "2026-08-08", end: undefined } });
    expect(field.mergeRange("end", "2026-08-20")).toEqual({ start: "2026-08-08", end: "2026-08-20" });

    modelValue.value = { start: "2026-01-01", end: "2026-01-31" };
    await nextTick();

    expect(field.mergeRange("start", "2026-01-05")).toEqual({ start: "2026-01-05", end: "2026-01-31" });
  });
});
