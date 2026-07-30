<template>
  <div class="layout-skeleton">
    <div class="layout-skeleton__stats">
      <!-- The card's own classes throughout, so no metric of it is restated here. -->
      <div v-for="card in statCount" :key="card" class="stat-widget stat-widget--neutral layout-skeleton__card">
        <div class="stat-widget__label layout-skeleton__bar layout-skeleton__bar--label" />

        <div class="stat-widget__value layout-skeleton__bar layout-skeleton__bar--value" />

        <div class="stat-widget__sub layout-skeleton__bar layout-skeleton__bar--sub" />

        <div class="stat-widget__delta layout-skeleton__bar layout-skeleton__bar--delta" />
      </div>
    </div>

    <div class="layout-skeleton__row">
      <!-- Empty divs are the kit's contract for a placeholder line. An empty column is skipped, as in
           layout-surface, and `md` is the size every registered widget renders at. -->
      <div v-for="column in columns" :key="column.name" :class="`layout-skeleton__${column.name}`">
        <VcWidgetSkeleton v-for="id in column.blocks" :key="id" head size="md">
          <div v-for="row in BLOCK_ROWS" :key="row"></div>
        </VcWidgetSkeleton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getBlockRegistry } from "../layout/registry";
import type { SalesRepLayoutRegionIdType, SalesRepLayoutScopeType } from "../types/layout";

interface IProps {
  scope: SalesRepLayoutScopeType;
}

const props = defineProps<IProps>();

// One count for all: the real widget renders as many rows as the customer has orders.
const BLOCK_ROWS = 5;

// From the registry: the saved arrangement is exactly what is not known yet.
const blocksIn = (region: SalesRepLayoutRegionIdType) =>
  getBlockRegistry(props.scope)
    .filter((block) => block.region === region && !block.defaultHidden)
    .map((block) => block.id);

const statCount = computed(() => blocksIn("statistics").length);

const columns = computed(() =>
  [
    { name: "main", blocks: blocksIn("mainLeft") },
    { name: "aside", blocks: blocksIn("mainRight") },
  ].filter((column) => column.blocks.length > 0),
);
</script>

<style lang="scss">
// Stands in until the saved document arrives — registry defaults would show a layout that is not the
// rep's, then shuffle it.
.layout-skeleton {
  @apply flex flex-col gap-5;

  &__stats {
    @apply flex flex-wrap gap-4;
  }

  &__row {
    @apply flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  &__main {
    @apply flex min-w-0 flex-1 flex-col gap-5;
  }

  &__aside {
    @apply flex min-w-0 flex-col gap-5 xl:w-80 xl:shrink-0;
  }

  // Wraps like layout-region--horizontal; pulses like the kit's skeleton beside it.
  &__card {
    @apply min-w-0 grow animate-pulse basis-44;
  }

  // `1lh` is the line box of whichever stat-card class the bar wears, so only the widths are ours.
  &__bar {
    @apply min-h-[1lh] rounded bg-neutral-100;

    &--label {
      @apply w-2/3;
    }

    &--value {
      @apply w-1/2;
    }

    &--sub {
      @apply w-3/4;
    }

    &--delta {
      @apply w-1/2;
    }
  }
}
</style>
