<template>
  <fieldset
    v-if="layout === 'split'"
    :class="['vc-date-range-picker', `vc-date-range-picker--layout--${layout}`, `vc-date-range-picker--size--${size}`]"
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
        :aria-label="startLabel ? undefined : t('ui_kit.date_range_input.start_date')"
        :placeholder="startPlaceholder"
        :name="sideAttr(name, 'start')"
        :calendar-max="startMax"
        :data-test-id="sideAttr(dataTestId, 'start')"
        @update:model-value="onSegment('start', $event)"
        @update:valid="setSegmentValid('start', $event)"
        @update:error-text="setSegmentErrorText('start', $event)"
        @clear="onInputClear"
      />

      <span class="vc-date-range-picker__separator" aria-hidden="true">–</span>

      <VcDatePicker
        v-bind="sharedFieldProps"
        class="vc-date-range-picker__field"
        :model-value="modelValue?.end"
        :label="endLabel"
        :aria-label="endLabel ? undefined : t('ui_kit.date_range_input.end_date')"
        :placeholder="endPlaceholder"
        :name="sideAttr(name, 'end')"
        :calendar-min="endMin"
        :data-test-id="sideAttr(dataTestId, 'end')"
        @update:model-value="onSegment('end', $event)"
        @update:valid="setSegmentValid('end', $event)"
        @update:error-text="setSegmentErrorText('end', $event)"
        @clear="onInputClear"
      />
    </div>

    <VcInputDetails
      :id="detailsId"
      :error="computedError"
      :message="computedMessage"
      :single-line="false"
      :show-empty="showEmptyDetails"
    />
  </fieldset>

  <VcPopover
    v-else
    :class="['vc-date-range-picker', `vc-date-range-picker--layout--${layout}`, `vc-date-range-picker--size--${size}`]"
    :placement="placement"
    :offset-options="{ mainAxis: 4 }"
    :enable-teleport="enableTeleport"
    role="dialog"
    :aria-label="t('ui_kit.accessibility.calendar')"
    @toggle="onToggle"
  >
    <template #default="{ toggle, triggerProps, close, opened }">
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
        :show-empty-details="showEmptyDetails"
        :data-test-id="dataTestId"
        @update:model-value="onInputUpdate"
        @update:valid="inputValid = $event"
        @update:error-text="inputErrorText = $event"
        @blur="onInputBlur"
        @focus="onInputFocus"
        @clear="onInputClear"
        @keydown.esc="onFieldEscape($event, opened, close)"
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
            @keydown.esc="onTriggerEscape($event, opened, close)"
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
        @clear="onCalendarClear(close)"
      />
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useCalendarPopover, useComponentId, useDateRangeField } from "@/ui-kit/composables";
import { classifyShellFocusOut, shellFocusEntered, watchFocusLeavingOwnPopover } from "@/ui-kit/utilities/focus";
import type { VcDateFieldUpdateOnType } from "@/ui-kit/composables";

