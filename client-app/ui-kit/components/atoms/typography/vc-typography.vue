<template>
  <component :is="tag" :class="['vc-typography', `vc-typography--${variant}`, `vc-typography--${weight}`]">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  tag: {
    type: String,
    default: "p",
  },

  variant: {
    type: String as PropType<"h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "large" | "base" | "medium" | "small">,
    default: "base",
    validator: (value: string) =>
      ["h1", "h2", "h3", "h4", "h5", "h6", "large", "base", "medium", "small"].includes(value),
  },

  weight: {
    type: String as PropType<"normal" | "semibold" | "bold" | "extrabold">,
    default: "normal",
    validator: (value: string) => ["normal", "semibold", "bold", "extrabold"].includes(value),
  },
});
</script>

<style lang="scss">
.vc-typography {
  @apply text-inherit;

  // Variants
  &--h1 {
    @apply text-3xl uppercase tracking-wide;

    @media (min-width: theme("screens.lg")) {
      @apply text-4xl;
    }
  }

  &--h2 {
    @apply text-3xl uppercase tracking-wide;
  }

  &--h3 {
    @apply text-xl uppercase tracking-wide;
  }

  &--h4 {
  }

  &--h5 {
  }

  &--h6 {
  }

  &--large {
    @apply text-lg;

    @media (min-width: theme("screens.lg")) {
      @apply text-xl;
    }
  }

  &--base {
    @apply text-base;
  }

  &--medium {
    @apply text-sm;
  }

  &--small {
    @apply text-xs;
  }

  // Weight
  &--normal {
    @apply font-normal;
  }

  &--semibold {
    @apply font-semibold;
  }

  &--bold {
    @apply font-bold;
  }

  &--extrabold {
    @apply font-extrabold;
  }
}
</style>
