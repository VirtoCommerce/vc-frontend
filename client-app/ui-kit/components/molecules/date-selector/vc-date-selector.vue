<template>
  <VcInput
    ref="vcInputRef"
    :model-value="dateOnly"
    v-bind="$attrs"
    :label="label"
    :name="name"
    type="date"
    :disabled="disabledComputed"
    :required="requiredComputed"
    :min="normalizedMin"
    :max="normalizedMax"
    :error="!!computedErrorMessage"
    :message="computedErrorMessage"
    :size="size"
  >
    <template #append="{ focusInput }">
      <VcButton
        type="button"
        variant="no-background"
        icon="calendar"
        :disabled="disabledComputed"
        :aria-label="$t('ui_kit.accessibility.open_calendar')"
        @click.stop="openCalendar(focusInput)"
      />
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { toDateOnlyString } from "@/ui-kit/utilities/date";

interface IEmits {
  (e: "update:modelValue", value: string | undefined): void;
  (e: "input", payload: VcDateSelectorEventType): void;
  (e: "change", payload: VcDateSelectorEventType): void;
  (e: "blur", payload: VcDateSelectorEventType): void;
}

interface IProps {
  label?: string;
  name?: string;
  /**
   * @deprecated use `required` instead
   */
  isRequired?: boolean;

  /**
   * @deprecated use `disabled` instead
   */
  isDisabled?: boolean;

  required?: boolean;
  disabled?: boolean;
  modelValue?: string;
  errorMessage?: string;
  size?: VcInputSizeType;
  min?: string;
  max?: string;
}

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();

/**
 * One-way binding to prevent v-model from writing "" back to the native date input
 * during mid-edit (e.g., typing "0" in the day segment makes value="" temporarily).
 * Writing "" back destroys Chrome's internal segment state (month/year get wiped).
 * We only propagate complete values; on blur we commit whatever the final state is.
 */
const dateOnly = ref<string | undefined>();

// Initialize and sync from external (programmatic) prop changes
watch(
  () => props.modelValue,
  (val) => {
    dateOnly.value = val;
  },
  { immediate: true },
);

const requiredComputed = computed(() => props.required ?? props.isRequired);
const disabledComputed = computed(() => props.disabled ?? props.isDisabled);

const normalizedMin = computed(() => toDateOnlyString(props.min));
const normalizedMax = computed(() => toDateOnlyString(props.max));

// --- Validation (shared between computedErrorMessage and event payload) ---

function isWithinMinMax(value: string): boolean {
  if (!value) {
    return false;
  }
  if (normalizedMin.value && value < normalizedMin.value) {
    return false;
  }
  if (normalizedMax.value && value > normalizedMax.value) {
    return false;
  }
  return true;
}

const computedErrorMessage = computed(() => {
  if (props.errorMessage) {
    return props.errorMessage;
  }

  if (!props.modelValue || (!normalizedMin.value && !normalizedMax.value)) {
    return undefined;
  }

  const selectedDate = props.modelValue;

  if (normalizedMin.value && selectedDate < normalizedMin.value) {
    return t("ui_kit.date_selector.min_date_error", { min: normalizedMin.value });
  }

  if (normalizedMax.value && selectedDate > normalizedMax.value) {
    return t("ui_kit.date_selector.max_date_error", { max: normalizedMax.value });
  }

  return undefined;
});

// --- Event infrastructure ---

const vcInputRef = useTemplateRef("vcInputRef");

let pickerOpen = false;
let lastCompleteValue: string | null = null;

// Initialize lastCompleteValue from modelValue prop
watch(
  () => props.modelValue,
  (val) => {
    lastCompleteValue = val || null;
  },
  { immediate: true },
);

function buildPayload(eventSource: VcDateSelectorEventSourceType): VcDateSelectorEventType {
  const inputEl = vcInputRef.value?.inputElement;
  const value = inputEl?.value ?? "";
  const complete = value !== "";
  const valid = complete && isWithinMinMax(value);

  return { value, complete, valid, eventSource };
}

/**
 * Guard against duplicate native "input" events caused by the maska input-mask library,
 * which re-dispatches a synthetic "input" event after processing the original one.
 */
let inputGuard = false;

