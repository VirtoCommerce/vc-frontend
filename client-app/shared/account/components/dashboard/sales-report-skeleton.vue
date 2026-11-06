<template>
  <!-- The report's own widget and title over the panel's rows, each bar about as wide as its label, so the
       placeholder wraps where the panel does and keeps the block's height at every width. -->
  <VcWidget :title="title" size="md" class="sales-report-skeleton" aria-busy="true">
    <div class="sales-report-skeleton__panel" aria-hidden="true">
      <div class="sales-report-skeleton__periods">
        <div
          v-for="item in PERIODS"
          :key="item.period"
          class="sales-report-skeleton__period"
          :class="{ 'sales-report-skeleton__period--quarter': item.quarter }"
        />
      </div>

      <div class="sales-report-skeleton__tiles">
        <div v-for="tile in TILES" :key="tile" class="sales-report-skeleton__tile">
          <div class="sales-report-skeleton__bar sales-report-skeleton__bar--label" />

          <div class="sales-report-skeleton__bar sales-report-skeleton__bar--value" />

          <template v-if="tile === 'month'">
            <div class="sales-report-skeleton__bar sales-report-skeleton__bar--caption" />

            <div class="sales-report-skeleton__bar sales-report-skeleton__bar--progress" />
          </template>

          <div v-else class="sales-report-skeleton__bar sales-report-skeleton__bar--badge" />
        </div>
      </div>

      <div v-for="chart in CHARTS" :key="chart.id" class="sales-report-skeleton__chart">
        <div class="sales-report-skeleton__header">
          <div class="sales-report-skeleton__heading">
            <div class="sales-report-skeleton__bar sales-report-skeleton__bar--title" />

            <div class="sales-report-skeleton__bar sales-report-skeleton__bar--subtitle" />
          </div>

          <div class="sales-report-skeleton__bar sales-report-skeleton__bar--switch" />
        </div>

        <div v-if="chart.withAxisTitle" class="sales-report-skeleton__bar sales-report-skeleton__bar--axis" />

        <div class="sales-report-skeleton__plot" />

        <div class="sales-report-skeleton__legend">
          <div
            v-for="item in chart.legendItems"
            :key="item"
            class="sales-report-skeleton__bar sales-report-skeleton__bar--legend"
          />

          <div class="sales-report-skeleton__bar sales-report-skeleton__bar--legend-badge" />
        </div>

        <div class="sales-report-skeleton__note">
          <div class="sales-report-skeleton__bar sales-report-skeleton__bar--note" />
        </div>
      </div>

      <div class="sales-report-skeleton__bar sales-report-skeleton__bar--footnote" />
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
// Not through the `@/shared/reporting` barrel: this placeholder loads with the app, the report's charts must not.
import { REPORTING_PERIODS } from "@/shared/reporting/reporting";

interface IProps {
  title?: string;
}

defineProps<IProps>();

const PERIODS = REPORTING_PERIODS.map((period) => ({ period, quarter: period.startsWith("q") }));

// The KPI tiles; the month's tile has a caption and a progress bar where the others have a badge.
const TILES = ["sales", "orders", "aov", "month"] as const;

// The sales chart, then the average order value's, which titles its Y axis.
const CHARTS = [
  { id: "sales", legendItems: 3, withAxisTitle: false },
  { id: "aov", legendItems: 2, withAxisTitle: true },
] as const;
</script>

<style lang="scss">
.sales-report-skeleton {
  &__panel {
    @apply flex flex-col gap-4;

    @media (prefers-reduced-motion: no-preference) {
      @apply animate-pulse;
    }
  }

  &__periods {
    @apply flex flex-wrap gap-1;
  }

  &__period {
    @apply h-8 w-20 rounded-full bg-neutral-100;

    &--quarter {
      @apply w-8;
    }
  }

  &__tiles {
    @apply grid grid-cols-2 gap-3;

    @media (width >= theme("screens.lg")) {
      @apply grid-cols-4;
    }
  }

  &__tile {
    @apply flex min-w-0 flex-col items-start gap-1 rounded-[--vc-radius] border border-neutral-200 p-3;
  }

  &__chart {
    @apply flex flex-col gap-3 rounded-[--vc-radius] border border-neutral-200 p-3;

    @media (width >= theme("screens.md")) {
      @apply p-4;
    }
  }

  &__header {
    @apply flex flex-wrap items-center justify-between gap-3;
  }

  &__heading {
    @apply flex flex-wrap items-center gap-x-3 gap-y-1;
  }

  // The chart's plot height (ReportingSvgChart's default, 230px).
  &__plot {
    @apply h-[14.375rem] rounded-[--vc-radius] bg-neutral-100;
  }

  &__legend {
    @apply flex flex-wrap items-center gap-x-4 gap-y-2;
  }

  &__note {
    @apply border-t border-neutral-200 pt-3;
  }

  // Each bar is as tall as the line of text it stands for: 14px for `text-xs`, 32px for the tile's figure.
  &__bar {
    @apply h-3.5 max-w-full rounded-[--vc-radius] bg-neutral-100;

    &--label {
      @apply w-28;
    }

    &--value {
      @apply h-8 w-20;
    }

    &--badge {
      @apply h-[1.125rem] w-28;
    }

    &--caption {
      @apply w-full;
    }

    &--progress {
      @apply mt-1 h-1 w-full rounded-full;
    }

    &--title {
      @apply h-5 w-44;
    }

    &--subtitle {
      @apply h-[1.125rem] w-48;
    }

    &--switch {
      @apply ms-auto h-[1.125rem] w-[5.25rem];
    }

    &--axis {
      @apply w-24;
    }

    &--legend {
      @apply w-32;
    }

    &--legend-badge {
      @apply h-[1.125rem] w-56;
    }

    &--note {
      @apply w-2/3;
    }

    &--footnote {
      @apply w-2/3;
    }
  }
}
</style>
