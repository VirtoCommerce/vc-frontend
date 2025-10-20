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

    <div v-if="short && shortShowMoreVisible && maxShowingRows > showingRows" class="vc-products-grid__show-more">
      <VcButton variant="no-border" append-icon="chevron-down" @click="showMoreRows()">
        {{ $t("common.buttons.show_more") }}
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed, useSlots, ref } from "vue";
import { BREAKPOINTS } from "@/core/constants";
import type { BreakpointsType } from "@/core/constants";
import type { VNode } from "vue";

const props = defineProps<IProps>();

interface IProps {
  short?: boolean;
  shortShowMoreVisible?: boolean;
  columns?: Partial<Record<"default" | BreakpointsType, number>>;
}

const MIN_COLS_COUNT = 2;
const showingRows = ref(0);

const breakpoints = useBreakpoints(BREAKPOINTS);
const slots = useSlots();

const cols = computed(() => ({
  default: props.columns?.default ?? MIN_COLS_COUNT,
  xs: props.columns?.xs ?? 3,
  sm: props.columns?.sm ?? 4,
  md: props.columns?.md ?? 4,
  lg: props.columns?.lg ?? 5,
  xl: props.columns?.xl ?? 6,
  "2xl": props.columns?.["2xl"] ?? 6,
}));

const currentBreakpoint = computed(() => breakpoints.active().value ?? "default");

const visibleChildren = computed(() => {
  if (!props.short) {
    return rawChildren.value;
  }

  const itemsCount = colCount.value * actualShowingRows.value;

  return (rawChildren.value as VNode[]).slice(0, itemsCount);
});

const colCount = computed(() => {
  const bp = currentBreakpoint.value as "default" | BreakpointsType;
  return cols.value[bp] ?? MIN_COLS_COUNT;
});

const rawChildren = computed(() => {
  const slotRaw = slots.default?.() ?? [];
  return slotRaw[0]?.type === Symbol.for("v-fgt") ? (slotRaw[0].children ?? []) : slotRaw;
});

const minShowingRows = computed(() => (colCount.value < 4 ? 2 : 1));

const maxShowingRows = computed(() => {
  if (!rawChildren.value) {
    return minShowingRows.value;
  }

  return Math.ceil((rawChildren.value as VNode[]).length / colCount.value);
});

const actualShowingRows = computed(() => Math.max(showingRows.value, minShowingRows.value));

const showMoreRows = function () {
  showingRows.value = actualShowingRows.value + 2;
};
</script>

<style lang="scss">
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

  &__show-more {
    @apply border-t pt-5 text-center;
  }
}
</style>
