<template>
  <component
    :is="tagName"
    :class="[
      `typography`,
      !!fontSize ? `typography--size-${fontSize}` : '',
      !!fontWeight ? `typography--weight-${fontWeight}` : '',
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  tagName: {
    type: String,
    default: "p",
    validator(value: string) {
      return ["h1", "h2", "h3", "h4", "h5", "h6", "div", "p"].includes(value);
    },
  },

  fontSize: {
    type: String,
    default: null,
    validator(value: string) {
      return ["h1", "h2", "h3", "h4", "h5", "h6", "large", "base", "medium", "small"].includes(value);
    },
  },

  fontWeight: {
    type: String,
    default: null,
    validator(value: string) {
      return ["normal", "semibold", "bold", "extrabold"].includes(value);
    },
  },
});
</script>

<style lang="scss">
.typography {
  @apply font-lato text-base;
  color: var(--color-typography-text, --color-body-text);

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
