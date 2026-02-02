<template>
  <fieldset class="vc-slider">
    <legend class="sr-only">{{ $t("ui_kit.slider.legend", { min, max }) }}</legend>

    <div v-if="cols.length > 1" class="vc-slider__cols" :style="colsHeight && { height: colsHeight }">
      <template v-for="(col, i) in normalizedCols" :key="i">
        <VcTooltip
          v-if="showTooltipOnColHover || updateOnColumnClick"
          :class="[
            'vc-slider__col',
            {
              'vc-slider__col--hoverable': showTooltipOnColHover && col.count,
              'vc-slider__col--clickable': updateOnColumnClick,
            },
          ]"
          :style="{
            left: col.position.left,
            right: col.position.right,
          }"
          width="7rem"
          z-index="20"
          placement="top"
          :disabled="!showTooltipOnColHover || !col.count"
        >
          <template #default="{ triggerProps, tooltipId }">
            <button
              type="button"
              class="vc-slider__button"
              :disabled="disabled"
              :aria-label="
                $t('ui_kit.slider.column_aria_label', { count: col.count, from: col.value[0], to: col.value[1] })
              "
              v-bind="getTooltipTriggerEvents(triggerProps, tooltipId, col.count)"
              @click="onColumnClick({ value: [col.value[0], col.value[1]] })"
            >
              <span class="vc-slider__col-line" :style="{ height: col.height }"></span>
            </button>
          </template>

          <template #content>
            {{ $t("ui_kit.slider.tooltip", { count: col.count }) }}
          </template>
        </VcTooltip>

        <!-- Purely decorative column when no interaction is needed -->
        <div
          v-else
          class="vc-slider__col"
          :style="{
            left: col.position.left,
            right: col.position.right,
          }"
          aria-hidden="true"
        >
          <span class="vc-slider__button vc-slider__button--non-interactive">
            <span class="vc-slider__col-line" :style="{ height: col.height }"></span>
          </span>
        </div>
      </template>
    </div>

    <div ref="sliderRef" class="vc-slider__slider"></div>

    <div class="vc-slider__inputs">
      <label :for="`slider-input-start-${uniqueId}`" class="sr-only">
        {{ $t("ui_kit.slider.start_input_label", { min, max }) }}
      </label>

      <VcInput
        :id="`slider-input-start-${uniqueId}`"
        v-model="leftInput"
        size="sm"
        class="vc-slider__input"
        :disabled="disabled"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :aria-label="$t('ui_kit.slider.start_input_aria_label', { min, max })"
        :aria-describedby="`slider-input-start-help-${uniqueId}`"
        :aria="startInputAriaAttributes"
        test-id-input="slider-input-start"
        @focus="handleStartInputFocus"
        @blur="handleInputBlur"
        @keyup.enter="handleEnterKey"
      />

      <span :id="`slider-input-start-help-${uniqueId}`" class="sr-only">
        {{ $t("ui_kit.slider.start_input_help", { min, max, step }) }}
      </span>

      <template v-if="!isNaN(rightInput)">
        <b class="vc-slider__dash" aria-hidden="true">&mdash;</b>

        <label :for="`slider-input-end-${uniqueId}`" class="sr-only">
          {{ $t("ui_kit.slider.end_input_label", { min, max }) }}
        </label>

        <VcInput
          :id="`slider-input-end-${uniqueId}`"
          v-model="rightInput"
          size="sm"
          class="vc-slider__input"
          :disabled="disabled"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :aria-label="$t('ui_kit.slider.end_input_aria_label', { min, max })"
          :aria-describedby="`slider-input-end-help-${uniqueId}`"
          :aria="endInputAriaAttributes"
          test-id-input="slider-input-end"
          @focus="handleEndInputFocus"
          @blur="handleInputBlur"
          @keyup.enter="handleEnterKey"
        />

        <span :id="`slider-input-end-help-${uniqueId}`" class="sr-only">
          {{ $t("ui_kit.slider.end_input_help", { min, max, step }) }}
        </span>
      </template>
    </div>

    <!-- Screen reader announcements - only updated when values change via user interaction -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcementText }}
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { isNaN, isEqual, omit, uniqueId as getUniqueId } from "lodash";
import { create } from "nouislider";
import { ref, onMounted, onUnmounted, computed, toRefs, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import type { API } from "nouislider";
import "nouislider/dist/nouislider.css";

export type RangeType = [number, number];
type ColRangeType = [null, number] | [number, number] | [number, null];
export type ColType = { count: number; value: ColRangeType };

interface INormalizedCol {
  value: [number, number];
  count: number;
  height: string;
  position: {
    left: string | number;
    right: string | number;
  };
}

interface IEmits {
  (event: "change", value: RangeType): void;
}

interface IProps {
  min?: number;
  max: number;
  step?: number;
  cols?: ColType[];
  colsHeight?: string;
  updateOnColumnClick?: boolean;
  showTooltipOnColHover?: boolean;
  disabled?: boolean;
  value: RangeType;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  step: 1,
  min: 0,
  cols: () => [],
  updateOnColumnClick: false,
  showTooltipOnColHover: false,
});

