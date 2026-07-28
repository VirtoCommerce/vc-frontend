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
    <VcLabel v-if="label" :required="required" :error="computedError" class="vc-date-range-input__label">
      {{ label }}
    </VcLabel>

    <div class="vc-date-range-input__field">
      <VcDateInput
        ref="startInputRef"
        seamless
        hide-details
        class="vc-date-range-input__segment"
        :class="{ 'vc-date-range-input__segment--filled': !!modelValue?.start }"
        :model-value="modelValue?.start"
        :name="name ? `${name}-start` : undefined"
        :aria-label="startLabel"
        :placeholder="startPlaceholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :error="computedError"
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
        hide-details
        class="vc-date-range-input__segment"
        :class="{ 'vc-date-range-input__segment--filled': !!modelValue?.end }"
        :model-value="modelValue?.end"
        :name="name ? `${name}-end` : undefined"
        :aria-label="endLabel"
        :placeholder="endPlaceholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :error="computedError"
        :min="min"
        :max="max"
        :disabled-date="disabledDate"
        :locale="locale"
        :update-on="updateOn"
        :mask="mask"
        @update:model-value="onSegment('end', $event)"
        @update:valid="onSegmentValid('end', $event)"
      />

      <div class="vc-date-range-input__actions">
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
    </div>

    <VcInputDetails :error="computedError" :message="computedMessage" :single-line="false" />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, useTemplateRef, watch } from "vue";
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

// Auto-size slot buttons (clear + #append) the same way VcInput does for its own decorators.
const size = computed(() => props.size);
provide<VcInputContextType>("inputContext", { size });

const startFormatValid = ref(true);
const endFormatValid = ref(true);

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

// Segments are hide-details, so the shell surfaces validity itself — mirrors VcDateInput's computedError/computedMessage.
const internalErrorText = computed<string | undefined>(() => {
  if (!startFormatValid.value || !endFormatValid.value) {
    return t("ui_kit.date_input.invalid_format");
  }
  if (!orderValid.value) {
    return t("ui_kit.date_range_input.invalid_range");
  }
  return undefined;
});

// External error/message props win over internal validation (same rule VcDateInput uses).
const computedError = computed<boolean>(() => props.error || !!internalErrorText.value);
const computedMessage = computed<string | undefined>(() => {
  if (props.error) {
    return props.message;
  }
  return internalErrorText.value ?? props.message;
});

const rootClasses = computed(() => [
  `vc-date-range-input--size--${props.size}`,
  {
    "vc-date-range-input--error": computedError.value,
    "vc-date-range-input--disabled": props.disabled,
    "vc-date-range-input--readonly": props.readonly,
  },
]);

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
  $error: "";
  $disabled: "";

  --color: var(--vc-input-base-color, theme("colors.primary.500"));
  --focus-color: rgb(from var(--color) r g b / 0.3);

  --radius: var(--vc-input-radius, var(--vc-radius, 0.5rem));

  @apply flex flex-col;

  &--size {
    &--xs {
      --height: theme("spacing.8");
      --text-size: theme("fontSize.sm[0]");
    }

    &--sm {
      // No 2.375rem spacing token — literal, same as vc-input.
      --height: 2.375rem;
      --text-size: theme("fontSize.base[0]");
    }

    &--md {
      --height: theme("spacing.11");
      --text-size: theme("fontSize.base[0]");
    }
  }

  &--error {
    $error: &;

    --color: var(--vc-input-error-color, theme("colors.danger.500"));
  }

  &--disabled {
    $disabled: &;
  }

  &__field {
    @apply relative flex items-center p-0.5 border border-neutral-400 rounded-[--radius] bg-additional-50 h-[--height];

    font-size: var(--text-size);

    &:focus-within {
      @apply ring ring-[--focus-color];
    }

    #{$error} & {
      @apply border-[--color] text-[--color];
    }

    #{$disabled} & {
      @apply bg-neutral-50 cursor-not-allowed;
    }
  }

  &__segment {
    // 8em = empty/placeholder width; shrinks only when space runs out.
    @apply grow-0 shrink basis-[8em] min-w-0;

    // Smooth the empty->committed width snap; resize-driven shrink is flex-shrink, not basis, so it's unaffected.
    transition: flex-basis 150ms ease;

    // Committed date is narrower than the placeholder — tighten so trailing space isn't dead.
    &--filled {
      flex-basis: 6.75em;
    }
  }

  &__separator {
    @apply shrink-0 px-2 text-neutral-400 select-none;
  }

  &__actions {
    @apply flex items-center shrink-0 ms-auto;
  }

  &__clear {
    @apply shrink-0;
  }
}
</style>
