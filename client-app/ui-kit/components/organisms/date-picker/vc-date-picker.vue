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
      <VcDateInput
        ref="dateInputRef"
        :model-value="modelValue"
        :size="size"
        :label="label"
        :placeholder="placeholder"
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
        :aria-label="ariaLabel"
        :aria="forwardedAria(triggerProps)"
        :tabindex="tabindex"
        :hide-details="hideDetails"
        :data-test-id="dataTestId"
        @keydown.esc.stop="close"
        @update:model-value="onInputUpdate"
        @update:valid="emit('update:valid', $event)"
        @blur="onInputBlur"
        @focus="onInputFocus"
        @clear="onInputClear"
      >
        <template #append>
          <!-- VcDateInput's Escape listener binds the inner input, so this sibling needs its own -->
          <VcButton
            type="button"
            icon="calendar"
            variant="ghost"
            color="primary"
            :disabled="disabled || readonly"
            :aria-label="t('ui_kit.accessibility.open_calendar')"
            @click="toggle"
            @keydown.esc.stop="onEscapeClose(close)"
          />
        </template>
      </VcDateInput>
    </template>

    <template #content="{ close }">
      <VcCalendar
        ref="calendarRef"
        :model-value="modelValue"
        :size="calendarSize"
        :min="calendarMin ?? min"
        :max="calendarMax ?? max"
        :disabled-date="disabledDate"
        :locale="locale"
        :first-day-of-week="firstDayOfWeek"
        :weekday-format="weekdayFormat"
        :show-footer="showFooter"
        @keydown.esc.stop="onEscapeClose(close)"
        @update:model-value="onCalendarUpdate(close, $event)"
      />
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";

type AriaAttributesType = Record<string, string | number | null>;

interface IProps {
  modelValue?: string;
  size?: VcInputSizeType;
  label?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  message?: string;
  error?: boolean;
  min?: string;
  max?: string;
  calendarMin?: string;
  calendarMax?: string;
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
  ariaLabel?: string;
  aria?: AriaAttributesType;
  tabindex?: string | number;
  hideDetails?: boolean;
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
  closeOnSelect: true,
  placement: "bottom-end",
  hideDetails: false,
});

const { t } = useI18n();

const dateInputRef = useTemplateRef<{ inputElement: HTMLInputElement | null } | null>("dateInputRef");
const innerInputElement = computed<HTMLInputElement | null>(() => dateInputRef.value?.inputElement ?? null);

const calendarRef = useTemplateRef<{ focusActiveCell: () => void } | null>("calendarRef");

// VcCalendar doesn't model the "auto" size.
const calendarSize = computed<VcCalendarSizeType>(() => {
  if (props.size === "auto") {
    return "md";
  }
  return props.size;
});

function forwardedAria(triggerProps: Record<string, unknown>): AriaAttributesType {
  const aria: AriaAttributesType = {
    ...props.aria,
    // A textbox disallows aria-expanded/haspopup/controls; combobox permits them.
    role: "combobox",
    "aria-haspopup": triggerProps["aria-haspopup"] as string,
    "aria-expanded": String(triggerProps["aria-expanded"] ?? false),
  };
  const controls = triggerProps["aria-controls"];
  if (typeof controls === "string") {
    aria["aria-controls"] = controls;
  }
  return aria;
}

function onInputUpdate(value: string | undefined): void {
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
  // VcPopover doesn't focus its content, and it stays display:none until the open flush.
  void nextTick(() => {
    calendarRef.value?.focusActiveCell();
  });
}

function onEscapeClose(close: () => void): void {
  close();
  innerInputElement.value?.focus();
}

function onCalendarUpdate(close: () => void, value: string | undefined): void {
  if (props.disabled || props.readonly) {
    return;
  }
  emit("update:modelValue", value);
  if (props.closeOnSelect) {
    close();
    innerInputElement.value?.focus();
  }
}

defineExpose({
  inputElement: innerInputElement,
});
</script>
