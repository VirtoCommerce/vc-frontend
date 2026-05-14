import { beforeEach, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useDateField } from "@/ui-kit/composables";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";
import type { Ref } from "vue";

vi.mock("vue-i18n", () => {
  const locale = { value: "en-US" };
  return {
    useI18n: vi.fn().mockReturnValue({
      t: (key: string, params?: Record<string, unknown>) => {
        if (params) {
          return `${key}:${JSON.stringify(params)}`;
        }
        return key;
      },
      locale,
    }),
  };
});

interface IRunOptions {
  modelValue: string | undefined;
  locale?: string;
  updateOn?: VcDateFieldUpdateOnType;
  min?: string;
  max?: string;
}

function setup(options: IRunOptions) {
  const scope = effectScope();
  const modelValue = ref<string | undefined>(options.modelValue);
  const locale: Ref<string | undefined> | undefined = options.locale === undefined ? undefined : ref(options.locale);
  const updateOn = ref<VcDateFieldUpdateOnType>(options.updateOn ?? "blur");
  const min = ref<string | undefined>(options.min);
  const max = ref<string | undefined>(options.max);
  const onCommit = vi.fn<(iso: string | undefined) => void>();

  let field!: ReturnType<typeof useDateField>;
  scope.run(() => {
    field = useDateField({
      modelValue,
      locale,
      updateOn,
      min,
      max,
      onCommit: (iso) => {
        onCommit(iso);
        modelValue.value = iso;
      },
    });
  });

  return { field, modelValue, locale, updateOn, min, max, onCommit, scope };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useDateField — initialization & sync", () => {
  test("initializes displayValue from modelValue in default locale", () => {
    const { field } = setup({ modelValue: "2026-10-15" });
    expect(field.displayValue.value).toBe("10/15/2026");
  });

  test("initializes empty when modelValue is undefined", () => {
    const { field } = setup({ modelValue: undefined });
    expect(field.displayValue.value).toBe("");
  });

  test("re-formats displayValue when modelValue changes externally", async () => {
    const { field, modelValue } = setup({ modelValue: "2026-10-15" });
    expect(field.displayValue.value).toBe("10/15/2026");

    modelValue.value = "2027-01-05";
    await nextTick();

    expect(field.displayValue.value).toBe("01/05/2027");
  });

  test("clears displayValue when modelValue becomes undefined", async () => {
    const { field, modelValue } = setup({ modelValue: "2026-10-15" });
    modelValue.value = undefined;
    await nextTick();
    expect(field.displayValue.value).toBe("");
  });

  test("re-formats displayValue when locale changes", async () => {
    const { field, locale } = setup({ modelValue: "2026-10-15", locale: "en-US" });
    expect(field.displayValue.value).toBe("10/15/2026");

    locale!.value = "de-DE";
    await nextTick();

    expect(field.displayValue.value).toBe("15.10.2026");
  });
});

