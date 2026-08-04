<template>
  <div
    v-if="layout === 'split'"
    :class="['vc-date-range-picker', `vc-date-range-picker--layout--${layout}`, `vc-date-range-picker--size--${size}`]"
    role="group"
    :aria-label="label || t('ui_kit.date_range_input.aria_label')"
    :data-test-id="dataTestId"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <VcLabel v-if="label" :required="required" :error="computedError">
      {{ label }}
    </VcLabel>

    <div class="vc-date-range-picker__fields">
      <VcDatePicker
        v-bind="sharedFieldProps"
        class="vc-date-range-picker__field"
        :placement="startPlacement"
        :model-value="modelValue?.start"
        :label="startLabel"
        :placeholder="startPlaceholder"
        :name="sideAttr(name, 'start')"
        :calendar-max="startMax"
        :data-test-id="sideAttr(dataTestId, 'start')"
        @update:model-value="onSegment('start', $event)"
        @update:valid="setSegmentValid('start', $event)"
        @clear="onInputClear"
      />

      <span class="vc-date-range-picker__separator" aria-hidden="true">—</span>

      <VcDatePicker
        v-bind="sharedFieldProps"
        class="vc-date-range-picker__field"
        :model-value="modelValue?.end"
        :label="endLabel"
        :placeholder="endPlaceholder"
        :name="sideAttr(name, 'end')"
        :calendar-min="endMin"
        :data-test-id="sideAttr(dataTestId, 'end')"
        @update:model-value="onSegment('end', $event)"
        @update:valid="setSegmentValid('end', $event)"
        @clear="onInputClear"
      />
    </div>

    <VcInputDetails :id="detailsId" :error="computedError" :message="computedMessage" :single-line="false" />
  </div>

  <VcPopover
    v-else
    :class="['vc-date-range-picker', `vc-date-range-picker--layout--${layout}`, `vc-date-range-picker--size--${size}`]"
    :placement="placement"
    :offset-options="{ mainAxis: 4 }"
    :enable-teleport="enableTeleport"
    role="dialog"
    :aria-label="t('ui_kit.accessibility.calendar')"
    @toggle="onPopoverToggle"
  >
    <template #default="{ toggle, triggerProps, close }">
      <VcDateRangeInput
        ref="rangeInputRef"
        :model-value="modelValue"
        :size="size"
        :label="label"
        :start-label="startLabel"
        :end-label="endLabel"
        :start-placeholder="startPlaceholder"
        :end-placeholder="endPlaceholder"
        :name="name"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :message="message"
        :error="error"
        :min="min"
        :max="max"
        :disabled-date="disabledDate"
        :locale="locale"
        :update-on="updateOn"
        :mask="mask"
        :clearable="clearable"
        :data-test-id="dataTestId"
        @update:model-value="onInputUpdate"
        @update:valid="inputValid = $event"
        @blur="onInputBlur"
        @focus="onInputFocus"
        @clear="onInputClear"
        @keydown.esc.stop="close"
      >
        <template #append>
          <VcButton
            type="button"
            icon="calendar"
            variant="ghost"
            color="primary"
            :disabled="disabled || readonly"
            :aria-label="t('ui_kit.accessibility.open_calendar')"
            aria-haspopup="dialog"
            :aria-expanded="String(triggerProps['aria-expanded'] ?? false)"
            :aria-controls="toggleAriaControls(triggerProps)"
            @click="toggle"
            @keydown.esc.stop="onEscapeClose(close)"
          />
        </template>
      </VcDateRangeInput>
    </template>

    <template #content="{ close }">
      <VcRangeCalendar
        ref="calendarRef"
        :model-value="modelValue"
        :size="calendarSize"
        :min="min"
        :max="max"
        :disabled-date="disabledDate"
        :locale="locale"
        :first-day-of-week="firstDayOfWeek"
        :weekday-format="weekdayFormat"
        :show-footer="showFooter"
        @keydown.esc.stop="onEscapeClose(close)"
        @update:model-value="onCalendarUpdate(close, $event)"
        @update:valid="calendarValid = $event"
      />
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useComponentId, useDateRangeField } from "@/ui-kit/composables";
import { crossedFocusBoundary } from "@/ui-kit/utilities/focus";
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
  enableTeleport?: boolean;
  showFooter?: boolean;
  firstDayOfWeek?: VcCalendarFirstDayOfWeekType;
  weekdayFormat?: VcCalendarWeekdayFormatType;
  closeOnSelect?: boolean;
  placement?: VcPopoverPlacementType;
  /** Field presentation. "combined" = one field with two segments. "split" = two separate labelled fields. */
  layout?: VcDateRangePickerLayoutType;
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
  size: "md",
  updateOn: "blur",
  closeOnSelect: true,
  placement: "bottom-end",
  layout: "combined",
});

const { t } = useI18n();

const rangeInputRef = useTemplateRef<{ startInputElement: HTMLInputElement | null } | null>("rangeInputRef");
const calendarRef = useTemplateRef<{ focusActiveCell: () => void } | null>("calendarRef");

// In "split" the two fields are hide-details, so the picker owns range validity itself;
// in "combined" VcDateRangeInput owns it and reports through update:valid.
const {
  isValid: splitValid,
  computedError,
  computedMessage,
  orderValid,
  setSegmentValid,
  mergeRange,
} = useDateRangeField({
  modelValue: () => props.modelValue,
  error: () => props.error,
  message: () => props.message,
});

