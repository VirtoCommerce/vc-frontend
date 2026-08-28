<template>
  <fieldset
    :class="[
      'vc-date-range-input',
      `vc-date-range-input--size--${size}`,
      {
        'vc-date-range-input--error': computedError,
        'vc-date-range-input--disabled': disabled,
        'vc-date-range-input--readonly': readonly,
      },
    ]"
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
        :aria-label="startLabel || t('ui_kit.date_range_input.start_date')"
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
        :aria-label="endLabel || t('ui_kit.date_range_input.end_date')"
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
          v-if="clearable && hasClearableContent && !disabled && !readonly"
          type="button"
          icon="delete-thin"
          color="neutral"
          variant="ghost"
          class="vc-date-range-input__clear"
          :icon-size="getInputClearIconSize(size)"
          :aria-label="t('ui_kit.date_range_input.clear')"
          @click="clearBoth"
        />

        <slot name="append" />
      </div>
    </div>

    <VcInputDetails
      :id="detailsId"
      :error="computedError"
      :message="computedMessage"
      :single-line="false"
      :show-empty="showEmptyDetails"
    />
  </fieldset>
</template>

<script setup lang="ts">
import { computed, nextTick, provide, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useComponentId, useDateRangeField, useShellFocusEvents } from "@/ui-kit/composables";
import { getInputClearIconSize } from "@/ui-kit/utilities";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";

interface IDateInputExposed {
  inputElement: HTMLInputElement | null;
  reset: () => void;
  hasText: boolean;
}

interface IProps {
  /** Both endpoints as ISO YYYY-MM-DD. Either side may be undefined — a partial range is valid. */
  modelValue?: VcDateRangeType;
  size?: VcInputSizeType;
  /** Group label for the whole field; falls back to a localized ARIA label when absent. */
  label?: string;
  /** Accessible name for the start segment. Rendered as an aria-label, not visible text. */
  startLabel?: string;
  /** Accessible name for the end segment. Rendered as an aria-label, not visible text. */
  endLabel?: string;
  /** Override the auto-derived locale hint on the start segment (e.g. "MM/DD/YYYY"). */
  startPlaceholder?: string;
  /** Override the auto-derived locale hint on the end segment. */
  endPlaceholder?: string;
  /** Base form name; the segments get `-start` / `-end` suffixes. */
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  /** Info/help text for the shared details row. Shown when no validation error is active. */
  message?: string;
  /** External error flag (e.g. from vee-validate). Overrides internal validation display. */
  error?: boolean;
  /** ISO YYYY-MM-DD min boundary, applied to both segments. */
  min?: string;
  /** ISO YYYY-MM-DD max boundary, applied to both segments. */
  max?: string;
  /** Predicate that returns true to mark a date unavailable. Receives ISO YYYY-MM-DD. */
  disabledDate?: VcCalendarDisabledDateType;
  /** Override locale; defaults to active i18n locale. */
  locale?: string;
  /** When to commit user input on either segment. Default "blur". Enter always commits. */
  updateOn?: VcDateFieldUpdateOnType;
  /** Apply a locale-aware input mask on both segments. See VcDateInput for semantics. */
  mask?: boolean;
  /** Show one shell-level clear button that resets both endpoints, including uncommitted text. */
  clearable?: boolean;
  /** Keep the details row's height reserved while it has no message, so the layout below never shifts. */
  showEmptyDetails?: boolean;
  dataTestId?: string;
}

interface IEmits {
  (event: "update:modelValue", value: VcDateRangeType | undefined): void;
  /** Both segments parse AND `start <= end`. Empty and partial ranges report true. */
  (event: "update:valid", value: boolean): void;
  /** Touched-gated validation message, so a parent can own the details row. Not the `message` prop. */
  (event: "update:errorText", value: string | undefined): void;
  /** Focus left the whole field; moves between the segments and the action buttons are not reported. */
  (event: "blur", focusEvent: FocusEvent): void;
  /** Focus entered the whole field; see `blur` for the boundary rule. */
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
  showEmptyDetails: false,
  dataTestId: undefined,
});

