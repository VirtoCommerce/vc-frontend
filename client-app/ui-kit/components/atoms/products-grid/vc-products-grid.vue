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

    <div class="vc-products-grid__show-more">
      <VcButton
        v-if="short && shortShowMoreVisible && shortRowsStep > 0"
        variant="outline"
        append-icon="arrow-down"
        @click="shortRows += shortRowsStep"
      >
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

interface IProps {
  short?: boolean;
  shortShowMoreVisible?: boolean;
  columns?: Partial<Record<"default" | BreakpointsType, number>>;
}

const props = defineProps<IProps>();

const breakpoints = useBreakpoints(BREAKPOINTS);
const slots = useSlots();

const shortRows = ref(1);

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
  const itemsCount = (colCount.value === 2 || colCount.value == null ? 4 : colCount.value) * (shortRows.value ?? 1);
  return props.short ? (rawChildren.value as VNode[]).slice(0, itemsCount) : rawChildren.value;
});

const colCount = computed(() => {
  const bp = currentBreakpoint.value as "default" | BreakpointsType;
  return cols.value[bp];
});

const rawChildren = computed(() => {
  const slotRaw = slots.default?.() ?? [];
  return slotRaw[0]?.type === Symbol.for("v-fgt") ? (slotRaw[0].children ?? []) : slotRaw;
});

const maxShortRows = computed(() => {
  if (!rawChildren.value) {
    return 1;
  }

  return Math.ceil((rawChildren.value as VNode[]).length / colCount.value);
});

const shortRowsStep = computed(() => Math.min(2, maxShortRows.value - shortRows.value));
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
    @apply text-center;
  }
}
</style>
