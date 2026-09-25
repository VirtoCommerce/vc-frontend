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
// Where the type steps up for a very wide screen. NOT `2xl`, which is 1440: at the 1512 the design
// is drawn and shown at, the kit's `2xl` step has already fired and every heading renders one step
// larger than the design — measured on the design's product, cart, dashboard and orders screens,
// all of which sit at the base size there (h1 32/36 against our 36/40). The design's own wide mode
// starts much later: above 1280 its only breakpoints are 1900 (x2) and 1920 (x4). `4xl` is this
// project's step for that rung — 1900 snaps to it, the way every width the design names snaps to
// the nearest step of ours — and it still serves the projector pass.
$wide: theme("screens.4xl");

.vc-typography {
  --props-font-size: v-bind(props.fontSize);
  --props-font-weight: v-bind(props.fontWeight);
  --props-text-transform: v-bind(props.textTransform);
  --props-color: v-bind(_color);

  --font-size: var(--props-font-size, var(--vc-typography-font-size));
  --font-weight: var(--props-font-weight, var(--vc-typography-font-weight));
  // One knob for the whole heading ladder, so a theme retunes h1-h6 together instead of six times.
  // Each level keeps its own value as the fallback, so nothing moves until a theme names it.
  --heading-weight: var(--vc-typography-heading-font-weight, 700);
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
      font-weight: var(--font-weight, var(--heading-weight));
      line-height: var(--line-height, 36px);
      letter-spacing: -0.03em;

      @media (width < theme("screens.lg")) {
        font-size: var(--font-size, 30px);
        line-height: var(--line-height, 34px);
      }

      @media (width >= $wide) {
        font-size: var(--font-size, 36px);
        line-height: var(--line-height, 40px);
      }
    }

    &--h2 {
      font-size: var(--font-size, 26px);
      font-weight: var(--font-weight, var(--heading-weight));
      line-height: var(--line-height, 32px);
      letter-spacing: -0.025em;

      @media (width < theme("screens.lg")) {
        font-size: var(--font-size, 24px);
        line-height: var(--line-height, 30px);
      }

      @media (width >= $wide) {
        font-size: var(--font-size, 28px);
        line-height: var(--line-height, 34px);
      }
    }

    &--h3 {
      font-size: var(--font-size, 20px);
      font-weight: var(--font-weight, var(--heading-weight));
      line-height: var(--line-height, 28px);
      letter-spacing: -0.02em;

      @media (width < theme("screens.lg")) {
        line-height: var(--line-height, 26px);
      }

      @media (width >= $wide) {
        font-size: var(--font-size, 22px);
        line-height: var(--line-height, 30px);
      }
    }

    &--h4 {
      font-size: var(--font-size, 18px);
      // h4 is the one level whose own default is already 600, so it reads the knob directly
      // rather than `--heading-weight` — which would take it up to 700 for every theme.
      font-weight: var(--font-weight, var(--vc-typography-heading-font-weight, 600));
      line-height: var(--line-height, 24px);
      letter-spacing: -0.015em;

      @media (width >= $wide) {
        font-size: var(--font-size, 20px);
        line-height: var(--line-height, 26px);
      }
    }

    &--h5 {
      font-size: var(--font-size, 16px);
      font-weight: var(--font-weight, var(--heading-weight));
      line-height: var(--line-height, 22px);
      letter-spacing: -0.01em;

      @media (width >= $wide) {
        font-size: var(--font-size, 17px);
        line-height: var(--line-height, 23px);
      }
    }

    &--h6 {
      font-size: var(--font-size, 14px);
      font-weight: var(--font-weight, var(--heading-weight));
      line-height: var(--line-height, 20px);
      letter-spacing: -0.006em;

      @media (width >= $wide) {
        font-size: var(--font-size, 15px);
        line-height: var(--line-height, 21px);
      }
    }

    &--base {
      font-size: var(--font-size, 16px);
      font-weight: var(--font-weight, 400);
      line-height: var(--line-height, 1.5);
      text-transform: var(--text-transform, none);

      @media (width >= $wide) {
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