const detailsId = useComponentId("date-range-picker") + "-details";

// Two independent validity sources (field format+order, calendar in-range availability).
// AND-aggregate them — piping both straight to the emit lets the later one overwrite the earlier.
const inputValid = ref(true);
const calendarValid = ref(true);
const aggregatedValid = computed<boolean>(() => {
  if (props.layout === "split") {
    return splitValid.value;
  }
  return inputValid.value && calendarValid.value;
});
watch(aggregatedValid, (value) => emit("update:valid", value), { immediate: true });

// Intersect the caller's boundaries with the opposite endpoint so the calendars cannot pick an
// out-of-order range. ISO YYYY-MM-DD compares lexicographically.
// An already out-of-order range is exempt: clamping there puts each boundary on the wrong side of
// that field's own value, disabling every day of the month it opens on — the user could not fix it.
const startMax = computed<string | undefined>(() => {
  const end = props.modelValue?.end;
  if (!end || !orderValid.value) {
    return props.max;
  }
  if (!props.max) {
    return end;
  }
  return props.max < end ? props.max : end;
});

const endMin = computed<string | undefined>(() => {
  const start = props.modelValue?.start;
  if (!start || !orderValid.value) {
    return props.min;
  }
  if (!props.min) {
    return start;
  }
  return props.min > start ? props.min : start;
});

// Start-align the start field's calendar so it does not overhang the separator, keeping the
// caller's vertical side.
const startPlacement = computed<VcPopoverPlacementType>(() => {
  return props.placement.startsWith("top") ? "top-start" : "bottom-start";
});

// Everything the two "split" fields share, so a new prop is forwarded in one place, not two.
const sharedFieldProps = computed(() => ({
  // hideDetails suppresses each field's own aria-describedby, so the shared row is wired by hand.
  hideDetails: true,
  aria: {
    "aria-invalid": computedError.value ? "true" : "false",
    "aria-describedby": computedMessage.value ? detailsId : null,
    // The asterisk lives on the group label only, so the semantics have to be forwarded separately.
    "aria-required": props.required ? "true" : null,
  },
  size: props.size,
  disabled: props.disabled,
  readonly: props.readonly,
  error: computedError.value,
  min: props.min,
  max: props.max,
  disabledDate: props.disabledDate,
  locale: props.locale,
  updateOn: props.updateOn,
  mask: props.mask,
  clearable: props.clearable,
  enableTeleport: props.enableTeleport,
  showFooter: props.showFooter,
  firstDayOfWeek: props.firstDayOfWeek,
  weekdayFormat: props.weekdayFormat,
  closeOnSelect: props.closeOnSelect,
  placement: props.placement,
}));

function sideAttr(value: string | undefined, side: "start" | "end"): string | undefined {
  if (!value) {
    return undefined;
  }
  return `${value}-${side}`;
}

const calendarSize = computed<VcCalendarSizeType>(() => {
  if (props.size === "auto") {
    return "md";
  }
  return props.size;
});

function toggleAriaControls(triggerProps: Record<string, unknown>): string | undefined {
  const controls = triggerProps["aria-controls"];
  return typeof controls === "string" ? controls : undefined;
}

function onInputUpdate(value: VcDateRange | undefined): void {
  emit("update:modelValue", value);
}

function onInputBlur(event: FocusEvent): void {
  emit("blur", event);
}

function onInputFocus(event: FocusEvent): void {
  emit("focus", event);
}

function onInputClear(): void {
  emit("clear");
}

function onSegment(which: "start" | "end", value: string | undefined): void {
  emit("update:modelValue", mergeRange(which, value));
}

// "split" focus/blur are shell-level: emit only when focus crosses the row boundary,
// not when it moves between the two fields or their calendar buttons.
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

function onPopoverToggle(opened: boolean): void {
  if (!opened) {
    return;
  }
  void nextTick(() => {
    calendarRef.value?.focusActiveCell();
  });
}

function onEscapeClose(close: () => void): void {
  close();
  rangeInputRef.value?.startInputElement?.focus();
}

function onCalendarUpdate(close: () => void, value: VcDateRange | undefined): void {
  if (props.disabled || props.readonly) {
    return;
  }
  emit("update:modelValue", value);
  // Close only once BOTH endpoints are committed (2nd pick), not after the anchor.
  if (props.closeOnSelect && value?.start && value?.end) {
    close();
    rangeInputRef.value?.startInputElement?.focus();
  }
}
</script>

<style lang="scss">
.vc-date-range-picker {
  --field-height: theme("spacing.11");

  &--size {
    &--xs {
      --field-height: theme("spacing.8");
    }

    &--sm {
      // No 2.375rem spacing token — literal, same as vc-input.
      --field-height: 2.375rem;
    }

    // "auto" leaves the input box content-sized, so a fixed separator height would decentre the dash.
    &--auto {
      --field-height: auto;
    }
  }

  &--layout {
    &--split {
      @apply flex flex-col;
    }
  }

  &__fields {
    @apply flex items-end gap-2;
  }

  &__field {
    @apply grow shrink basis-0 min-w-0;
  }

  // Labels sit above the inputs, so match the input box height and centre the dash inside it.
  &__separator {
    @apply flex shrink-0 items-center text-neutral-400 select-none h-[--field-height];
  }
}
</style>
