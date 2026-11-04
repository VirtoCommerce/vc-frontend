<template>
  <fieldset class="reporting-svg-chart" :aria-label="ariaLabel">
    <span v-if="yLabel" class="reporting-svg-chart__y-label">{{ yLabel }}</span>

    <div ref="plot" class="reporting-svg-chart__plot" :style="{ height: `${height}px` }">
      <VcLoaderOverlay :visible="loading" no-bg />

      <template v-if="width > 0">
        <svg
          class="reporting-svg-chart__svg"
          :width="width"
          :height="height"
          :viewBox="`0 0 ${width} ${height}`"
          aria-hidden="true"
        >
          <g class="reporting-svg-chart__grid">
            <g v-for="tick in ticks" :key="tick">
              <line :x1="marginLeft" :x2="width" :y1="toY(tick)" :y2="toY(tick)" />

              <text
                ref="tickLabels"
                class="reporting-svg-chart__tick"
                :x="marginLeft - TICK_GAP"
                :y="toY(tick)"
                text-anchor="end"
                dy="0.32em"
              >
                {{ yFormat(tick) }}
              </text>
            </g>
          </g>

          <g v-for="column in columns" :key="column.category.id">
            <rect
              v-if="column.category.placeholder"
              class="reporting-svg-chart__placeholder"
              :x="column.center - groupWidth / 2"
              :y="placeholderTop"
              :width="groupWidth"
              :height="baseline - placeholderTop"
              :rx="OUTLINE_RADIUS"
            />

            <template v-else>
              <rect
                v-for="bar in column.bars"
                :key="bar.series.id"
                :class="[
                  'reporting-svg-chart__bar',
                  {
                    'reporting-svg-chart__bar--dashed': bar.series.variant === 'dashed',
                    'reporting-svg-chart__bar--active': activeIndex === column.index,
                  },
                ]"
                :style="seriesColor(bar.series)"
                :x="bar.x"
                :y="bar.y"
                :width="barWidth"
                :height="baseline - bar.y"
                :rx="bar.series.variant === 'dashed' ? OUTLINE_RADIUS : 0"
              />
            </template>

            <text
              :class="[
                'reporting-svg-chart__label',
                { 'reporting-svg-chart__label--placeholder': column.category.placeholder },
              ]"
              :x="column.center"
              :y="height - LABEL_BOTTOM"
              text-anchor="middle"
            >
              {{ isCompact ? (column.category.shortLabel ?? column.category.label) : column.category.label }}
            </text>
          </g>

          <g v-for="line in lines" :key="line.series.id" :style="seriesColor(line.series)">
            <path class="reporting-svg-chart__line" :d="line.path" />

            <template v-if="line.series.dots">
              <circle
                v-for="point in line.points"
                :key="point.x"
                class="reporting-svg-chart__dot"
                :cx="point.x"
                :cy="point.y"
                :r="DOT_RADIUS"
              />
            </template>
          </g>
        </svg>

        <!-- Kit components and slot content cannot live inside an SVG, so they are laid over it on the same scale. -->
        <div
          v-for="column in placeholderColumns"
          :key="`placeholder-${column.category.id}`"
          :class="[
            'reporting-svg-chart__placeholder-caption',
            {
              'reporting-svg-chart__placeholder-caption--small': band < CAPTION_BAND,
              'reporting-svg-chart__placeholder-caption--upright': band < UPRIGHT_BAND,
            },
          ]"
          :style="{
            left: `${column.center - groupWidth / 2}px`,
            top: `${placeholderTop}px`,
            width: `${groupWidth}px`,
            height: `${baseline - placeholderTop}px`,
          }"
        >
          <slot name="placeholder" :category="column.category" :index="column.index" />
        </div>

        <template v-if="!isCompact">
          <div
            v-for="column in dataColumns"
            :key="`annotation-${column.category.id}`"
            class="reporting-svg-chart__annotation"
            :style="{ left: `${column.center}px`, top: `${column.top - ANNOTATION_GAP}px` }"
          >
            <slot name="annotation" :category="column.category" :index="column.index" />
          </div>
        </template>

        <!-- lazy: otherwise each closed tooltip mounts at once and floating-ui measures its column every frame. -->
        <VcTooltip
          v-for="column in dataColumns"
          :key="`hit-${column.category.id}`"
          class="reporting-svg-chart__hit"
          :style="{ left: `${column.left}px`, top: `${hitTop(column)}px`, width: `${band}px` }"
          :disabled="!$slots.tooltip"
          placement="top"
          hover
          lazy
        >
          <template #default="{ triggerProps }">
            <!-- A column only shows its figures, so it drops the button semantics the trigger props give it. -->
            <svg
              :ref="(element) => setHitElement(column.category.id, element)"
              class="reporting-svg-chart__hit-area"
              :style="{ height: `${baseline - hitTop(column)}px` }"
              v-bind="triggerProps"
              role="img"
              :aria-expanded="undefined"
              :aria-controls="undefined"
              :tabindex="column.category.id === tabStop ? 0 : -1"
              :aria-label="column.category.label"
              @mouseenter="activate(column.index)"
              @mouseleave="deactivate(column.index)"
              @focusin="onHitFocus(column)"
              @focusout="deactivate(column.index)"
              @keydown="onHitKeydown($event, column.category.id)"
            />
          </template>

          <template #content>
            <slot name="tooltip" :category="column.category" :index="column.index" :values="valuesAt(column.index)" />
          </template>
        </VcTooltip>
      </template>
    </div>

    <ul v-if="showLegend && (legendSeries.length || $slots['legend-append'])" class="reporting-svg-chart__legend">
      <li v-for="item in legendSeries" :key="item.id" class="reporting-svg-chart__legend-item">
        <span
          :class="[
            'reporting-svg-chart__swatch',
            `reporting-svg-chart__swatch--${item.type === 'line' ? 'line' : (item.variant ?? 'solid')}`,
          ]"
          :style="seriesColor(item)"
        />
        {{ item.name }}
      </li>

      <slot name="legend-append" />
    </ul>
  </fieldset>
