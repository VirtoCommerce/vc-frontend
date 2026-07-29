<template>
  <div class="layout-skeleton">
    <div class="layout-skeleton__stats">
      <div v-for="card in stats" :key="card" class="layout-skeleton__card">
        <span class="layout-skeleton__bar layout-skeleton__bar--label" />

        <span class="layout-skeleton__bar layout-skeleton__bar--value" />

        <span class="layout-skeleton__bar layout-skeleton__bar--sub" />

        <span class="layout-skeleton__bar layout-skeleton__bar--delta" />
      </div>
    </div>

    <div class="layout-skeleton__layout">
      <div v-for="column in columns" :key="column.name" :class="`layout-skeleton__${column.name}`">
        <div v-for="block in column.blocks" :key="block" class="layout-skeleton__block">
          <div class="layout-skeleton__head">
            <span class="layout-skeleton__bar layout-skeleton__bar--title" />
          </div>

          <div class="layout-skeleton__body">
            <span v-for="row in column.rows" :key="row" class="layout-skeleton__bar layout-skeleton__bar--row" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ORDERS_DEFAULT_LIMIT } from "../constants";
import { getBlockRegistry } from "../layout/registry";
import type { SalesRepLayoutRegionIdType, SalesRepLayoutScopeType } from "../types/layout";

interface IProps {
  scope: SalesRepLayoutScopeType;
}

const props = defineProps<IProps>();

// Counted from the registry, not passed in: the saved arrangement is exactly what is not known yet, so
// registry defaults are the closest guess available — and a surface that registers a rail widget later
// gets the matching skeleton with no edit here.
const registry = computed(() => getBlockRegistry(props.scope));

const visibleIn = (region: SalesRepLayoutRegionIdType) =>
  registry.value.filter((block) => block.region === region && !block.defaultHidden).length;

// Rows stand in for the tallest thing each column holds: the orders table at its page size, and the
// rail's short info lists.
const columns = computed(() =>
  [
    { name: "main", blocks: visibleIn("mainLeft"), rows: ORDERS_DEFAULT_LIMIT },
    { name: "aside", blocks: visibleIn("mainRight"), rows: 3 },
  ].filter((column) => column.blocks > 0),
);

const stats = computed(() => visibleIn("statistics"));
</script>

<style lang="scss">
// Stands in for the whole layout until the saved document arrives — rendering registry defaults first
// and re-ordering on response would show the rep a layout that is not theirs, then shuffle it.
//
// Every box mirrors the real one it replaces (`.stat-widget`, `.vc-widget` at size md, the customer
// profile's column split), so height comes from the same padding and type scale rather than a number
// that drifts as those change.
.layout-skeleton {
  @apply flex flex-col gap-5;

  &__stats {
    @apply flex flex-wrap gap-4;
  }

  &__layout {
    @apply flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  &__main {
    @apply flex min-w-0 flex-1 flex-col gap-5;
  }

  &__aside {
    @apply flex min-w-0 flex-col gap-5 xl:w-80 xl:shrink-0;
  }

  // `.stat-widget`, accent edge included — neutral here, since the accent belongs to real data.
  &__card {
    @apply flex min-w-0 basis-full flex-col gap-1.5 rounded-[--vc-radius] border border-neutral-200 bg-additional-50 p-4 shadow-sm;

    border-inline-start: 4px solid theme("colors.neutral.200");

    @media (min-width: theme("screens.sm")) {
      @apply basis-[calc(50%-0.5rem)];
    }

    @media (min-width: theme("screens.xl")) {
      @apply basis-0 grow;
    }
  }

  &__block {
    @apply flex flex-col rounded-[--vc-radius] border border-neutral-200 bg-additional-50 shadow-sm;
  }

  // VcWidget's `--header-min-h` and `--p-x` at size md, which every registered widget renders at.
  &__head {
    @apply flex items-center px-4 sm:px-6;

    height: 3.125rem;
  }

  &__body {
    @apply flex flex-col gap-6 border-t border-neutral-200 p-4 sm:px-6;
  }

  &__bar {
    @apply block rounded bg-neutral-100;

    // Each bar is the line box of the text it stands in for.
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

    &--title {
      @apply h-4 w-40;
    }

    &--row {
      @apply h-4 w-full;
    }
  }
}
</style>
