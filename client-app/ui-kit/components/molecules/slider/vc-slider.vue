<template>
  <div class="vc-slider">
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

    <div ref="sliderRef" class="vc-slider__slider"></div>

    <div class="vc-slider__inputs">
      <VcInput
        v-model="start"
        size="sm"
        class="vc-slider__input"
        :disabled="disabled"
        type="number"
        @focus="handleStartInputFocus"
        @blur="handleInputBlur"
      />

      <template v-if="!isNaN(end)">
        <b class="vc-slider__dash">&mdash;</b>

        <VcInput
          v-model="end"
          size="sm"
          class="vc-slider__input"
          :disabled="disabled"
          type="number"
          @focus="handleEndInputFocus"
          @blur="handleInputBlur"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNaN } from "lodash";
import isEqual from "lodash/isEqual";
import { create } from "nouislider";
import { ref, onMounted, computed, toRefs, watch } from "vue";
import type { API } from "nouislider";
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

const start = ref<number>(0);
const end = ref<number>();
const isAnyInputFocused = ref<boolean>(false);

watch([value, min, max], ([newValue, newMin, newMax]) => {

  if (slider) {
    // Update the slider range
    slider.updateOptions({
      range: { min: newMin, max: newMax },
      start: getSliderStart(),
    }, false);
  }

  start.value = newValue[0];
  end.value = typeof newValue[1] === "number" ? newValue[1] : undefined;
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

function applyInputConstraints() {
  let newStart = start.value;
  let newEnd = end.value;

  if (typeof newEnd === "number") {
    [newStart, newEnd] = enforceMinimumDistance(newStart, newEnd);
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
    start: getSliderStart(),
    connect: true,
    step: step.value,
    range: { min: min.value, max: max.value },
  });

  slider.on("update", (v: (string | number)[]) => {
    const [newStart, newEnd] = enforceMinimumDistance(+v[0], +v[1], start.value);
    start.value = newStart;
    end.value = newEnd;
  });

  // Listen for when user stops dragging the slider
  slider.on("change", (v: (string | number)[]) => {
    const [newStart, newEnd] = enforceMinimumDistance(+v[0], +v[1], start.value);
    const range: RangeType = [newStart, newEnd];
    start.value = range[0];
    end.value = range[1];

    // Only emit if values actually changed
    if (!isEqual(range, props.value)) {
      emit("change", range);
    }
  });
});

function onColumnClick(col: { value: [number, number] }): void {
  if (!props.updateOnColumnClick) {
    return;
  }

  const [newStart, newEnd] = enforceMinimumDistance(col.value[0], col.value[1]);

  start.value = newStart;
  end.value = newEnd;

  emit("change", [newStart, newEnd]);
}

function enforceMinimumDistance(startValue: number, endValue: number, previousStart?: number): [number, number] {
  // Ensure minimum distance between handles equal to step
  if (Math.abs(endValue - startValue) < step.value) {
    // If handles are too close, adjust based on which handle was moved last
    if (previousStart !== undefined && startValue === previousStart) {
      // End handle was moved, adjust start
      startValue = endValue - step.value;
      if (startValue < min.value) {
        startValue = min.value;
        endValue = startValue + step.value;
      }
    } else {
      // Start handle was moved, adjust end
      endValue = startValue + step.value;
      if (endValue > max.value) {
        endValue = max.value;
        startValue = endValue - step.value;
      }
    }
  }

  return [startValue, endValue];
}

function getSliderStart(){
  return typeof props.value[1] === "number"
    ? [props.min, props.max]
    : [props.min]
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