interface IProps {
  /** Both endpoints as ISO YYYY-MM-DD. Either side may be undefined — a partial range is valid. */
  modelValue?: VcDateRangeType;
  size?: VcInputSizeType;
  /** Group label. In "split" it labels the pair; in "combined" it labels the single field. */
  label?: string;
  /** Start field label. Visible text in "split"; an aria-label on the segment in "combined". */
  startLabel?: string;
  /** End field label. Visible text in "split"; an aria-label on the segment in "combined". */
  endLabel?: string;
  /** Override the auto-derived locale hint on the start field (e.g. "MM/DD/YYYY"). */
  startPlaceholder?: string;
  /** Override the auto-derived locale hint on the end field. */
  endPlaceholder?: string;
  /** Base form name; the two fields get `-start` / `-end` suffixes. */
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  /** Info/help text for the shared details row. Shown when no validation error is active. */
  message?: string;
  /** External error flag (e.g. from vee-validate). Overrides internal validation display. */
  error?: boolean;
  /**
   * ISO YYYY-MM-DD min boundary. Gates both fields plus the calendar behind them — the single range
   * calendar in "combined", each field's own calendar in "split".
   */
  min?: string;
  /** ISO YYYY-MM-DD max boundary. See `min`. */
  max?: string;
  /** Predicate that returns true to mark a date unavailable (greyed out). Receives ISO YYYY-MM-DD. */
  disabledDate?: VcCalendarDisabledDateType;
  /** Override locale; defaults to active i18n locale. */
  locale?: string;
  /** When to commit typed input. Default "blur". Enter always commits. */
  updateOn?: VcDateFieldUpdateOnType;
  /** Apply a locale-aware input mask on the text inputs. See VcDateInput for semantics. */
  mask?: boolean;
  /**
   * Show a clear affordance. "combined" gets ONE shell-level button that resets both endpoints;
   * "split" forwards it to each field, so each button clears only its own endpoint.
   */
  clearable?: boolean;
  /** Keep the details row's height reserved while it has no message, so the layout below never shifts. */
  showEmptyDetails?: boolean;
  /** Teleport the popover into #popover-host — use inside clipping containers (modal, overflow:hidden). */
  enableTeleport?: boolean;
  /** Show the calendar footer: Clear in "combined", Today + Clear in "split"'s single-date calendars. */
  showFooter?: boolean;
  firstDayOfWeek?: VcCalendarFirstDayOfWeekType;
  weekdayFormat?: VcCalendarWeekdayFormatType;
  /**
   * Close the popover once a range is selected via calendar. Default true.
   * "combined" closes only after BOTH endpoints are picked; "split" closes each field on its own pick.
   */
  closeOnSelect?: boolean;
  /**
   * Popover placement relative to the field. Default "bottom-end". In "split" a top/bottom placement
   * is start-aligned for the start field's calendar; side placements pass through unchanged.
   */
  placement?: VcPopoverPlacementType;
  /**
   * "combined" (default) = one field with two segments and one range calendar.
   * "split" = two labelled VcDatePickers, the layout both order-filter call sites ship today.
   */
  layout?: VcDateRangePickerLayoutType;
  dataTestId?: string;
}

