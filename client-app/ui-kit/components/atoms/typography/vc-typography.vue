<template>
  <component
    :is="tag"
    :class="[
      'vc-typography',
      `vc-typography--variant--${_variant}`,
      `vc-typography--weight--${_weight}`,
      `vc-typography--case--${_textTransform}`,
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
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "base";
  weight?: "thin" | "light" | "normal" | "bold" | "black";
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
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

const _weight = computed(() => {
  if (props.weight) {
    return props.weight;
  }

  if (isHeader.value) {
    return "bold";
  }

  return "normal";
});

const _textTransform = computed(() => {
  if (props.textTransform) {
    return props.textTransform;
  }

  if (isHeader.value) {
    return "uppercase";
  }

  return "none";
});
</script>

<style lang="scss">
.vc-typography {
  @apply empty:hidden;

  &--variant {
    &--h1 {
      @apply text-2xl tracking-wide;

      @media (min-width: theme("screens.lg")) {
        @apply text-3xl;
      }
    }

    &--h2 {
      @apply text-xl tracking-wide;

      @media (min-width: theme("screens.lg")) {
        @apply text-2xl;
      }
    }

    &--h3 {
      @apply text-lg tracking-wide;

      @media (min-width: theme("screens.lg")) {
        @apply text-xl;
      }
    }

    &--h4 {
      @apply text-base;

      @media (min-width: theme("screens.lg")) {
        @apply text-lg;
      }
    }

    &--h5 {
      @apply text-base;
    }

    &--h6 {
      @apply text-base;
    }

    &--base {
      @apply text-base;
    }
  }

  &--weight {
    &--thin {
      @apply font-thin;
    }

    &--light {
      @apply font-light;
    }

    &--normal {
      @apply font-normal;
    }

    &--bold {
      @apply font-bold;
    }

    &--black {
      @apply font-black;
    }
  }

  &--case {
    &--uppercase {
      @apply uppercase;
    }

    &--lowercase {
      @apply lowercase;
    }

    &--capitalize {
      @apply capitalize;
    }

    &--none {
      @apply normal-case;
    }
  }

  &--truncate {
    @apply truncate;
  }
}
</style>
