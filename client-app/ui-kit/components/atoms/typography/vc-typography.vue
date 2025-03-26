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
  fontSize: "",
  fontWeight: "",
  textTransform: "",
  color: "",
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
    &--h1 {
      @apply tracking-wide;

      font-size: var(--font-size, theme("fontSize.2xl"));
      font-weight: var(--font-weight, 700);
      text-transform: var(--text-transform, uppercase);

      @media (min-width: theme("screens.lg")) {
        font-size: var(--font-size, theme("fontSize.3xl"));
      }
    }

    &--h2 {
      @apply tracking-wide;

      font-size: var(--font-size, theme("fontSize.xl"));
      font-weight: var(--font-weight, 700);
      text-transform: var(--text-transform, uppercase);

      @media (min-width: theme("screens.lg")) {
        font-size: var(--font-size, theme("fontSize.2xl"));
      }
    }

    &--h3 {
      @apply tracking-wide;

      font-size: var(--font-size, theme("fontSize.lg"));
      font-weight: var(--font-weight, 700);
      text-transform: var(--text-transform, uppercase);

      @media (min-width: theme("screens.lg")) {
        font-size: var(--font-size, theme("fontSize.xl"));
      }
    }

    &--h4 {
      font-size: var(--font-size, theme("fontSize.base"));
      font-weight: var(--font-weight, 700);
      text-transform: var(--text-transform, uppercase);

      @media (min-width: theme("screens.lg")) {
        font-size: var(--font-size, theme("fontSize.lg"));
      }
    }

    &--h5 {
      font-size: var(--font-size, theme("fontSize.base"));
      font-weight: var(--font-weight, 700);
      text-transform: var(--text-transform, uppercase);
    }

    &--h6 {
      font-size: var(--font-size, theme("fontSize.base"));
      font-weight: var(--font-weight, 700);
      text-transform: var(--text-transform, uppercase);
    }

    &--base {
      font-size: var(--font-size, theme("fontSize.base"));
      font-weight: var(--font-weight, 400);
      text-transform: var(--text-transform, none);
    }
  }

  &--truncate {
    @apply truncate;
  }
}
</style>