interface IEmits {
  (event: "update:modelValue", value: VcDateRangeType | undefined): void;
  /** Both endpoints parse AND `start <= end`. Empty and partial ranges report true. */
  (event: "update:valid", value: boolean): void;
  /** Touched-gated validation message, so a parent can own the details row. Not the `message` prop. */
  (event: "update:errorText", value: string | undefined): void;
  /** Focus left the whole control; moves between its own fields, buttons and calendar are not reported. */
  (event: "blur", focusEvent: FocusEvent): void;
  /** Focus entered the whole control; see `blur` for the boundary rule. */
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

const rangeInputRef = useTemplateRef<{
  startInputElement: HTMLInputElement | null;
  resetSegments: () => void;
} | null>("rangeInputRef");
const calendarRef = useTemplateRef<{ focusActiveCell: () => void; $el?: Element | null } | null>("calendarRef");

const { calendarSize, focusField, onToggle, onEscapeClose, onFieldEscape, onTriggerEscape } = useCalendarPopover({
  size: () => props.size,
  getFocusTarget: () => rangeInputRef.value?.startInputElement,
  getCalendar: () => calendarRef.value,
});

const detailsId = useComponentId("date-range-picker") + "-details";

// "split" fields are hide-details, so the picker owns range validity; "combined" delegates to VcDateRangeInput.
const {
  isValid: splitValid,
  internalErrorText: splitErrorText,
  computedError,
  computedMessage,
  orderValid,
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

// Seeded from the order check so an out-of-order initial model never reports a transient true.
const inputValid = ref(orderValid.value);
const inputErrorText = ref<string | undefined>(undefined);
const aggregatedValid = computed<boolean>(() => {
  if (props.layout === "split") {
    return splitValid.value;
  }
  return inputValid.value;
});
watch(aggregatedValid, (value) => emit("update:valid", value), { immediate: true });

// "split" owns the message itself; "combined" forwards what VcDateRangeInput reported.
const aggregatedErrorText = computed<string | undefined>(() =>
  props.layout === "split" ? splitErrorText.value : inputErrorText.value,
);
watch(aggregatedErrorText, (value) => emit("update:errorText", value), { immediate: true });

// Clamped to the opposite endpoint so the calendars cannot pick an out-of-order range.
// The clamp is dropped whenever it would cross the caller's own opposite bound — an out-of-order
// range, or an endpoint outside [min, max]: clamping there disables every day of every reachable month.
const startMax = computed<string | undefined>(() => {
  const end = props.modelValue?.end;
  if (!end || !orderValid.value) {
    return props.max;
  }
  if (props.min && end < props.min) {
    return props.max;
  }
  if (!props.max) {
    return end;
  }
  if (props.max < end) {
    return props.max;
  }
  return end;
});

const endMin = computed<string | undefined>(() => {
  const start = props.modelValue?.start;
  if (!start || !orderValid.value) {
    return props.min;
  }
  if (props.max && start > props.max) {
    return props.min;
  }
  if (!props.min) {
    return start;
  }
  if (props.min > start) {
    return props.min;
  }
  return start;
});

// Start-aligned so the start field's calendar does not overhang the separator.
// Side placements open beside the field, never across it, so they pass through untouched.
const startPlacement = computed<VcPopoverPlacementType>(() => {
  if (props.placement.startsWith("left") || props.placement.startsWith("right")) {
    return props.placement;
  }
  return props.placement.startsWith("top") ? "top-start" : "bottom-start";
});

const sharedFieldProps = computed(() => ({
  hideDetails: true,
  aria: segmentAria.value,
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

function toggleAriaControls(triggerProps: Record<string, unknown>): string | undefined {
  const controls = triggerProps["aria-controls"];
  return typeof controls === "string" ? controls : undefined;
}

function onInputUpdate(value: VcDateRangeType | undefined): void {
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

// Each split field's calendar is teleported out of this fieldset, so its own focusout never reports
// the real departure.
let stopPopoverFocusWatch: (() => void) | undefined;
onUnmounted(() => stopPopoverFocusWatch?.());

function onFocusIn(event: FocusEvent): void {
  if (shellFocusEntered(event)) {
    emit("focus", event);
  }
}

function onFocusOut(event: FocusEvent): void {
  const exit = classifyShellFocusOut(event);
  if (exit === "left") {
    emit("blur", event);
    return;
  }
  if (exit === "own-popover") {
    stopPopoverFocusWatch?.();
    stopPopoverFocusWatch = watchFocusLeavingOwnPopover(event, (blurEvent) => emit("blur", blurEvent));
  }
}

function onCalendarUpdate(close: () => void, value: VcDateRangeType | undefined): void {
  if (props.disabled || props.readonly) {
    return;
  }
  emit("update:modelValue", value);
  // Close only once BOTH endpoints are committed, not after the anchor.
  if (props.closeOnSelect && value?.start && value?.end) {
    close();
    focusField();
  }
}

// The model update alone can't drive this: clearing an already-empty range emits nothing.
function onCalendarClear(close: () => void): void {
  emit("clear");
  // Uncommitted segment text isn't cleared by the model round trip, exactly as in clearBoth.
  rangeInputRef.value?.resetSegments();
  if (props.closeOnSelect) {
    close();
    focusField();
  }
}
</script>

<style lang="scss">
.vc-date-range-picker {
  // Below this width the split row stacks; container queries can't read CSS custom properties.
  $fields-stack-breakpoint: 22rem;

  --field-height: theme("spacing.11");

  &--size {
    &--xs {
      --field-height: theme("spacing.8");
    }

    &--sm {
      // No 2.375rem spacing token — literal, same as vc-input.
      --field-height: 2.375rem;
    }

    // "auto" is content-sized; a fixed separator height would decentre the dash.
    &--auto {
      --field-height: auto;
    }
  }

  &--layout {
    // Root is a fieldset. Preflight zeroes its border/padding/margin; min-inline-size: min-content is
    // the one UA default it misses, and it would stop the container query from ever narrowing the row.
    &--split {
      @apply flex flex-col min-w-0;

      container-type: inline-size;
    }
  }

  &__fields {
    @apply flex items-end gap-2;

    // Side by side, the two placeholder-width fields need 22rem (352px); narrower than that they stack rather than truncate.
    @container (width < #{$fields-stack-breakpoint}) {
      @apply flex-col items-stretch;
    }
  }

  &__field {
    @apply grow shrink basis-0 min-w-0;

    // basis-0 sizes the main axis, which is height once stacked.
    @container (width < #{$fields-stack-breakpoint}) {
      @apply basis-auto;
    }
  }

  // Matches the input box height so the dash centres against it, not against the label row.
  &__separator {
    @apply flex shrink-0 items-center text-neutral-400 select-none h-[--field-height];

    @container (width < #{$fields-stack-breakpoint}) {
      @apply hidden;
    }
  }
}
</style>