describe("useDateField — commit on blur", () => {
  test("commits valid input on blur (default updateOn)", () => {
    const { field, onCommit } = setup({ modelValue: undefined });
    field.displayValue.value = "10/15/2026";
    field.onBlur();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-10-15");
  });

  test("does NOT commit on blur in updateOn=enter mode", () => {
    const { field, onCommit } = setup({ modelValue: undefined, updateOn: "enter" });
    field.displayValue.value = "10/15/2026";
    field.onBlur();
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("does not re-commit when input matches existing modelValue", () => {
    const { field, onCommit } = setup({ modelValue: "2026-10-15" });
    field.onBlur();
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("invalid input on blur does not commit and surfaces errorText", () => {
    const { field, onCommit } = setup({ modelValue: undefined });
    field.displayValue.value = "garbage";
    field.onBlur();
    expect(onCommit).not.toHaveBeenCalled();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");
    expect(field.isValid.value).toBe(false);
    expect(field.displayValue.value).toBe("garbage");
  });

  test("empty blur with existing model emits undefined", () => {
    const { field, onCommit } = setup({ modelValue: "2026-10-15" });
    field.displayValue.value = "";
    field.onBlur();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  test("empty blur with no model does not emit", () => {
    const { field, onCommit } = setup({ modelValue: undefined });
    field.displayValue.value = "";
    field.onBlur();
    expect(onCommit).not.toHaveBeenCalled();
  });
});

describe("useDateField — commit on enter", () => {
  test("Enter commits in default (blur) mode", () => {
    const { field, onCommit } = setup({ modelValue: undefined });
    field.displayValue.value = "10/15/2026";
    field.onEnter();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-10-15");
  });

  test("Enter commits in enter mode", () => {
    const { field, onCommit } = setup({ modelValue: undefined, updateOn: "enter" });
    field.displayValue.value = "10/15/2026";
    field.onEnter();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-10-15");
  });
  // Invalid-input behavior is mode-independent and is covered by the blur block;
  // no need to re-test it for Enter.
});

describe("useDateField — onClear", () => {
  test("clears displayValue and emits undefined", () => {
    const { field, onCommit } = setup({ modelValue: "2026-10-15" });
    field.onClear();
    expect(field.displayValue.value).toBe("");
    expect(onCommit).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  test("clearing already-empty field does not emit", () => {
    const { field, onCommit } = setup({ modelValue: undefined });
    field.onClear();
    expect(field.displayValue.value).toBe("");
    expect(onCommit).not.toHaveBeenCalled();
  });
});

describe("useDateField — min/max validation", () => {
  test("rejects value below min and surfaces min error", () => {
    const { field, onCommit } = setup({
      modelValue: undefined,
      min: "2026-01-01",
    });
    field.displayValue.value = "12/31/2025";
    field.onBlur();
    expect(onCommit).not.toHaveBeenCalled();
    expect(field.isValid.value).toBe(false);
    expect(field.errorText.value).toBe('ui_kit.date_input.min_date_error:{"min":"2026-01-01"}');
  });

  test("accepts value equal to min boundary", () => {
    const { field, onCommit } = setup({
      modelValue: undefined,
      min: "2026-01-01",
    });
    field.displayValue.value = "01/01/2026";
    field.onBlur();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-01-01");
  });

  test("rejects value above max and surfaces max error", () => {
    const { field, onCommit } = setup({
      modelValue: undefined,
      max: "2026-12-31",
    });
    field.displayValue.value = "01/01/2027";
    field.onBlur();
    expect(onCommit).not.toHaveBeenCalled();
    expect(field.errorText.value).toBe('ui_kit.date_input.max_date_error:{"max":"2026-12-31"}');
  });

  test("accepts value equal to max boundary", () => {
    const { field, onCommit } = setup({
      modelValue: undefined,
      max: "2026-12-31",
    });
    field.displayValue.value = "12/31/2026";
    field.onBlur();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-12-31");
  });
});

describe("useDateField — input format flexibility", () => {
  test("accepts ISO format in any locale", () => {
    const { field, onCommit } = setup({ modelValue: undefined, locale: "en-US" });
    field.displayValue.value = "2026-10-15";
    field.onBlur();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-10-15");
  });

  test("accepts locale-specific format (de-DE)", () => {
    const { field, onCommit } = setup({ modelValue: undefined, locale: "de-DE" });
    field.displayValue.value = "15.10.2026";
    field.onBlur();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-10-15");
  });
});

describe("useDateField — commit() direct callability", () => {
  test("commit() emits ISO when displayValue is set programmatically to a valid locale string", () => {
    const { field, onCommit } = setup({ modelValue: undefined });
    field.displayValue.value = "10/15/2026";
    field.commit();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-10-15");
  });

  test("commit() respects updateOn=enter (commits unconditionally — proves it doesn't have onBlur's mode gate)", () => {
    const { field, onCommit } = setup({ modelValue: undefined, updateOn: "enter" });
    field.displayValue.value = "10/15/2026";
    field.commit();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("2026-10-15");
  });
});

describe("useDateField — errorText edge cases", () => {
  test("clearing invalid input clears the error", () => {
    const { field } = setup({ modelValue: undefined });
    field.displayValue.value = "garbage";
    field.onBlur();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");
    field.onClear();
    expect(field.errorText.value).toBeUndefined();
    expect(field.displayValue.value).toBe("");
  });
});

describe("useDateField — errorText touched-gating", () => {
  test("errorText stays undefined while typing partial garbage (pre-blur)", () => {
    const { field } = setup({ modelValue: undefined });
    field.displayValue.value = "1";
    expect(field.errorText.value).toBeUndefined();
    field.displayValue.value = "10/";
    expect(field.errorText.value).toBeUndefined();
    field.displayValue.value = "garbage";
    expect(field.errorText.value).toBeUndefined();
  });

  test("errorText surfaces after blur in default (blur) mode", () => {
    const { field } = setup({ modelValue: undefined });
    field.displayValue.value = "garbage";
    field.onBlur();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");
  });

  test("errorText stays undefined after blur in updateOn=enter mode", () => {
    const { field } = setup({ modelValue: undefined, updateOn: "enter" });
    field.displayValue.value = "garbage";
    field.onBlur();
    expect(field.errorText.value).toBeUndefined();
    field.onEnter();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");
  });

  test("errorText surfaces after Enter in default (blur) mode", () => {
    const { field } = setup({ modelValue: undefined });
    field.displayValue.value = "garbage";
    field.onEnter();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");
  });

  test("external modelValue change resets touched and clears stale error", async () => {
    const { field, modelValue } = setup({ modelValue: undefined });
    field.displayValue.value = "garbage";
    field.onBlur();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");

    modelValue.value = "2026-10-15";
    await nextTick();

    expect(field.displayValue.value).toBe("10/15/2026");
    expect(field.errorText.value).toBeUndefined();
  });

  test("locale change after blur preserves touched (does NOT clear error)", async () => {
    const { field, locale } = setup({ modelValue: undefined, locale: "en-US" });

    field.displayValue.value = "garbage";
    field.onBlur();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");

    // Locale change runs syncDisplayFromModel, which clears displayValue
    // when modelValue is undefined. errorText goes undefined via isEmpty,
    // NOT via touched reset.
    locale!.value = "de-DE";
    await nextTick();
    expect(field.displayValue.value).toBe("");
    expect(field.errorText.value).toBeUndefined();

    // Type new garbage WITHOUT blurring. If locale change had reset touched,
    // errorText would stay undefined. Because touched survived, error
    // surfaces immediately.
    field.displayValue.value = "garbage2";
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");
  });

  test("onClear resets touched (subsequent typing stays quiet until next commit)", () => {
    const { field } = setup({ modelValue: undefined });
    field.displayValue.value = "garbage";
    field.onBlur();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");

    field.onClear();
    expect(field.errorText.value).toBeUndefined();
    expect(field.displayValue.value).toBe("");

    field.displayValue.value = "garbage2";
    expect(field.errorText.value).toBeUndefined();

    field.onBlur();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");
  });

  test("commit() (public) marks touched", () => {
    const { field, onCommit } = setup({ modelValue: undefined });
    field.displayValue.value = "garbage";
    field.commit();
    expect(field.errorText.value).toBe("ui_kit.date_input.invalid_format");
    expect(onCommit).not.toHaveBeenCalled();
  });
});
