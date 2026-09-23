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
import { getColorValue } from "../../../utilities";

interface IProps {
  tag?: string;
  variant?: VcTypographyVariantType;
  truncate?: boolean;
  fontSize?: string;
  fontWeight?: string;
  textTransform?: string;
  color?: string;
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

const _color = computed(() => getColorValue(props.color));
</script>

<style lang="scss">
.vc-typography {
  --props-font-size: v-bind(props.fontSize);
  --props-font-weight: v-bind(props.fontWeight);
  --props-text-transform: v-bind(props.textTransform);
  --props-color: v-bind(_color);

  --font-size: var(--props-font-size, var(--vc-typography-font-size));
  --font-weight: var(--props-font-weight, var(--vc-typography-font-weight));
  --text-transform: var(--props-text-transform, var(--vc-typography-text-transform));
  --color: var(--props-color, var(--vc-typography-color, theme("colors.neutral.950")));

  @apply empty:hidden;

  &--variant {
    &--h1,
    &--h2,
    &--h3,
    &--h4,
    &--h5,
    &--h6 {
      @apply font-geologica;

      text-transform: var(--text-transform, none);
    }

    &--h1 {
      font-size: var(--font-size, 32px);
      font-weight: var(--font-weight, 700);
      line-height: var(--line-height, 36px);
      letter-spacing: -0.03em;

      @media (width < theme("screens.lg")) {
        font-size: var(--font-size, 30px);
        line-height: var(--line-height, 34px);
      }

      @media (width >= theme("screens.2xl")) {
        font-size: var(--font-size, 36px);
        line-height: var(--line-height, 40px);
      }
    }

    &--h2 {
      font-size: var(--font-size, 26px);
      font-weight: var(--font-weight, 700);
      line-height: var(--line-height, 32px);
      letter-spacing: -0.025em;

      @media (width < theme("screens.lg")) {
        font-size: var(--font-size, 24px);
        line-height: var(--line-height, 30px);
      }

      @media (width >= theme("screens.2xl")) {
        font-size: var(--font-size, 28px);
        line-height: var(--line-height, 34px);
      }
    }

    &--h3 {
      font-size: var(--font-size, 20px);
      font-weight: var(--font-weight, 700);
      line-height: var(--line-height, 28px);
      letter-spacing: -0.02em;

      @media (width < theme("screens.lg")) {
        line-height: var(--line-height, 26px);
      }

      @media (width >= theme("screens.2xl")) {
        font-size: var(--font-size, 22px);
        line-height: var(--line-height, 30px);
      }
    }

    &--h4 {
      font-size: var(--font-size, 18px);
      font-weight: var(--font-weight, 600);
      line-height: var(--line-height, 24px);
      letter-spacing: -0.015em;

      @media (width >= theme("screens.2xl")) {
        font-size: var(--font-size, 20px);
        line-height: var(--line-height, 26px);
      }
    }

    &--h5 {
      font-size: var(--font-size, 16px);
      font-weight: var(--font-weight, 700);
      line-height: var(--line-height, 22px);
      letter-spacing: -0.01em;

      @media (width >= theme("screens.2xl")) {
        font-size: var(--font-size, 17px);
        line-height: var(--line-height, 23px);
      }
    }

    &--h6 {
      font-size: var(--font-size, 14px);
      font-weight: var(--font-weight, 700);
      line-height: var(--line-height, 20px);
      letter-spacing: -0.006em;

      @media (width >= theme("screens.2xl")) {
        font-size: var(--font-size, 15px);
        line-height: var(--line-height, 21px);
      }
    }

    &--base {
      font-size: var(--font-size, 16px);
      font-weight: var(--font-weight, 400);
      line-height: var(--line-height, 1.5);
      text-transform: var(--text-transform, none);

      @media (width >= theme("screens.2xl")) {
        font-size: var(--font-size, 17px);
        line-height: var(--line-height, 26px);
      }
    }
  }

  &--truncate {
    @apply truncate;
  }
}
</style>
