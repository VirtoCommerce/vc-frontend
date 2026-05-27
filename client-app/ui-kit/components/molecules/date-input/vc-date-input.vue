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
import { computed, toRef, useTemplateRef, watch } from "vue";
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
  /** Predicate that returns true to mark a date unavailable. Receives ISO YYYY-MM-DD. */
  disabledDate?: VcCalendarDisabledDateType;
  /** Override locale; defaults to i18n's active locale. */
  locale?: string;
  /** When to commit user input. Default "blur". Enter always commits regardless. */
  updateOn?: VcDateFieldUpdateOnType;
  /** Apply a locale-aware input mask. Default false. Paste of ISO or locale-short dates is reformatted; other paste flows through the mask. */
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
  (event: "update:valid", value: boolean): void;
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

const { displayValue, errorText, isValid, onBlur, onEnter, onClear, commit } = useDateField({
  modelValue: toRef(props, "modelValue"),
  locale: resolvedLocale,
  updateOn: toRef(props, "updateOn"),
  min: toRef(props, "min"),
  max: toRef(props, "max"),
  disabledDate: toRef(props, "disabledDate"),
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

// Immediate so the empty (valid) state is reported on mount.
watch(isValid, (v) => emit("update:valid", v), { immediate: true });

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

// Intercept paste before maska reshapes it — well-formed dates would otherwise be corrupted by the mask transform.
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
    // Unparseable — let maska handle it.
    return;
  }
  event.preventDefault();
  displayValue.value = formatDateLocale(cd, resolvedLocale.value);
  commit();
});
</script>
