<template>
  <component :is="tag" :class="['typography', `typography--size-${size}`, `typography--weight-${weight}`]">
    <slot />
  </component>
</template>

<script setup lang="ts">
defineProps({
  tag: {
    type: String,
    default: "p",
  },

  size: {
    type: String,
    default: "base",
    validator(value: string) {
      return ["h1", "h2", "h3", "h4", "h5", "h6", "large", "base", "medium", "small"].includes(value);
    },
  },

  weight: {
    type: String,
    default: "normal",
    validator(value: string) {
      return ["normal", "semibold", "bold", "extrabold"].includes(value);
    },
  },
});
</script>

<style lang="scss">
.typography {
  --vc-typography-color: var(--color-typography-color, var(--color-body-text));

  @apply font-lato
  text-[color:var(--vc-typography-color)];

  &--size-h1 {
    @apply text-3xl uppercase tracking-wide;

    @media (min-width: theme("screens.lg")) {
      @apply text-4xl;
    }
  }

  &--size-h2 {
    @apply text-3xl uppercase tracking-wide;
  }

  &--size-h3 {
    @apply text-xl uppercase tracking-wide;
  }

  &--size-h4 {
  }

  &--size-h5 {
  }

  &--size-h6 {
  }

  &--size-large {
    @apply text-lg;

    @media (min-width: theme("screens.lg")) {
      @apply text-xl;
    }
  }

  &--size-base {
    @apply text-base;
  }

  &--size-medium {
    @apply text-sm;
  }

  &--size-small {
    @apply text-xs;
  }

  &--weight-normal {
    @apply font-normal;
  }

  &--weight-semibold {
    @apply font-semibold;
  }

  &--weight-bold {
    @apply font-bold;
  }

  &--weight-extrabold {
    @apply font-extrabold;
  }
}
</style>
