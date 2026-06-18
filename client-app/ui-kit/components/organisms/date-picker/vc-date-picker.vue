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
        :data-test-id="dataTestId"
        @keydown.esc.stop="close"
        @update:model-value="onInputUpdate"
        @update:valid="emit('update:valid', $event)"
        @blur="onInputBlur"
        @focus="onInputFocus"
        @clear="onInputClear"
      >
        <template #append>
          <!-- VcDateInput's Escape listener binds the inner <input>, so handle Escape on this sibling button too. -->
          <VcButton
            type="button"
            icon="calendar"
            variant="no-background"
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
      <!-- Escape from anywhere in the calendar closes the dialog (WCAG 2.1.2 no keyboard trap). -->
      <VcCalendar
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
      />
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
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
  /** Teleport the popover into #popover-host — use inside clipping containers (modal, overflow:hidden). */
  enableTeleport?: boolean;
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

const dateInputRef = useTemplateRef<{ inputElement: HTMLInputElement | null } | null>("dateInputRef");
const innerInputElement = computed<HTMLInputElement | null>(() => dateInputRef.value?.inputElement ?? null);

const calendarRef = useTemplateRef<{ focusActiveCell: () => void } | null>("calendarRef");

// VcInputSizeType includes "auto" which VcCalendar doesn't model — fall back to "md".
const calendarSize = computed<VcCalendarSizeType>(() => {
  if (props.size === "auto") {
    return "md";
  }
  return props.size;
});

function forwardedAria(triggerProps: Record<string, unknown>): Record<string, string | number | null> {
  const aria: Record<string, string | number | null> = {
    // combobox role makes aria-expanded/haspopup/controls valid on the input (a textbox disallows them).
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
  // VcPopover doesn't focus its content; move focus into the grid (WCAG 2.1.1).
  // nextTick: content is display:none until opened, so wait until it is visible.
  void nextTick(() => {
    calendarRef.value?.focusActiveCell();
  });
}

function onEscapeClose(close: () => void): void {
  close();
  // Return focus to the trigger so keyboard users are not stranded.
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
