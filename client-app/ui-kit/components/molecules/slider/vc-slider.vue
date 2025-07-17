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

watch([value, min, max], ([valueProp, minProp, maxProp]) => {
  start.value = Math.max(minProp, valueProp[0]);
  end.value = typeof valueProp[1] === "number" ? Math.min(maxProp, valueProp[1]) : undefined;
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

function handleInputBlur() {
  const innerRange = (typeof end.value === "number" ? [start.value, end.value] : [start.value]) satisfies RangeType;
  if (!isEqual(innerRange, props.value)) {
    emit("change", innerRange);
  }
}

onMounted(() => {
  if (!sliderRef.value) {
    return;
  }

  slider = create(sliderRef.value, {
    start:
      typeof props.value[1] === "number"
        ? [Math.min(props.value[0], props.min), Math.min(props.value[1], props.max)]
        : [Math.min(props.value[0], props.min)],
    connect: true,
    step: step.value,
    range: { min: min.value, max: max.value },
  });

  slider.on("update", (v: (string | number)[]) => {
    start.value = +v[0];
    end.value = +v[1];
  });

  // Listen for when user stops dragging the slider
  slider.on("change", (v: (string | number)[]) => {
    const range: RangeType = [+v[0], +v[1]];
    start.value = range[0];
    end.value = range[1];
    emit("change", range);
  });
});

function onColumnClick(col: { value: [number, number] }): void {
  if (!props.updateOnColumnClick) {
    return;
  }
  start.value = col.value[0];
  end.value = col.value[1];

  emit("change", [start.value, end.value]);
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
    @apply flex items-center gap-4 mt-5;
  }

  &__input {
    @apply grow;
  }

  &__dash {
    @apply text-xl;
  }
}
</style>
