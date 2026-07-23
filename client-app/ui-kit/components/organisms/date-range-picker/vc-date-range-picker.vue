<template>
  <VcPopover
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
});

const { t } = useI18n();

const rangeInputRef = useTemplateRef<{ startInputElement: HTMLInputElement | null } | null>("rangeInputRef");
const calendarRef = useTemplateRef<{ focusActiveCell: () => void } | null>("calendarRef");

// Two independent validity sources (field format+order, calendar in-range availability).
// AND-aggregate them — piping both straight to the emit lets the later one overwrite the earlier.
const inputValid = ref(true);
const calendarValid = ref(true);
const combinedValid = computed<boolean>(() => inputValid.value && calendarValid.value);
watch(combinedValid, (value) => emit("update:valid", value), { immediate: true });

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