</template>

<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { linearLinePath, niceTicks, smoothLinePath, splitAtGaps } from "./chart-geometry";
import type { ChartBarLayoutType, ChartCategoryType, ChartSeriesType, ChartTooltipValueType } from "./types";
import type { ComponentPublicInstance } from "vue";

interface IProps {
  categories: ChartCategoryType[];
  series: ChartSeriesType[];
  /** The chart's accessible name. */
  ariaLabel?: string;
  barLayout?: ChartBarLayoutType;
  /** Formats the Y axis ticks. */
  yFormat?: (value: number) => string;
  /** The Y axis title, on its own line above the plot. */
  yLabel?: string;
  /** The plot's height in px, axes included; the Y title above it and the legend below it add to it. */
  height?: number;
  /** A list of the drawn series under the plot. */
  showLegend?: boolean;
  loading?: boolean;
}

type SlotScopeType = { category: ChartCategoryType; index: number };

interface ISlots {
  /** The content of a column's tooltip, shown on hover and keyboard focus. */
  tooltip?: (scope: SlotScopeType & { values: ChartTooltipValueType[] }) => unknown;
  /** Above a column's tallest mark; left out once the columns get too narrow to hold it. */
  annotation?: (scope: SlotScopeType) => unknown;
  /** The caption inside a placeholder column. */
  placeholder?: (scope: SlotScopeType) => unknown;
  /** Extra `<li>` items after the series in the legend. */
  "legend-append"?: () => unknown;
}

const props = withDefaults(defineProps<IProps>(), {
  barLayout: "grouped",
  yFormat: String,
  height: 230,
  showLegend: true,
});

defineSlots<ISlots>();

// Room for the annotations above the plot and the category labels below. The left margin fits the Y ticks; on the
// right the plot runs to the edge.
const MARGIN = { top: 34, bottom: 30 };
const TICK_GAP = 8;
const LABEL_BOTTOM = 8;
// Columns nearly touch.
const BAR_SHARE = 0.92;
// Outlines (dashed bars, placeholders) are rounded; solid bars stay square.
const OUTLINE_RADIUS = 4;
const DOT_RADIUS = 3.5;
// A placeholder stands this share of the plot high.
const PLACEHOLDER_SHARE = 0.45;
// Below this column width the labels switch to `shortLabel` and the annotations are left out.
const COMPACT_BAND = 52;
// Below these column widths a placeholder caption gets a smaller font, then turns upright.
const CAPTION_BAND = 76;
const UPRIGHT_BAND = 40;
const ANNOTATION_GAP = 6;
// Even an empty column keeps a hover target this tall above the baseline.
const MIN_HIT_HEIGHT = 12;
const DEFAULT_COLOR = "primary-500";

const plot = useTemplateRef<HTMLElement>("plot");
const tickLabels = useTemplateRef<SVGTextElement[]>("tickLabels");
const width = ref(0);
const widestTickLabel = ref(0);

useResizeObserver(plot, (entries) => {
  width.value = Math.floor(entries[0]?.contentRect.width ?? 0);
});

