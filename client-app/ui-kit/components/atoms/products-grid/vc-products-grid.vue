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
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  short?: boolean;
  columns?: Partial<Record<"default" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl", number>>;
}

const props = defineProps<IProps>();

const cols = computed(() => ({
  default: props.columns?.default ?? 2,
  xs: props.columns?.xs ?? 3,
  sm: props.columns?.sm ?? 4,
  md: props.columns?.md ?? 4,
  lg: props.columns?.lg ?? 5,
  xl: props.columns?.xl ?? 6,
  "2xl": props.columns?.["2xl"] ?? 6,
}));
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

    @apply grid gap-x-6 grid-cols-[repeat(var(--cols),minmax(0,1fr))];

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

    #{$short} & {
      overflow-y: hidden;
      grid-template-rows: auto;
      grid-auto-rows: 0;
      grid-auto-flow: row;
    }
  }
}
</style>
