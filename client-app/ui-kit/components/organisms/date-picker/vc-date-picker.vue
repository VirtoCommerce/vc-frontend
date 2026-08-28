<template>
  <VcPopover
    :placement="placement"
    :offset-options="{ mainAxis: 4 }"
    :enable-teleport="enableTeleport"
    role="dialog"
    :aria-label="t('ui_kit.accessibility.calendar')"
    @toggle="onToggle"
  >
    <template #default="{ toggle, triggerProps, close, opened }">
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
        @keydown.esc="onFieldEscape($event, opened, close)"
        @update:model-value="onInputUpdate"
        @update:valid="emit('update:valid', $event)"
        @update:error-text="emit('update:errorText', $event)"
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
            @keydown.esc="onTriggerEscape($event, opened, close)"
          />
        </template>
      </VcDateInput>
    </template>

    <template #content="{ close }">
      <VcCalendar
        ref="calendarRef"
        :model-value="modelValue"
        :size="calendarSize"
        :min="min"
        :max="max"
        :soft-min="calendarSoftMin"
        :soft-max="calendarSoftMax"
        :disabled-date="disabledDate"
        :locale="locale"
        :first-day-of-week="firstDayOfWeek"
        :weekday-format="weekdayFormat"
        :show-footer="showFooter"
        :prevent-deselect="preventDeselect"
        @keydown.esc.stop="onEscapeClose(close)"
        @update:model-value="onCalendarUpdate(close, $event)"
        @clear="onCalendarClear(close)"
      />
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useCalendarPopover } from "@/ui-kit/composables";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";

type AriaAttributesType = Record<string, string | number | null>;

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
  /**
   * Advisory calendar-only lower bound. Earlier days are marked as out of the suggested range but stay
   * selectable and navigable — the range picker hints at the opposite endpoint without blocking a pick.
   */
  calendarSoftMin?: string;
  /** Advisory calendar-only upper bound. See `calendarSoftMin`. */
  calendarSoftMax?: string;
  /**
   * Predicate that returns true to mark a date unavailable (greyed out).
   * Read once at mount: reka takes the predicate by value, so swapping it later re-filters typed input but not the grid.
   */
  disabledDate?: VcCalendarDisabledDateType;
  /** Override locale; defaults to active i18n locale. */
  locale?: string;
  /** When to commit user input on the text input. Default "blur". Enter always commits. */
  updateOn?: VcDateFieldUpdateOnType;
  /** Apply a locale-aware input mask on the text input. See VcDateInput for semantics. */
  mask?: boolean;
  /** Show a clear button in the field. Default false — the field then has no pointer way to clear. */
  clearable?: boolean;
  /** Teleport the popover into #popover-host — use inside clipping containers (modal, overflow:hidden). */
  enableTeleport?: boolean;
  /** Keep a re-click on the selected day from clearing it. Default true. See VcCalendar. */
  preventDeselect?: boolean;
  /** Show the calendar footer (Today / Clear buttons). */
  showFooter?: boolean;
  firstDayOfWeek?: VcCalendarFirstDayOfWeekType;
  weekdayFormat?: VcCalendarWeekdayFormatType;
  /** Close the popover when a date is selected via calendar. Default true. */
  closeOnSelect?: boolean;
  /** Popover placement relative to the input. Default "bottom-end". */
  placement?: VcPopoverPlacementType;
  ariaLabel?: string;
  /** Extra ARIA attributes for the underlying input, merged under the combobox wiring this picker owns. */
  aria?: AriaAttributesType;
  tabindex?: string | number;
  /** Drop the details row (message/error text) so a parent can render one for a group of fields. */
  hideDetails?: boolean;
  dataTestId?: string;
}

interface IEmits {
  (event: "update:modelValue", value: string | undefined): void;
  (event: "update:valid", value: boolean): void;
  /** The per-reason message behind `update:valid`, for shells that render the details row themselves. */
  (event: "update:errorText", value: string | undefined): void;
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
  // Declared, not merely left undefined: these three decide whether the field has ANY pointer way to
  // clear, so the docs table has to show what a consumer gets when it passes nothing.
  clearable: false,
  showFooter: false,
  preventDeselect: true,
});

const { t } = useI18n();

const dateInputRef = useTemplateRef<{
  inputElement: HTMLInputElement | null;
  reset: () => void;
  clearText: () => void;
} | null>("dateInputRef");
const innerInputElement = computed<HTMLInputElement | null>(() => dateInputRef.value?.inputElement ?? null);

const calendarRef = useTemplateRef<{ focusActiveCell: () => void; $el?: Element | null } | null>("calendarRef");

const { calendarSize, focusField, onToggle, onEscapeClose, onFieldEscape, onTriggerEscape } = useCalendarPopover({
  size: () => props.size,
  getFocusTarget: () => innerInputElement.value,
  getCalendar: () => calendarRef.value,
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

// The model round trip cannot drive this: clearing an already-empty date emits nothing.
function onCalendarClear(close: () => void): void {
  if (props.disabled || props.readonly) {
    return;
  }
  emit("clear");
  // A CLEAR empties the text rather than resyncing it: an uncontrolled parent never writes the model
  // back, and reset() would paint the cleared date straight back in.
  dateInputRef.value?.clearText();
  if (props.closeOnSelect) {
    close();
    focusField();
  }
}

function onCalendarUpdate(close: () => void, value: string | undefined): void {
  if (props.disabled || props.readonly) {
    return;
  }
  emit("update:modelValue", value);
  // The field resyncs its display from a model CHANGE, so uncommitted text would outlive a pick of the
  // date already committed — leaving the calendar and the field disagreeing, with the field reporting
  // invalid for good. nextTick so the reset reads the applied model.
  void nextTick(() => {
    dateInputRef.value?.reset();
  });
  if (props.closeOnSelect) {
    close();
    focusField();
  }
}

defineExpose({
  inputElement: innerInputElement,
  /** Drops uncommitted text and re-reads the model; for shells that commit on this field's behalf. */
  reset: () => dateInputRef.value?.reset(),
});
</script>