const { t } = useI18n();

const DEFAULT_DEBOUNCE_IN_MS = 200;

const { value, min, max, step, cols, disabled } = toRefs(props);

const leftInput = ref<number>(0);
const rightInput = ref<number>();
const isAnyInputFocused = ref<boolean>(false);
const uniqueId = getUniqueId("slider");
const announcementText = ref<string>("");

// Computed properties for input validation states
const isStartInputInvalid = computed(() => {
  const startVal = leftInput.value;
  const endVal = rightInput.value;
  // Invalid if outside range or if start > end (when both values exist)
  const isOutOfRange = startVal < min.value || startVal > max.value;
  const isGreaterThanEnd = endVal != null && startVal > endVal;
  return isOutOfRange || isGreaterThanEnd;
});

const isEndInputInvalid = computed(() => {
  const endVal = rightInput.value;
  if (endVal == null) return false;
  const startVal = leftInput.value;
  // Invalid if outside range or if end < start
  const isOutOfRange = endVal < min.value || endVal > max.value;
  const isLessThanStart = endVal < startVal;
  return isOutOfRange || isLessThanStart;
});

// ARIA attributes for inputs including aria-invalid
const startInputAriaAttributes = computed(
  (): Record<string, string | null> => ({
    "aria-invalid": isStartInputInvalid.value ? "true" : null,
  }),
);

const endInputAriaAttributes = computed(
  (): Record<string, string | null> => ({
    "aria-invalid": isEndInputInvalid.value ? "true" : null,
  }),
);

watch([value, min, max], ([newValue, newMin, newMax]) => {
  if (slider) {
    slider.updateOptions(
      {
        start: getSliderStart(newValue[0], newValue[1]),
        range: { min: newMin, max: newMax },
      },
      false,
    );
  }

  leftInput.value = newValue[0];
  rightInput.value = typeof newValue[1] === "number" ? newValue[1] : undefined;
});

// Watch for disabled prop changes to update slider state and ARIA attributes
watch(disabled, (isDisabled) => {
  if (slider) {
    // Enable or disable the slider interaction
    if (isDisabled) {
      slider.disable();
    } else {
      slider.enable();
    }

    // Update ARIA attributes on handles (reuse existing function to avoid duplication)
    updateSliderHandleAria(leftInput.value, rightInput.value ?? leftInput.value);
  }
});

const sliderRef = ref<HTMLElement | null>(null);
let slider: API | null = null;

const normalizedCols = computed((): INormalizedCol[] => {
  if (!cols.value.length) {
    return [];
  }

  const allowedCols = cols.value.filter((column) => {
    const [from, to] = column.value;

    if (!from && to) {
      return to > min.value && to < max.value;
    }

    if (from && !to) {
      return from > min.value && from < max.value;
    }

    return !!from && !!to && to > min.value && from < max.value;
  });

  const counts = allowedCols.map((column) => column.count);
  const maxCount = Math.max(...counts, 1);

  return allowedCols.map((column): INormalizedCol => {
    const [from, to] = column.value;
    const _from = from && from > min.value ? from : min.value;
    const _to = to && to < max.value ? to : max.value;

    return {
      value: [_from, _to],
      count: column.count,
      height: `${Math.round((column.count / maxCount) * 100)}%`,
      position: {
        left: _from ? `${((_from - min.value) / (max.value - min.value)) * 100}%` : 0,
        right: _to ? `${((max.value - _to) / (max.value - min.value)) * 100}%` : 0,
      },
    };
  });
});

function handleStartInputFocus() {
  isAnyInputFocused.value = true;
}

function handleEndInputFocus() {
  isAnyInputFocused.value = true;
}

function handleInputBlur() {
  // Use setTimeout to ensure focus state is updated before checking
  isAnyInputFocused.value = false;

  setTimeout(() => {
    // Only apply constraints if no input is focused
    if (!isAnyInputFocused.value) {
      applyInputConstraints();
    }
  }, 0);
}

function handleEnterKey() {
  // Apply constraints immediately when Enter is pressed
  applyInputConstraints();
}

function applyInputConstraints() {
  let newStart = leftInput.value;
  let newEnd = rightInput.value;

  // Fallback to 0 if inputs are empty
  [newStart, newEnd] = enforceMinimumDistance(newStart || 0, newEnd || 0);

  leftInput.value = newStart;
  rightInput.value = newEnd;

  const innerRange = [newStart, newEnd] satisfies RangeType;
  if (!isEqual(innerRange, props.value)) {
    emit("change", innerRange);
    // Announce the change to screen readers
    announceValueChange(newStart, newEnd);
  }
}

