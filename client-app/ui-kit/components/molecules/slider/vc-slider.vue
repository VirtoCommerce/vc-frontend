<template>
  <div class="vc-slider" role="group" :aria-label="$t('ui_kit.slider.aria_label', { min, max })">
    <div v-if="cols.length > 1" class="vc-slider__cols" :style="colsHeight && { height: colsHeight }">
      <VcTooltip
        v-for="(col, i) in normalizedCols"
        :key="i"
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
        <template #trigger>
          <button
            type="button"
            class="vc-slider__button"
            :aria-label="$t('ui_kit.slider.column_aria_label', { count: col.count, from: col.value[0], to: col.value[1] })"
            @click="onColumnClick({ value: [col.value[0], col.value[1]] })"
          >
            <span class="vc-slider__col-line" :style="{ height: col.height }"></span>
          </button>
        </template>

        <template #content>
          {{ $t("ui_kit.slider.tooltip", { count: col.count }) }}
        </template>
      </VcTooltip>
    </div>

    <div
      ref="sliderRef"
      class="vc-slider__slider"
    ></div>

    <div class="vc-slider__inputs">
      <label :for="`slider-input-start-${uniqueId}`" class="sr-only">
        {{ $t('ui_kit.slider.start_input_label', { min, max }) }}
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
        @focus="handleStartInputFocus"
        @blur="handleInputBlur"
        @keyup.enter="handleEnterKey"
      />
      <span :id="`slider-input-start-help-${uniqueId}`" class="sr-only">
        {{ $t('ui_kit.slider.start_input_help', { min, max, step }) }}
      </span>

      <template v-if="!isNaN(rightInput)">
        <b class="vc-slider__dash" aria-hidden="true">&mdash;</b>

        <label :for="`slider-input-end-${uniqueId}`" class="sr-only">
          {{ $t('ui_kit.slider.end_input_label', { min, max }) }}
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
          @focus="handleEndInputFocus"
          @blur="handleInputBlur"
          @keyup.enter="handleEnterKey"
        />
        <span :id="`slider-input-end-help-${uniqueId}`" class="sr-only">
          {{ $t('ui_kit.slider.end_input_help', { min, max, step }) }}
        </span>
      </template>
    </div>

    <!-- Screen reader announcements -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ $t('ui_kit.slider.current_value_announcement', {
        start: value[0],
        end: typeof value[1] === 'number' ? value[1] : null,
        min,
        max
      }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNaN, isEqual, uniqueId as getUniqueId } from "lodash";
import { create } from "nouislider";
import { ref, onMounted, onUnmounted, computed, toRefs, watch } from "vue";
import type { API } from "nouislider"
import "nouislider/dist/nouislider.css";

export type RangeType = [number, number] | [number];
type ColRangeType = [null, number] | [number, number] | [number, null];
export type ColType = { count: number; value: ColRangeType };

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
  colsHeight: "",
  updateOnColumnClick: false,
  showTooltipOnColHover: false,
});

const { value, min, max, step, cols } = toRefs(props);

const leftInput = ref<number>(0);
const rightInput = ref<number>();
const isAnyInputFocused = ref<boolean>(false);
const uniqueId = getUniqueId('slider');

watch([value, min, max], ([newValue, newMin, newMax]) => {

  if (slider) {
    slider.updateOptions({
      start: getSliderStart(newValue[0], newValue[1]),
      range: { min: newMin, max: newMax },
    }, false);
  }

  leftInput.value = newValue[0];
  rightInput.value = typeof newValue[1] === "number" ? newValue[1] : undefined;
});

const sliderRef = ref<HTMLElement | null>(null);
let slider: API | null = null;

const normalizedCols = computed(() => {
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

    return from && to && to > min.value && from < max.value;
  });

  const counts = allowedCols.map((column) => column.count);
  const maxCount = Math.max(...counts, 1);

  return allowedCols.map((column) => {
    const [from, to] = column.value;
    const _from = from && from > min.value ? from : min.value;
    const _to = to && to < max.value ? to : max.value;

    return {
      value: [_from, _to],
      count: column.count,
      height: `${Math.round((column.count / maxCount) * 100)}%`,
      position: {
        left: _from ? `${((_from - min.value) / (max.value - min.value)) * 100}%` : 0,
        right: _to ? `${((max.value - _to) / (max.value - min.value)) * 100}%` : 100,
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

  if (typeof newEnd === "number") {
    [newStart, newEnd] = enforceMinimumDistance(newStart, newEnd);

    leftInput.value = newStart;
    rightInput.value = newEnd;
  }

  const innerRange = (typeof newEnd === "number" ? [newStart, newEnd] : [newStart]) satisfies RangeType;
  if (!isEqual(innerRange, props.value)) {
    emit("change", innerRange);
  }
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

  slider.on("update", (v: (string | number)[]) => {
    const [newStart, newEnd] = enforceMinimumDistance(+v[0], +v[1], leftInput.value);
    leftInput.value = newStart;
    rightInput.value = newEnd;
  });

  // Listen for when user stops dragging the slider
  slider.on("change", (v: (string | number)[]) => {
    const [newStart, newEnd] = enforceMinimumDistance(+v[0], +v[1], leftInput.value);
    const range: RangeType = [newStart, newEnd];
    leftInput.value = range[0];
    rightInput.value = range[1];

    // Only emit if values actually changed
    if (!isEqual(range, props.value)) {
      emit("change", range);
    }
  });
});

onUnmounted(() => {
  if (slider) {
    slider.destroy();
    slider = null;
  }
});

function onColumnClick(col: { value: [number, number] }): void {
  if (!props.updateOnColumnClick) {
    return;
  }

  const [newStart, newEnd] = enforceMinimumDistance(col.value[0], col.value[1]);

  leftInput.value = newStart;
  rightInput.value = newEnd;

  slider?.updateOptions({
      start: getSliderStart(newStart, newEnd),
    }, false);

  emit("change", [newStart, newEnd]);
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

function getSliderStart(value1: number, value2?: number): [number, number] | [number] {
  return typeof value2 === "number"
    ? [value1, value2]
    : [value1]
}
</script>

<style lang="scss">
.vc-slider {
  $hoverable: "";
  $clickable: "";

  --props-cols-height: v-bind(colsHeight);
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
    @apply flex flex-col justify-end w-full h-[var(--cols-height)] border-t border-x border-transparent cursor-default;

    #{$clickable} & {
      @apply cursor-pointer;
    }
  }

  &__col-line {
    @apply w-full bg-neutral-200 rounded-sm transition-all border-t border-x border-transparent;

    #{$hoverable} & {
      @apply bg-primary-200 border-primary-300;
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