const visibleSeries = computed(() => props.series.filter((series) => !series.hidden));
const barSeries = computed(() => visibleSeries.value.filter((series) => series.type === "bar"));
const lineSeries = computed(() => visibleSeries.value.filter((series) => series.type === "line"));

const marginLeft = computed(() => Math.ceil(widestTickLabel.value) + TICK_GAP);
const plotHeight = computed(() => props.height - MARGIN.top - MARGIN.bottom);
const baseline = computed(() => MARGIN.top + plotHeight.value);
const band = computed(() => Math.max(0, width.value - marginLeft.value) / Math.max(props.categories.length, 1));
const groupWidth = computed(() => band.value * BAR_SHARE);
const barWidth = computed(() =>
  props.barLayout === "overlap" ? groupWidth.value : groupWidth.value / Math.max(barSeries.value.length, 1),
);
const isCompact = computed(() => band.value < COMPACT_BAND);
const placeholderTop = computed(() => baseline.value - plotHeight.value * PLACEHOLDER_SHARE);

function valueAt(series: ChartSeriesType, index: number): number | null {
  return props.categories[index]?.placeholder ? null : (series.data[index] ?? null);
}

function valuesAt(index: number): ChartTooltipValueType[] {
  return visibleSeries.value.map((series) => ({ series, value: valueAt(series, index) }));
}

const ticks = computed(() =>
  niceTicks(
    Math.max(0, ...visibleSeries.value.flatMap((series) => props.categories.map((_, i) => valueAt(series, i) ?? 0))),
  ),
);

// Measured once drawn: a tick label's length depends on the locale and the currency ("$12.5K", "12,5 tys. USD").
function measureTickLabels(): void {
  widestTickLabel.value = Math.max(0, ...(tickLabels.value ?? []).map((label) => label.getBoundingClientRect().width));
}

watch([() => ticks.value.map((tick) => props.yFormat(tick)), () => width.value > 0], measureTickLabels, {
  flush: "post",
});

function toY(value: number): number {
  const max = ticks.value.at(-1) ?? 1;
  return baseline.value - (value / max) * plotHeight.value;
}

function centerOf(index: number): number {
  return marginLeft.value + index * band.value + band.value / 2;
}

function seriesColor(series: ChartSeriesType): Record<string, string> {
  return { "--series-color": `var(--color-${series.color ?? DEFAULT_COLOR})` };
}

const columns = computed(() =>
  props.categories.map((category, index) => {
    const center = centerOf(index);
    const values = visibleSeries.value.map((series) => valueAt(series, index) ?? 0);
    const bars = barSeries.value.flatMap((series, position) => {
      const value = valueAt(series, index);
      if (value === null) {
        return [];
      }
      const offset = props.barLayout === "overlap" ? 0 : position * barWidth.value;
      return [{ series, x: center - groupWidth.value / 2 + offset, y: toY(value) }];
    });
    // Outlines first, so a solid bar that shares the column is drawn over its outline.
    bars.sort((a, b) => Number(a.series.variant !== "dashed") - Number(b.series.variant !== "dashed"));

    return { category, index, center, left: center - band.value / 2, top: toY(Math.max(0, ...values)), bars };
  }),
);

type ColumnType = (typeof columns.value)[number];

const placeholderColumns = computed(() => columns.value.filter((column) => column.category.placeholder));
const dataColumns = computed(() => columns.value.filter((column) => !column.category.placeholder));

const lines = computed(() =>
  lineSeries.value.map((series) => {
    const linePath = series.curve === "monotone" ? smoothLinePath : linearLinePath;
    const runs = splitAtGaps(
      props.categories.map((_, index) => {
        const value = valueAt(series, index);
        return value === null ? null : { x: centerOf(index), y: toY(value) };
      }),
    );
    return { series, points: runs.flat(), path: runs.map(linePath).join(" ") };
  }),
);

const legendSeries = computed(() =>
  visibleSeries.value.filter((series) => props.categories.some((_, index) => valueAt(series, index) !== null)),
);

// Each target starts at its column's tallest mark, so the tooltip (placed above it) sits on the column.
function hitTop(column: ColumnType): number {
  return Math.min(baseline.value - MIN_HIT_HEIGHT, column.top);
}

const activeIndex = ref<number | null>(null);

function activate(index: number): void {
  activeIndex.value = index;
}

function deactivate(index: number): void {
  if (activeIndex.value === index) {
    activeIndex.value = null;
  }
}

// One tab stop for the whole chart (the last focused column); the arrow keys move between columns. Columns are
// tracked by category id: when the period changes, a month keeps its id while its index shifts.
const focusedId = ref<string>();
const dataIds = computed(() => dataColumns.value.map((column) => column.category.id));
const tabStop = computed(() =>
  focusedId.value !== undefined && dataIds.value.includes(focusedId.value) ? focusedId.value : dataIds.value[0],
);