/**
 * Updates ARIA attributes on slider handles for accessibility
 */
function updateSliderHandleAria(startValue: number, endValue: number): void {
  if (!sliderRef.value) return;

  const handles = sliderRef.value.querySelectorAll<HTMLElement>(".noUi-handle");
  handles.forEach((handle, index) => {
    const isStartHandle = index === 0;
    const currentValue = isStartHandle ? startValue : endValue;

    // aria-label describes the control (what it is)
    const label = isStartHandle ? t("ui_kit.slider.start_handle_label") : t("ui_kit.slider.end_handle_label");

    // aria-valuetext describes the current value in human-readable form
    const valueText = isStartHandle
      ? t("ui_kit.slider.start_handle_aria_label", { value: currentValue, min: min.value, max: max.value })
      : t("ui_kit.slider.end_handle_aria_label", { value: currentValue, min: min.value, max: max.value });

    handle.setAttribute("role", "slider");
    handle.setAttribute("aria-orientation", "horizontal");
    handle.setAttribute("aria-valuemin", String(min.value));
    handle.setAttribute("aria-valuemax", String(max.value));
    handle.setAttribute("aria-valuenow", String(currentValue));
    handle.setAttribute("aria-valuetext", valueText);
    handle.setAttribute("aria-label", label);

    // Set aria-disabled when the slider is disabled
    if (disabled.value) {
      handle.setAttribute("aria-disabled", "true");
    } else {
      handle.removeAttribute("aria-disabled");
    }
  });
}

/**
 * Announces value changes to screen readers
 */
function announceValueChange(startValue: number, endValue: number): void {
  announcementText.value = t("ui_kit.slider.current_value_announcement", {
    start: startValue,
    end: endValue,
    min: min.value,
    max: max.value,
  });
}

onMounted(() => {
  if (!sliderRef.value) {
    return;
  }

  slider = create(sliderRef.value, {
    start: getSliderStart(value.value[0], value.value[1]),
    connect: true,
    step: step.value,
    range: { min: min.value, max: max.value },
  });

  // Set up ARIA attributes on handles after slider is created
  // and disable the slider if initially disabled
  void nextTick(() => {
    updateSliderHandleAria(value.value[0], value.value[1]);

    // Disable slider if initially disabled
    if (disabled.value && slider) {
      slider.disable();
    }
  });

  slider.on("update", (v: (string | number)[]) => {
    const [newStart, newEnd] = enforceMinimumDistance(+v[0], +v[1], leftInput.value);
    leftInput.value = newStart;
    rightInput.value = newEnd;

    // Update ARIA attributes on handles
    updateSliderHandleAria(newStart, newEnd);
  });

  // Debounced version of the change handler for smoother updates
  const debouncedChangeHandler = useDebounceFn((v: (string | number)[]) => {
    const [newStart, newEnd] = enforceMinimumDistance(+v[0], +v[1], leftInput.value);
    const range: RangeType = [newStart, newEnd];
    leftInput.value = range[0];
    rightInput.value = range[1];

    // Only emit and announce if values actually changed
    if (!isEqual(range, props.value)) {
      emit("change", range);
      // Announce the change to screen readers
      announceValueChange(newStart, newEnd);
    }
  }, DEFAULT_DEBOUNCE_IN_MS);

  // Listen for slider changes with debouncing
  slider.on("change", debouncedChangeHandler);
});

onUnmounted(() => {
  if (slider) {
    slider.destroy();
    slider = null;
  }
});

/**
 * Filters tooltip trigger props to avoid nested interactive elements.
 * Removes button-like props since we're using a native button element.
 */
function getTooltipTriggerEvents(
  triggerProps: Record<string, unknown>,
  tooltipId?: string,
  colCount?: number,
): Record<string, unknown> {
  // Remove button-like props since we're using a native <button>
  const events = omit(triggerProps, ["role", "aria-haspopup", "aria-expanded", "aria-controls"]);

  return {
    ...events,
    // Only add aria-describedby if tooltip is actually shown (has count and tooltip enabled)
    "aria-describedby": props.showTooltipOnColHover && colCount ? tooltipId : undefined,
  };
}

function onColumnClick(col: { value: [number, number] }): void {
  if (!props.updateOnColumnClick || disabled.value) {
    return;
  }

  const [newStart, newEnd] = enforceMinimumDistance(col.value[0], col.value[1]);
  const newValues: RangeType = [newStart, newEnd];

  // Only update if values actually changed
  if (!isEqual(newValues, props.value)) {
    leftInput.value = newStart;
    rightInput.value = newEnd;

    slider?.updateOptions(
      {
        start: getSliderStart(newStart, newEnd),
      },
      false,
    );

    // Update ARIA attributes on handles
    updateSliderHandleAria(newStart, newEnd);
    // Announce the change to screen readers
    announceValueChange(newStart, newEnd);

    emit("change", newValues);
  }
}

