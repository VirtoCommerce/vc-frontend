<template>
  <component
    :is="tag"
    :class="[
      'vc-typography',
      `vc-typography--variant--${_variant}`,
      {
        'vc-typography--truncate': truncate,
      },
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  tag?: string;
  variant?: VcTypographyVariantType;
  truncate?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  tag: "p",
  align: "left",
});

const isHeader = computed(() => /^(h[1-6])$/.test(props.tag));

const _variant = computed(() => {
  if (props.variant) {
    return props.variant;
  }

  if (isHeader.value) {
    return props.tag;
  }

  return "base";
});
</script>

<style lang="scss">
.vc-typography {
  $self: &;

  @apply empty:hidden;

  &--variant {
    @at-root h1:not(#{$self}),
      &--h1 {
      @apply text-2xl tracking-wide font-bold uppercase;

      @media (min-width: theme("screens.lg")) {
        @apply text-3xl;
      }
    }

    @at-root h2:not(#{$self}),
      &--h2 {
      @apply text-xl tracking-wide font-bold uppercase;

      @media (min-width: theme("screens.lg")) {
        @apply text-2xl;
      }
    }

    @at-root h3:not(#{$self}),
      &--h3 {
      @apply text-lg tracking-wide font-bold uppercase;

      @media (min-width: theme("screens.lg")) {
        @apply text-xl;
      }
    }

    @at-root h4:not(#{$self}),
      &--h4 {
      @apply text-base font-bold uppercase;

      @media (min-width: theme("screens.lg")) {
        @apply text-lg;
      }
    }

    @at-root h5:not(#{$self}),
      &--h5 {
      @apply text-base font-bold uppercase;
    }

    @at-root h6:not(#{$self}),
      &--h6 {
      @apply text-base font-bold uppercase;
    }

    &--base {
      @apply text-base;
    }
  }

  &--truncate {
    @apply truncate;
  }
}
</style>
