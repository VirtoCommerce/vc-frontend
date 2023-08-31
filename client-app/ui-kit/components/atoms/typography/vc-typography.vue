<template>
  <component
    :is="tag"
    :class="['vc-typography', `vc-typography--variant--${variant}`, `vc-typography--weight--${weight}`]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  tag?: string;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "large" | "base" | "medium" | "small";
  weight?: "normal" | "semibold" | "bold" | "extrabold";
}

withDefaults(defineProps<Props>(), {
  tag: "p",
  variant: "base",
  weight: "normal",
});
</script>

<style lang="scss">
.vc-typography {
  @apply text-inherit;

  &--variant {
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
  }

  &--weight {
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
}
</style>
