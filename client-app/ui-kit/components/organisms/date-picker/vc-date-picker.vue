<template>
  <VcPopover :placement="placement" :offset-options="{ mainAxis: 4 }">
    <template #default="{ opened, toggle }">
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
        :locale="locale"
        :update-on="updateOn"
        :mask="mask"
        :clearable="clearable"
        :aria-label="ariaLabel"
        :aria="{
          'aria-haspopup': 'dialog',
          'aria-expanded': opened ? 'true' : 'false',
          'aria-controls': popoverContentId,
        }"
        :tabindex="tabindex"
        :data-test-id="dataTestId"
        @update:model-value="onInputUpdate"
        @blur="onInputBlur"
        @focus="onInputFocus"
        @clear="onInputClear"
      >
        <template #append>
          <VcButton
            type="button"
            icon="calendar"
            variant="no-background"
            color="neutral"
            :disabled="disabled || readonly"
            :aria-label="t('ui_kit.accessibility.open_calendar')"
            @click="toggle"
          />
        </template>
      </VcDateInput>
    </template>

    <template #content="{ close }">
      <div :id="popoverContentId" role="dialog" :aria-label="t('ui_kit.calendar.aria_label')">
        <VcCalendar
          :model-value="modelValue"
          :size="calendarSize"
          :min="min"
          :max="max"
          :disabled-date="disabledDate"
          :locale="locale"
          :first-day-of-week="firstDayOfWeek"
          :weekday-format="weekdayFormat"
          :show-footer="showFooter"
          @update:model-value="onCalendarUpdate(close, $event)"
        />
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useComponentId } from "@/ui-kit/composables";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";

interface IProps {
  /** ISO YYYY-MM-DD canonical value. */
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
  /** ISO YYYY-MM-DD min boundary. */
  min?: string;
  /** ISO YYYY-MM-DD max boundary. */
  max?: string;
  /** Predicate that returns true to mark a date unavailable (greyed out). */
  disabledDate?: VcCalendarDisabledDateType;
  /** Override locale; defaults to active i18n locale. */
  locale?: string;
  /** When to commit user input on the text input. Default "blur". Enter always commits. */
  updateOn?: VcDateFieldUpdateOnType;
  /** Apply a locale-aware input mask on the text input. See VcDateInput for semantics. */
  mask?: boolean;
  clearable?: boolean;
  /** Show the calendar footer (Today / Clear buttons). */
  showFooter?: boolean;
  firstDayOfWeek?: VcCalendarFirstDayOfWeekType;
  weekdayFormat?: VcCalendarWeekdayFormatType;
  /** Close the popover when a date is selected via calendar. Default true. */
  closeOnSelect?: boolean;
  /** Popover placement relative to the input. Default "bottom-end". */
  placement?: VcPopoverPlacementType;
  ariaLabel?: string;
  tabindex?: string | number;
  dataTestId?: string;
}

interface IEmits {
  (event: "update:modelValue", value: string | undefined): void;
  (event: "change", value: string | undefined): void;
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

const popoverContentId = useComponentId("vc-date-picker-popover");
const dateInputRef = useTemplateRef<{ inputElement: HTMLInputElement | null } | null>("dateInputRef");
const innerInputElement = computed<HTMLInputElement | null>(() => dateInputRef.value?.inputElement ?? null);

// VcInputSizeType includes "auto" which VcCalendar doesn't model — fall back to "md".
const calendarSize = computed<VcCalendarSizeType>(() => {
  if (props.size === "auto") {
    return "md";
  }
  return props.size;
});

function onInputUpdate(value: string | undefined): void {
  emit("update:modelValue", value);
  emit("change", value);
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

function onCalendarUpdate(close: () => void, value: string | undefined): void {
  emit("update:modelValue", value);
  emit("change", value);
  if (props.closeOnSelect && value !== undefined) {
    close();
    // Return focus to the input after the popover closes — accessible keyboard flow.
    innerInputElement.value?.focus();
  }
}

defineExpose({
  inputElement: innerInputElement,
});
</script>
