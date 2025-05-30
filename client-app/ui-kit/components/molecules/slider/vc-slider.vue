<template>
  <div class="vc-slider">
    <div v-if="cols.length > 1" class="vc-slider__cols" :style="colsHeight && { height: colsHeight }">
      <VcTooltip
        v-for="(h, i) in normalizedCols"
        :key="i"
        :class="[
          'vc-slider__col',
          {
            'vc-slider__col--hoverable': updateOnColumnClick || (showTooltipOnColHover && cols[i].tooltip),
          },
        ]"
        width="10rem"
        z-index="20"
        placement="top"
        :disabled="!showTooltipOnColHover || !cols[i].tooltip"
      >
        <template #trigger>
          <button
            type="button"
            class="vc-slider__button"
            :style="proportionalByPrice ? { flex: '0 0 ' + colWidths[i] + '%' } : {}"
            @click="updateOnColumnClick && updateModel(cols[i].value)"
          >
            <span class="vc-slider__col-line" :style="{ height: h + '%' }"></span>
          </button>
        </template>

        <template #content>{{ cols[i].tooltip }}</template>
      </VcTooltip>
    </div>

    <div ref="sliderRef" class="vc-slider__slider" />
  </div>
</template>

<script setup lang="ts">
import { create } from "nouislider";
import { ref, onMounted, watch, computed, toRefs } from "vue";
import type { API } from "nouislider";
import "nouislider/dist/nouislider.css";

type RangeType = [number | null, number | null];
type ColType = { count: number; value: RangeType; tooltip?: string };

interface IProps {
  value: RangeType;
  min?: number;
  max?: number | null;
  step?: number;
  cols?: ColType[];
  colsHeight?: string;
  updateOnColumnClick?: boolean;
  showTooltipOnColHover?: boolean;
  proportionalByPrice?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  step: 1,
  min: 0,
  cols: () => [],
  colsHeight: "",
  updateOnColumnClick: false,
  showTooltipOnColHover: false,
  proportionalByPrice: false,
});

const model = defineModel<IProps["value"]>("value", {
  default: () => [null, null],
});
const { min, max, step, cols, proportionalByPrice } = toRefs(props);

const sliderRef = ref<HTMLElement | null>(null);
let api: API | null = null;

const normalizedCols = computed(() => {
  const counts = cols.value.map((c) => c.count);
  const m = Math.max(...counts, 1);
  return counts.map((c) => Math.round((c / m) * 100));
});

const RESERVED_LAST_PERC = 10;

const hasOpenLast = computed(() => {
  const last = cols.value.length - 1;
  return last >= 0 && cols.value[last].value[1] === null;
});

const derivedMax = computed(() => {
  if (max.value !== null && max.value !== undefined) {
    return max.value;
  }

  if (hasOpenLast.value && proportionalByPrice.value) {
    const startLast = cols.value.at(-1)!.value[0] ?? min.value;
    const ratio = RESERVED_LAST_PERC / 100;
    return Math.ceil((startLast - ratio * min.value) / (1 - ratio) / step.value) * step.value;
  }

  const nums = [...cols.value.flatMap((c) => c.value), ...model.value].filter(
    (v): v is number => typeof v === "number",
  );
  const maxNum = nums.length ? Math.max(...nums) : min.value + step.value * 100;

  return maxNum + step.value * 10;
});

const colWidths = computed(() => {
  if (!proportionalByPrice.value) {
    return [];
  }

  const full = derivedMax.value - min.value;
  const widths = cols.value.map((c) => {
    const [from, to] = c.value;
    const start = from ?? min.value;
    const end = to ?? derivedMax.value;
    return ((end - start) / full) * 100;
  });

  const last = cols.value.length - 1;
  if (hasOpenLast.value) {
    widths[last] = RESERVED_LAST_PERC;

    const restTotal = widths.slice(0, last).reduce((a, b) => a + b, 0);
    const k = (100 - RESERVED_LAST_PERC) / restTotal;

    for (let i = 0; i < last; i++) {
      widths[i] *= k;
    }
  }

  return widths;
});

function resolveRange(r: RangeType): [number, number] {
  return [r[0] ?? min.value, r[1] ?? derivedMax.value];
}
function updateModel(r: RangeType) {
  model.value = r;
}

onMounted(() => {
  if (!sliderRef.value) {
    return;
  }

  api = create(sliderRef.value, {
    start: resolveRange(model.value),
    connect: true,
    step: step.value,
    range: { min: min.value, max: derivedMax.value },
  });

  api.on("update", (values) => updateModel([+values[0], +values[1]]));
});

watch(model, (v) => {
  if (api) {
    api.set(resolveRange(v));
  }
});

watch([min, derivedMax, step], () => {
  if (api) {
    api.updateOptions({ range: { min: min.value, max: derivedMax.value }, step: step.value }, false);
  }
});
</script>

<style lang="scss">
.vc-slider {
  $colHover: "";

  --props-cols-height: v-bind(colsHeight);
  --cols-height: var(--vc-slider-cols-height, var(--props-cols-height, 2rem));
  --handle-size: 1.125rem;

  @apply w-full;

  &__cols {
    @apply relative flex items-end;
  }

  &__col {
    @apply grow cursor-default;

    &--hoverable {
      &:hover {
        $colHover: &;
      }
    }
  }

  &__button {
    @apply flex flex-col justify-end w-full h-[var(--cols-height)] border-t border-x border-transparent cursor-default;

    #{$colHover} & {
      @apply cursor-pointer;
    }
  }

  &__col-line {
    @apply bg-neutral-200 rounded-sm transition-all border-t border-x border-transparent;

    #{$colHover} & {
      @apply bg-primary-200 border-primary-300;
    }
  }

  &__slider {
    @apply h-1 w-full border-none;

    .noUi-target {
      @apply bg-neutral-300 rounded-full border-none;
    }

    .noUi-connect {
      @apply bg-primary;
    }

    .noUi-handle {
      @apply top-[calc(var(--handle-size)/-2.5)] size-[--handle-size] rounded-full bg-additional-50 border-4 border-primary cursor-pointer;

      &::before,
      &::after {
        content: none;
      }
    }

    .noUi-touch-area {
      @apply absolute size-[300%] top-[calc(var(--handle-size)/-2)] left-[calc(var(--handle-size)/-2)] rounded-full;
    }
  }
}
</style>
