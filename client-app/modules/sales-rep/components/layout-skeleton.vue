<template>
  <div class="layout-skeleton">
    <div class="layout-skeleton__stats">
      <!-- The real card's own classes, so its box, padding and accent edge cannot drift from here. The
           KPI card has no kit skeleton, so its four lines are the only ones drawn by hand. -->
      <div v-for="card in statCount" :key="card" class="stat-widget stat-widget--neutral layout-skeleton__card">
        <span class="layout-skeleton__bar layout-skeleton__bar--label" />

        <span class="layout-skeleton__bar layout-skeleton__bar--value" />

        <span class="layout-skeleton__bar layout-skeleton__bar--sub" />

        <span class="layout-skeleton__bar layout-skeleton__bar--delta" />
      </div>
    </div>

    <div class="layout-skeleton__row">
      <!-- An empty column is skipped, matching layout-surface — on the dashboard, which registers no
           rail widget, the content runs full width both before and after the layout arrives. At md, the
           size every registered widget renders at, the kit's header comes out 3.125rem: the same as
           VcWidget's own `--header-min-h`. Empty divs are its contract for a placeholder line. -->
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

// One count for every block: matching each widget's page size was false precision, since the real
// widget renders as many rows as the customer has orders.
const BLOCK_ROWS = 5;

// From the registry, not passed in: the saved arrangement is exactly what is not known yet, so registry
// defaults are the closest guess — and a later rail widget gets its skeleton with no edit here.
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
// Stands in for the whole layout until the saved document arrives: rendering registry defaults first
// would show the rep a layout that is not theirs, then shuffle it. The boxes are the kit's own skeleton
// and the real stat card, so all that is left here is the column split and the KPI card's lines.
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

  // Mirrors layout-region--horizontal, so the row wraps at the same widths.
  &__card {
    @apply min-w-0 grow basis-44;
  }

  // Each bar is the line box of the stat-card text it stands in for.
  &__bar {
    @apply block rounded bg-neutral-100;

    &--label {
      @apply h-4 w-2/3;
    }

    &--value {
      @apply h-9 w-1/2;
    }

    &--sub {
      @apply h-4 w-3/4;
    }

    &--delta {
      @apply mt-auto h-5 w-1/2;
    }
  }
}
</style>