function onNativeInput(): void {
  if (inputGuard) {
    return;
  }
  inputGuard = true;
  queueMicrotask(() => {
    inputGuard = false;
  });

  const source: VcDateSelectorEventSourceType = pickerOpen ? "picker" : "input";
  pickerOpen = false;

  const payload = buildPayload(source);
  emit("input", payload);

  // Only propagate complete values to v-model to prevent
  // Chrome from losing segment state during mid-edit
  if (payload.complete) {
    dateOnly.value = payload.value;
    emit("update:modelValue", payload.value);
  }

  // @change: fire on meaningful transitions
  const currentValue = payload.value;
  const wasComplete = lastCompleteValue !== null;
  const isComplete = payload.complete;

  const shouldEmitChange =
    // incomplete -> complete
    (!wasComplete && isComplete) ||
    // complete -> different complete
    (wasComplete && isComplete && currentValue !== lastCompleteValue) ||
    // complete -> incomplete
    (wasComplete && !isComplete);

  if (shouldEmitChange) {
    emit("change", payload);
  }

  lastCompleteValue = isComplete ? currentValue : null;
}

function onNativeKeydown(): void {
  pickerOpen = false;
}

function onNativeBlur(): void {
  pickerOpen = false;
  const payload = buildPayload("blur");

  // On blur, commit current state to v-model (including empty when user cleared)
  if (!payload.complete && dateOnly.value) {
    dateOnly.value = undefined;
    emit("update:modelValue", undefined);
  }

  emit("blur", payload);
}

/**
 * Prevent Vue's v-model (inside VcInput) from writing "" back to the native date input
 * during mid-edit. When a user types "0" in the day segment, Chrome returns value=""
 * but preserves internal segment state (month/year). Vue's v-model writes "" back,
 * which destroys that state. We intercept the value setter to block empty writes
 * while the input is focused and has a known good value.
 */
const originalValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
const originalValueGetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.get!;

function installValueGuard(inputEl: HTMLInputElement): void {
  Object.defineProperty(inputEl, "value", {
    get() {
      return originalValueGetter.call(this) as string;
    },
    set(val: string) {
      // Block programmatic empty writes while focused and previously had a value.
      // This lets Chrome keep its internal segment state intact during mid-edit.
      if (val === "" && document.activeElement === this && dateOnly.value) {
        return;
      }
      originalValueSetter.call(this, val);
    },
    configurable: true,
  });
}

function removeValueGuard(inputEl: HTMLInputElement): void {
  // Restore original property by deleting the instance override
  delete (inputEl as unknown as Record<string, unknown>).value;
}

// Attach native listeners and value guard
onMounted(() => {
  const inputEl = vcInputRef.value?.inputElement;

  if (!inputEl) {
    return;
  }

  installValueGuard(inputEl);
  inputEl.addEventListener("input", onNativeInput);
  inputEl.addEventListener("keydown", onNativeKeydown);
  inputEl.addEventListener("blur", onNativeBlur);
});

onBeforeUnmount(() => {
  const inputEl = vcInputRef.value?.inputElement;

  if (!inputEl) {
    return;
  }

  removeValueGuard(inputEl);
  inputEl.removeEventListener("input", onNativeInput);
  inputEl.removeEventListener("keydown", onNativeKeydown);
  inputEl.removeEventListener("blur", onNativeBlur);
});

// --- Deprecated props warnings ---

if (import.meta.env.DEV) {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {};

  if ("isRequired" in vnodeProps) {
    // eslint-disable-next-line no-console
    console.warn("VcDateSelector: 'isRequired' prop is deprecated, use 'required' instead.");
  }

  if ("isDisabled" in vnodeProps) {
    // eslint-disable-next-line no-console
    console.warn("VcDateSelector: 'isDisabled' prop is deprecated, use 'disabled' instead.");
  }
}

// --- Calendar picker ---

function openCalendar(focusInput: () => void): void {
  pickerOpen = true;
  focusInput();
  const el = document.activeElement as HTMLInputElement | null;

  if (!el || el.type !== "date") {
    return;
  }

  /**
   * Workaround for multiple date inputs in Firefox: delay ensures picker opens on first click when switching.
   * Do not remove without testing in Firefox (especially on MacOS).
   */
  setTimeout(() => {
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  }, 100);
}
</script>
