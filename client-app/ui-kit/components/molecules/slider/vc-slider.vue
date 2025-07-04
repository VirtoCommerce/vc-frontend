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
          <button type="button" class="vc-slider__button" @click="updateOnColumnClick && updateModel(col.value)">
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
      <VcInput v-model="start" size="sm" class="vc-slider__input" min="min" :max="max" :disabled="disabled" />

      <template v-if="!isNaN(end)">
        <b class="vc-slider__dash">&mdash;</b>

        <VcInput v-model="end" size="sm" class="vc-slider__input" min="min" :max="max" :disabled="disabled" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNaN } from "lodash";
import { create } from "nouislider";
import { ref, onMounted, computed, toRefs, watch } from "vue";
import type { API } from "nouislider";
import "nouislider/dist/nouislider.css";

type RangeType = [number, number] | [number];
type ColRangeType = [null, number] | [number, number] | [number, null];
export type ColType = { count: number; value: ColRangeType };

interface IProps {
  min?: number;
  max: number;
  step?: number;
  cols?: ColType[];
  colsHeight?: string;
  updateOnColumnClick?: boolean;
  showTooltipOnColHover?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  step: 1,
  min: 0,
  cols: () => [],
  colsHeight: "",
  updateOnColumnClick: false,
  showTooltipOnColHover: false,
});

const model = defineModel<RangeType>();
const { min, max, step, cols } = toRefs(props);
const start = ref(model.value ? model.value[0] : min.value);
const end = ref(model.value ? model.value[1] : max.value);

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
      value: [_from, _to] as RangeType,
      count: column.count,
      height: `${Math.round((column.count / maxCount) * 100)}%`,
      position: {
        left: _from ? `${((_from - min.value) / (max.value - min.value)) * 100}%` : 0,
        right: _to ? `${((max.value - _to) / (max.value - min.value)) * 100}%` : 100,
      },
    };
  });
});

function isRangesEqual(a?: RangeType, b?: RangeType) {
  if (!a || !b) {
    return false;
  }

  return a[0] === b[0] && a[1] === b[1];
}

function updateModel(range: RangeType, fromSlider = false) {
  if (isRangesEqual(model.value, range)) {
    return;
  }

  model.value = range;

  if (!fromSlider && slider) {
    slider.set(range);
  }
}

watch([start, end], ([v1, v2]) => {
  updateModel([v1, v2] as RangeType);
});

onMounted(() => {
  if (!sliderRef.value) {
    return;
  }

  slider = create(sliderRef.value, {
    start: model.value || [min.value, max.value],
    connect: true,
    step: step.value,
    range: { min: min.value, max: max.value },
  });

  slider.on("update", (v) => {
    start.value = +v[0];
    end.value = +v[1];
    updateModel([+v[0], +v[1]], true);
  });
});
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
