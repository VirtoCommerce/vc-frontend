<template>
  <div
    :class="[
      'vc-products-grid',
      {
        'vc-products-grid--short': short,
      },
    ]"
  >
    <div class="vc-products-grid__wrapper">
      <template v-for="(child, index) in visibleChildren" :key="index">
        <component :is="child" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed, useSlots } from "vue";
import { BREAKPOINTS } from "@/core/constants";
import type { BreakpointsType } from "@/core/constants";
import type { VNode } from "vue";

interface IProps {
  short?: boolean;
  columns?: Partial<Record<"default" | BreakpointsType, number>>;
}

const props = defineProps<IProps>();

const breakpoints = useBreakpoints(BREAKPOINTS);
const slots = useSlots();

const cols = computed(() => ({
  default: props.columns?.default ?? 2,
  xs: props.columns?.xs ?? 3,
  sm: props.columns?.sm ?? 4,
  md: props.columns?.md ?? 4,
  lg: props.columns?.lg ?? 5,
  xl: props.columns?.xl ?? 6,
  "2xl": props.columns?.["2xl"] ?? 6,
}));

const currentBreakpoint = computed(() => breakpoints.active().value ?? "default");

const visibleChildren = computed(() => {
  const bp = currentBreakpoint.value as "default" | BreakpointsType;

  const colCount = cols.value[bp];
  const count = colCount === 2 || colCount == null ? 4 : colCount;

  const slotRaw = slots.default?.() ?? [];
  const rawChildren = slotRaw[0]?.type === Symbol.for("v-fgt") ? (slotRaw[0].children ?? []) : slotRaw;

  return props.short ? (rawChildren as VNode[]).slice(0, count) : rawChildren;
});
</script>

<style lang="scss">
@reference "tailwindcss";

.vc-products-grid {
  $short: "";

  @apply @container;

  &--short {
    $short: &;
  }

  &__wrapper {
    --cols: v-bind(cols.default);

    @apply grid gap-6 grid-cols-[repeat(var(--cols),minmax(0,1fr))];

    @media (min-width: theme("screens.xs")) {
      --cols: v-bind(cols.xs);
    }

    @media (min-width: theme("screens.sm")) {
      --cols: v-bind(cols.sm);
    }

    @media (min-width: theme("screens.md")) {
      --cols: v-bind(cols.md);
    }

    @media (min-width: theme("screens.lg")) {
      --cols: v-bind(cols.lg);
    }

    @media (min-width: theme("screens.xl")) {
      --cols: v-bind(cols.xl);
    }

    @media (min-width: theme("screens.2xl")) {
      --cols: v-bind(cols[ "2xl"]);
    }
  }
}
</style>
