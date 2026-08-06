<template>
  <div
    :class="[
      'vc-date-range-input',
      `vc-date-range-input--size--${size}`,
      {
        'vc-date-range-input--error': computedError,
        'vc-date-range-input--disabled': disabled,
        'vc-date-range-input--readonly': readonly,
      },
    ]"
    role="group"
    :aria-label="label || t('ui_kit.date_range_input.aria_label')"
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
        :aria="segmentAria"
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
        @update:valid="setSegmentValid('start', $event)"
        @update:error-text="setSegmentErrorText('start', $event)"
      />

      <span class="vc-date-range-input__separator" aria-hidden="true">–</span>

      <VcDateInput
        ref="endInputRef"
        seamless
        hide-details
        class="vc-date-range-input__segment"
        :class="{ 'vc-date-range-input__segment--filled': !!modelValue?.end }"
        :model-value="modelValue?.end"
        :name="name ? `${name}-end` : undefined"
        :aria-label="endLabel"
        :aria="segmentAria"
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
        @update:valid="setSegmentValid('end', $event)"
        @update:error-text="setSegmentErrorText('end', $event)"
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

    <VcInputDetails :id="detailsId" :error="computedError" :message="computedMessage" :single-line="false" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, provide, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useComponentId, useDateRangeField } from "@/ui-kit/composables";
import { crossedFocusBoundary } from "@/ui-kit/utilities/focus";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";

interface IDateInputExposed {
  inputElement: HTMLInputElement | null;
  reset: () => void;
}

interface IProps {
  modelValue?: VcDateRangeType;
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
  (event: "update:modelValue", value: VcDateRangeType | undefined): void;
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

const startInputRef = useTemplateRef<IDateInputExposed | null>("startInputRef");
const endInputRef = useTemplateRef<IDateInputExposed | null>("endInputRef");
const startInputElement = computed<HTMLInputElement | null>(() => startInputRef.value?.inputElement ?? null);

// Sizes slot buttons (clear + #append) the way VcInput sizes its own decorators.
const size = computed(() => props.size);
provide<VcInputContextType>("inputContext", { size });

// Segments are hide-details, so the shell surfaces validity itself.
const { isValid, computedError, computedMessage, setSegmentValid, setSegmentErrorText, mergeRange } = useDateRangeField(
  {
    modelValue: () => props.modelValue,
    error: () => props.error,
    message: () => props.message,
  },
);

const detailsId = useComponentId("date-range-input") + "-details";

// Segments are hide-details and the asterisk lives on the group label, so both are wired by hand.
const segmentAria = computed<Record<string, string | null>>(() => ({
  "aria-invalid": computedError.value ? "true" : "false",
  "aria-describedby": computedMessage.value ? detailsId : null,
  "aria-required": props.required ? "true" : null,
}));

// Immediate so the empty (valid) state is reported on mount.
watch(isValid, (value) => emit("update:valid", value), { immediate: true });

function onSegment(which: "start" | "end", value: string | undefined): void {
  emit("update:modelValue", mergeRange(which, value));
}

// Shell-level: ignore focus moves between the segments and the clear/toggle buttons.
function onFocusIn(event: FocusEvent): void {
  if (crossedFocusBoundary(event)) {
    emit("focus", event);
  }
}

function onFocusOut(event: FocusEvent): void {
  if (crossedFocusBoundary(event)) {
    emit("blur", event);
  }
}

function clearBoth(): void {
  emit("update:modelValue", undefined);
  emit("clear");
  // An already-empty segment sees no prop change; nextTick so reset() reads the cleared model, not the stale one.
  void nextTick(() => {
    startInputRef.value?.reset();
    endInputRef.value?.reset();
  });
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
      --vc-input-padding-x: theme("padding.1");
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
    @apply relative flex items-center p-px border border-neutral-400 rounded-[--radius] bg-additional-50 h-[--height];

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
    @apply grow-0 shrink basis-[7.25em] min-w-0;

    transition: flex-basis 150ms ease;

    &--filled {
      @apply basis-[6em];
    }
  }

  &__separator {
    @apply shrink-0 text-neutral-400 select-none;
  }

  &__actions {
    @apply flex items-center shrink-0 ms-auto;
  }

  &__clear {
    @apply shrink-0;
  }
}
</style>
