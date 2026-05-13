<template>
  <VcInput
    ref="inputRef"
    v-model="displayValue"
    type="text"
    :size="size"
    :label="label"
    :placeholder="computedPlaceholder"
    :name="name"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :error="computedError"
    :message="computedMessage"
    :mask="maskPattern"
    :aria-label="ariaLabel"
    :aria="aria"
    :tabindex="tabindex"
    :clearable="clearable"
    :test-id-input="dataTestId"
    @blur="onInputBlur"
    @focus="onInputFocus"
    @keydown.enter="onInputEnter"
    @clear="onInputClear"
  >
    <template v-if="$slots.prepend" #prepend="slotProps">
      <slot name="prepend" v-bind="slotProps" />
    </template>

    <template v-if="$slots.append" #append="slotProps">
      <slot name="append" v-bind="slotProps" />
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { computed, toRef, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useDateField } from "@/ui-kit/composables";
import {
  deriveDateMaskFromLocale,
  derivePlaceholderFromLocale,
  formatDateLocale,
  parseDateInput,
} from "@/ui-kit/utilities/date";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";

interface IProps {
  /** ISO YYYY-MM-DD canonical value. */
  modelValue?: string;
  size?: VcInputSizeType;
  label?: string;
  /** Override the auto-derived locale hint (e.g. "MM/DD/YYYY"). */
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  /** Info/help text. Shown when no validation error is active. */
  message?: string;
  /** External error flag (e.g. from vee-validate). Overrides internal validation display. */
  error?: boolean;
  /** ISO YYYY-MM-DD min boundary. */
  min?: string;
  /** ISO YYYY-MM-DD max boundary. */
  max?: string;
  /** Override locale; defaults to i18n's active locale. */
  locale?: string;
  /** When to commit user input. Default "blur". Enter always commits regardless. */
  updateOn?: VcDateFieldUpdateOnType;
  /**
   * When true, applies a locale-aware input mask. Separators are auto-inserted
   * as the user types digits — e.g. `##.##.####` for ru/de/fi, `##/##/####`
   * for en-US, `####/##/##` for ja-JP. Compatible with `placeholder`.
   *
   * Paste of recognizable date formats (ISO `YYYY-MM-DD` or the active
   * locale's short format) is intercepted before the mask applies and
   * reformatted into the locale's display format. Paste of free-form text
   * is subject to mask transformation (digits flow into mask slots).
   *
   * Default: false (no mask; smart placeholder hint via Intl is still shown).
   */
  mask?: boolean;
  clearable?: boolean;
  ariaLabel?: string;
  /** Additional ARIA attributes forwarded to the underlying input element. */
  aria?: Record<string, string | number | null>;
  tabindex?: string | number;
  dataTestId?: string;
}

interface IEmits {
  (event: "update:modelValue", value: string | undefined): void;
  (event: "blur", focusEvent: FocusEvent): void;
  (event: "focus", focusEvent: FocusEvent): void;
  (event: "clear"): void;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  updateOn: "blur",
});

const { locale: i18nLocale } = useI18n();
const resolvedLocale = computed<string>(() => props.locale ?? i18nLocale.value);

const { displayValue, errorText, onBlur, onEnter, onClear, commit } = useDateField({
  modelValue: toRef(props, "modelValue"),
  locale: resolvedLocale,
  updateOn: toRef(props, "updateOn"),
  min: toRef(props, "min"),
  max: toRef(props, "max"),
  onCommit: (iso) => {
    emit("update:modelValue", iso);
  },
});

const computedPlaceholder = computed<string>(
  () => props.placeholder ?? derivePlaceholderFromLocale(resolvedLocale.value),
);

const maskPattern = computed<string | undefined>(() => {
  if (!props.mask) {
    return undefined;
  }
  return deriveDateMaskFromLocale(resolvedLocale.value);
});

const computedError = computed<boolean>(() => props.error || !!errorText.value);

const computedMessage = computed<string | undefined>(() => {
  if (props.error) {
    return props.message;
  }
  return errorText.value ?? props.message;
});

function onInputBlur(event: FocusEvent): void {
  onBlur();
  emit("blur", event);
}

function onInputFocus(event: FocusEvent): void {
  emit("focus", event);
}

function onInputEnter(): void {
  onEnter();
}

function onInputClear(): void {
  onClear();
  emit("clear");
}

const inputRef = useTemplateRef<{ inputElement: HTMLInputElement | null } | null>("inputRef");
const innerInputElement = computed<HTMLInputElement | null>(() => inputRef.value?.inputElement ?? null);

defineExpose({
  inputElement: innerInputElement,
});

/**
 * Paste interception (mask-only).
 *
 * Without a mask, the natural VcInput v-model + useDateField flow already
 * handles paste correctly (the pasted text lands in displayValue and is
 * validated on blur / Enter). With a mask, maska's directive intercepts
 * the resulting `input` event and reshapes the pasted text into the mask
 * pattern — which corrupts well-formed pastes like `2026-10-15` in a
 * `##.##.####` mask locale.
 *
 * To preserve "paste an ISO date and have it just work", we listen for
 * paste BEFORE maska sees the input event: if the pasted text parses as
 * a date in any supported format, we `preventDefault()` the native paste,
 * write the locale-formatted display value directly, and commit. Anything
 * unparseable is allowed to flow through, where maska will reshape it.
 */
useEventListener(innerInputElement, "paste", (event: ClipboardEvent) => {
  if (!props.mask) {
    return;
  }
  const pasted = event.clipboardData?.getData("text") ?? "";
  if (!pasted.trim()) {
    return;
  }
  const cd = parseDateInput(pasted, resolvedLocale.value);
  if (!cd) {
    // Unparseable — let maska transform the pasted text into the mask slots.
    return;
  }
  event.preventDefault();
  displayValue.value = formatDateLocale(cd, resolvedLocale.value);
  commit();
});
</script>