const { t } = useI18n();

const startInputRef = useTemplateRef<IDateInputExposed | null>("startInputRef");
const endInputRef = useTemplateRef<IDateInputExposed | null>("endInputRef");
const startInputElement = computed<HTMLInputElement | null>(() => startInputRef.value?.inputElement ?? null);

// Model-or-display-text: uncommitted (possibly invalid) text must stay clearable even with an empty model.
const hasClearableContent = computed<boolean>(
  () =>
    !!props.modelValue?.start ||
    !!props.modelValue?.end ||
    !!startInputRef.value?.hasText ||
    !!endInputRef.value?.hasText,
);

// Sizes slot buttons (clear + #append) the way VcInput sizes its own decorators.
const size = computed(() => props.size);
provide<VcInputContextType>("inputContext", { size });

const detailsId = useComponentId("date-range-input") + "-details";

// Segments are hide-details, so the shell surfaces validity itself.
const {
  isValid,
  internalErrorText,
  computedError,
  computedMessage,
  segmentAria,
  setSegmentValid,
  setSegmentErrorText,
  mergeRange,
} = useDateRangeField({
  modelValue: () => props.modelValue,
  error: () => props.error,
  message: () => props.message,
  required: () => props.required,
  detailsId,
});

// Immediate so the empty (valid) state is reported on mount.
watch(isValid, (value) => emit("update:valid", value), { immediate: true });
watch(internalErrorText, (value) => emit("update:errorText", value), { immediate: true });

function onSegment(which: "start" | "end", value: string | undefined): void {
  emit("update:modelValue", mergeRange(which, value));
}

const { onFocusIn, onFocusOut } = useShellFocusEvents(emit);

// An already-empty segment sees no prop change on clear; nextTick so reset() reads the cleared model.
function resetSegments(side?: "start" | "end"): void {
  void nextTick(() => {
    if (side !== "end") {
      startInputRef.value?.reset();
    }
    if (side !== "start") {
      endInputRef.value?.reset();
    }
  });
}

function clearBoth(): void {
  // Refocus before the button unmounts, as VcInput.clear() does; focus lost to body would emit a false blur.
  startInputElement.value?.focus();
  emit("update:modelValue", undefined);
  emit("clear");
  resetSegments();
}

defineExpose({
  startInputElement,
  /**
   * Drops uncommitted segment text, for shells whose clear or pick bypasses this component. Pass a
   * side to leave the other segment's text alone — a partial commit does not define it.
   */
  resetSegments,
});
</script>

<style lang="scss">
.vc-date-range-input {
  $error: "";
  $disabled: "";

  --color: var(--vc-input-base-color, theme("colors.primary.500"));
  --focus-color: rgb(from var(--color) r g b / 0.3);
  --radius: var(--vc-input-radius, var(--vc-radius, 0.5rem));
  --vc-button-radius: calc(var(--radius) - 2px);

  // Measured: a committed date is 86px at 16px/Lato, and each segment's text box is about half the
  // shell minus the chrome — so below this the year starts getting clipped.
  $tight-segments-breakpoint: 15.5rem;

  // The separator supplies the gap between the segments, so they sit tighter than a standalone input.
  --vc-input-padding-x: theme("padding.1");

  // Root is a fieldset. Preflight zeroes its border/padding/margin; min-inline-size: min-content is
  // the one UA default it misses, and it would stop the field from shrinking with its container.
  @apply flex flex-col min-w-0;

  container-type: inline-size;

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
    @apply relative flex items-center p-px border border-neutral-400 rounded-[--radius] bg-additional-50 h-[--height];

    font-size: var(--text-size);

    // Narrow shells give up the segment padding rather than the font size: below 16px iOS zooms the
    // page on focus. The format hint stays wider than the box — a committed date is what must fit.
    @container (width < #{$tight-segments-breakpoint}) {
      --vc-input-padding-x: 0px;
    }

    // Not :focus-within — the clear/calendar buttons paint their own outline, so the shell must not double-ring.
    &:has(input:focus) {
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