const hitElements = new Map<string, SVGSVGElement>();

function setHitElement(id: string, element: Element | ComponentPublicInstance | null): void {
  if (element instanceof SVGSVGElement) {
    hitElements.set(id, element);
  } else {
    hitElements.delete(id);
  }
}

function onHitFocus(column: ColumnType): void {
  focusedId.value = column.category.id;
  activate(column.index);
}

function onHitKeydown(event: KeyboardEvent, id: string): void {
  const ids = dataIds.value;
  const position = ids.indexOf(id);
  const targets: Record<string, string | undefined> = {
    ArrowLeft: ids[position - 1],
    ArrowRight: ids[position + 1],
    Home: ids[0],
    End: ids.at(-1),
  };
  if (!(event.key in targets)) {
    return;
  }
  event.preventDefault();
  const target = targets[event.key];
  if (target !== undefined) {
    hitElements.get(target)?.focus();
  }
}

onMounted(measureTickLabels);
</script>

<style lang="scss">
.reporting-svg-chart {
  --grid-color: var(--reporting-svg-chart-grid-color, var(--color-neutral-200));
  --tick-color: var(--reporting-svg-chart-tick-color, var(--color-neutral-600));
  --label-color: var(--reporting-svg-chart-label-color, var(--color-neutral-800));
  --placeholder-color: var(--reporting-svg-chart-placeholder-color, var(--color-neutral-300));
  --placeholder-text-color: var(--reporting-svg-chart-placeholder-text-color, var(--color-neutral-600));
  --placeholder-label-color: var(--reporting-svg-chart-placeholder-label-color, var(--color-neutral-600));
  --legend-color: var(--reporting-svg-chart-legend-color, var(--color-neutral-700));
  --active-shade: var(--reporting-svg-chart-active-shade, 10%);

  // min-w-0: preflight misses the fieldset's min-inline-size: min-content, which would stop the plot shrinking.
  @apply flex min-w-0 flex-col gap-3;

  &__plot {
    // Keeps the loader overlay's z-index inside the plot, under any popup that opens over the chart.
    @apply relative isolate w-full;
  }

  &__svg {
    @apply block overflow-visible;
  }

  &__grid line {
    stroke: var(--grid-color);
  }

  &__tick {
    @apply text-xs;

    fill: var(--tick-color);
  }

  &__y-label {
    @apply text-xs font-bold;

    color: var(--label-color);
  }

  // One fill, read once: the series picks the colour, an active column only mixes in the contrast colour (darker on
  // a light theme, lighter on a dark one).
  &__bar {
    --shade: 0%;

    fill: color-mix(in srgb, var(--color-additional-950) var(--shade), var(--series-color));

    &--active {
      --shade: var(--active-shade);
    }

    &--dashed {
      fill: transparent;
      stroke: var(--series-color);
      stroke-width: 1.5;
      stroke-dasharray: 3 2;
    }
  }

  &__placeholder {
    fill: transparent;
    stroke: var(--placeholder-color);
    stroke-dasharray: 4 3;
  }

  &__placeholder-caption {
    @apply pointer-events-none absolute flex items-center justify-center text-center text-xs;

    color: var(--placeholder-text-color);

    &--small {
      @apply text-xxs;
    }

    &--upright {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
  }

  &__label {
    @apply text-xs font-bold;

    fill: var(--label-color);

    &--placeholder {
      fill: var(--placeholder-label-color);
    }
  }

  &__line {
    fill: none;
    stroke: var(--series-color);
    stroke-width: 2;
  }

  &__dot {
    fill: var(--series-color);
    stroke: var(--color-additional-50);
    stroke-width: 1.5;
  }

  &__annotation {
    @apply pointer-events-none absolute -translate-x-1/2 -translate-y-full;
  }

  &__hit {
    @apply absolute;
  }

  &__hit-area {
    @apply block w-full cursor-default;
  }

  &__legend {
    @apply flex flex-wrap items-center gap-x-4 gap-y-2 text-xs;

    color: var(--legend-color);
  }

  &__legend-item {
    @apply flex items-center gap-2;
  }

  &__swatch {
    @apply inline-block;

    &--solid {
      @apply size-3.5;

      background: var(--series-color);
    }

    &--dashed {
      @apply size-3.5 border border-dashed;

      border-color: var(--series-color);
    }

    &--line {
      @apply h-0.5 w-5;

      background: var(--series-color);
    }
  }
}
</style>