function clampValue(val: number): number {
  return Math.max(min.value, Math.min(max.value, val));
}

function adjustForMinimumDistance(startValue: number, endValue: number, previousStart?: number): [number, number] {
  if (Math.abs(endValue - startValue) < step.value) {
    if (previousStart !== undefined && startValue === previousStart) {
      // End handle was moved, adjust start
      startValue = endValue - step.value;
      if (startValue < min.value) {
        startValue = min.value;
        endValue = Math.min(max.value, startValue + step.value);
      }
    } else {
      // Start handle was moved, adjust end
      endValue = startValue + step.value;
      if (endValue > max.value) {
        endValue = max.value;
        startValue = Math.max(min.value, endValue - step.value);
      }
    }
  }
  return [startValue, endValue];
}

function enforceMinimumDistance(startValue: number, endValue: number, previousStart?: number): [number, number] {
  // Clamp values to min/max boundaries
  startValue = clampValue(startValue);
  endValue = clampValue(endValue);

  // Handle case where start value is higher than end value
  if (startValue > endValue) {
    [startValue, endValue] = [endValue, startValue];
  }

  // Ensure minimum distance between handles
  [startValue, endValue] = adjustForMinimumDistance(startValue, endValue, previousStart);

  // Final validation to ensure minimum step distance
  if (Math.abs(endValue - startValue) < step.value) {
    if (endValue + step.value <= max.value) {
      endValue = startValue + step.value;
    } else if (startValue - step.value >= min.value) {
      startValue = endValue - step.value;
    } else {
      // Fallback: center the range with minimum distance
      const center = (min.value + max.value) / 2;
      startValue = Math.max(min.value, center - step.value / 2);
      endValue = Math.min(max.value, center + step.value / 2);
    }
  }

  return [startValue, endValue];
}

function getSliderStart(value1: number, value2: number): [number, number] {
  return [value1, value2];
}
</script>

<style lang="scss">
.vc-slider {
  $hoverable: "";
  $clickable: "";
  $focusColumn: "";

  --props-cols-height: v-bind(props.colsHeight);
  --cols-height: var(--vc-slider-cols-height, var(--props-cols-height, 2rem));
  --handle-size: 1.125rem;

  @apply w-full;

  &__cols {
    @apply relative flex items-end;
  }

  &__col {
    @apply absolute cursor-default;

    &--hoverable {
      &:hover {
        $hoverable: &;
      }
    }

    &--clickable {
      &:hover {
        $clickable: &;
      }
    }
  }

  &__button {
    @apply flex flex-col justify-end w-full h-[var(--cols-height)] border-t border-x border-transparent cursor-default outline-none;

    &:focus {
      $focusColumn: &;

      @apply outline-none;
    }

    #{$clickable} & {
      @apply cursor-pointer;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }

    &--non-interactive {
      @apply pointer-events-none;
    }
  }

  &__col-line {
    @apply w-full bg-neutral-200 rounded-sm transition-all border-t border-x border-transparent;

    #{$hoverable} & {
      @apply bg-primary-200 border-primary-300;
    }

    #{$focusColumn} & {
      @apply outline outline-2 outline-primary-500/40;
    }
  }

  &__slider {
    @apply h-1 w-full border-none bg-neutral-300 shadow-none;

    .noUi-base {
      @apply flex flex-col justify-center;
    }

    .noUi-target {
      @apply rounded-full border-none;
    }

    .noUi-connect {
      @apply bg-primary;
    }

    .noUi-handle {
      @apply top-[calc(var(--handle-size)/-2.5)] right-[calc(var(--handle-size)/-2)] size-[--handle-size] rounded-full bg-additional-50 border-4 border-primary cursor-pointer;
      @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;

      &::before,
      &::after {
        content: none;
      }
    }

    .noUi-touch-area {
      @apply absolute size-[300%] top-[calc(var(--handle-size)/-2)] left-[calc(var(--handle-size)/-2)] rounded-full;
    }

    // Disabled state styling
    &[disabled] {
      @apply opacity-50;

      .noUi-connect {
        @apply bg-neutral-400;
      }

      .noUi-handle {
        @apply cursor-not-allowed border-neutral-400;
      }
    }
  }

  &__inputs {
    @apply flex items-center gap-2 mt-5;
  }

  &__input {
    @apply grow;
  }

  &__dash {
    @apply text-xl;
  }
}
</style>
