<template>
  <div
    class="vc-date-range-input"
    :class="rootClasses"
    role="group"
    :aria-label="label || ariaGroupLabel"
    :data-test-id="dataTestId"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <VcLabel v-if="label" :required="required" :error="error" class="vc-date-range-input__label">
      {{ label }}
    </VcLabel>

    <div class="vc-date-range-input__field">
      <VcDateInput
        ref="startInputRef"
        seamless
        align="center"
        hide-details
        class="vc-date-range-input__segment"
        :model-value="modelValue?.start"
        :name="name ? `${name}-start` : undefined"
        :aria-label="startLabel"
        :placeholder="startPlaceholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :error="error"
        :min="min"
        :max="max"
        :disabled-date="disabledDate"
        :locale="locale"
        :update-on="updateOn"
        :mask="mask"
        @update:model-value="onSegment('start', $event)"
        @update:valid="onSegmentValid('start', $event)"
      />

      <span class="vc-date-range-input__separator" aria-hidden="true">–</span>

      <VcDateInput
        seamless
        align="center"
        hide-details
        class="vc-date-range-input__segment"
        :model-value="modelValue?.end"
        :name="name ? `${name}-end` : undefined"
        :aria-label="endLabel"
        :placeholder="endPlaceholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :error="error"
        :min="min"
        :max="max"
        :disabled-date="disabledDate"
        :locale="locale"
        :update-on="updateOn"
        :mask="mask"
        @update:model-value="onSegment('end', $event)"
        @update:valid="onSegmentValid('end', $event)"
      />

      <VcButton
        v-if="clearable && (modelValue?.start || modelValue?.end) && !disabled && !readonly"
        type="button"
        icon="delete-thin"
        color="neutral"
        variant="ghost"
        class="vc-date-range-input__clear"
        :icon-size="size === 'md' ? '0.875rem' : '0.75rem'"
        :aria-label="t('ui_kit.date_range_input.clear')"
        @click="clearBoth"
      />

      <slot name="append" />
    </div>

    <VcInputDetails :error="error" :message="message" :single-line="false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";

interface IProps {
  modelValue?: VcDateRange;
  size?: VcInputSizeType;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  message?: string;
  error?: boolean;
  min?: string;
  max?: string;
  disabledDate?: VcCalendarDisabledDateType;
  locale?: string;
  updateOn?: VcDateFieldUpdateOnType;
  mask?: boolean;
  clearable?: boolean;
  dataTestId?: string;
}

interface IEmits {
  (event: "update:modelValue", value: VcDateRange | undefined): void;
  (event: "update:valid", value: boolean): void;
  (event: "blur", focusEvent: FocusEvent): void;
  (event: "focus", focusEvent: FocusEvent): void;
  (event: "clear"): void;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  modelValue: undefined,
  size: "md",
  label: undefined,
  startLabel: undefined,
  endLabel: undefined,
  startPlaceholder: undefined,
  endPlaceholder: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  required: false,
  message: undefined,
  error: false,
  min: undefined,
  max: undefined,
  disabledDate: undefined,
  locale: undefined,
  updateOn: "blur",
  mask: false,
  clearable: false,
  dataTestId: undefined,
});

const { t } = useI18n();

const startInputRef = useTemplateRef<{ inputElement: HTMLInputElement | null } | null>("startInputRef");
const startInputElement = computed<HTMLInputElement | null>(() => startInputRef.value?.inputElement ?? null);

const ariaGroupLabel = computed(() => t("ui_kit.date_range_input.aria_label"));

const startFormatValid = ref(true);
const endFormatValid = ref(true);

const rootClasses = computed(() => [
  `vc-date-range-input--size--${props.size}`,
  {
    "vc-date-range-input--error": props.error,
    "vc-date-range-input--disabled": props.disabled,
    "vc-date-range-input--readonly": props.readonly,
  },
]);

// start <= end when BOTH are present; partial/empty ranges are always order-valid.
const orderValid = computed<boolean>(() => {
  const start = props.modelValue?.start;
  const end = props.modelValue?.end;
  if (!start || !end) {
    return true;
  }
  return start <= end; // ISO YYYY-MM-DD compares lexicographically
});

const isValid = computed<boolean>(() => startFormatValid.value && endFormatValid.value && orderValid.value);

// Emit initial validity (empty range is valid) and on every change.
watch(isValid, (value) => emit("update:valid", value), { immediate: true });

function mergeRange(next: VcDateRange): VcDateRange | undefined {
  if (!next.start && !next.end) {
    return undefined;
  }
  return next;
}

function onSegment(which: "start" | "end", value: string | undefined): void {
  const next: VcDateRange = {
    start: which === "start" ? value : props.modelValue?.start,
    end: which === "end" ? value : props.modelValue?.end,
  };
  emit("update:modelValue", mergeRange(next));
}

function onSegmentValid(which: "start" | "end", valid: boolean): void {
  if (which === "start") {
    startFormatValid.value = valid;
  } else {
    endFormatValid.value = valid;
  }
}

// focus/blur are shell-level: emit only when focus crosses the shell boundary,
// not when it moves between segments or to the clear/toggle buttons.
function onFocusIn(event: FocusEvent): void {
  const from = event.relatedTarget;
  const shell = event.currentTarget as HTMLElement | null;
  if (from instanceof Node && shell?.contains(from)) {
    return;
  }
  emit("focus", event);
}

function onFocusOut(event: FocusEvent): void {
  const to = event.relatedTarget;
  const shell = event.currentTarget as HTMLElement | null;
  if (to instanceof Node && shell?.contains(to)) {
    return;
  }
  emit("blur", event);
}

function clearBoth(): void {
  emit("update:modelValue", undefined);
  emit("clear");
}

defineExpose({
  startInputElement,
});
</script>

<style lang="scss">
.vc-date-range-input {
  --color: var(--vc-input-base-color, theme("colors.primary.500"));
  --focus-color: rgb(from var(--color) r g b / 0.3);

  --radius: var(--vc-input-radius, var(--vc-radius, 0.5rem));

  @apply flex flex-col;

  &--error {
    --color: var(--vc-input-error-color, theme("colors.danger.500"));
  }

  &__field {
    @apply relative flex items-center p-0.5 border border-neutral-400 rounded-[--radius] bg-additional-50;

    &:focus-within {
      @apply ring ring-[--focus-color];
    }
  }

  &--size--md &__field {
    @apply h-11 text-base;
  }

  &--size--sm &__field {
    @apply h-[2.375rem] text-base;
  }

  &__segment {
    @apply flex-1 min-w-0;
  }

  &__separator {
    @apply shrink-0 px-1 text-neutral-400 select-none;
  }

  &__clear {
    @apply shrink-0;
  }

  &--error &__field {
    @apply border-[--color] text-[--color];
  }

  &--disabled &__field {
    @apply bg-neutral-50 cursor-not-allowed;
  }
}
</style>
