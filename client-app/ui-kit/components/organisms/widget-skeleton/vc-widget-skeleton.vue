<template>
  <div
    :class="[
      'vc-widget-skeleton',
      `vc-widget-skeleton--size--${size}`,
      {
        'vc-widget-skeleton--no-shadow': noShadow,
      },
    ]"
  >
    <div v-if="head || $slots.header || $slots['header-container']" class="vc-widget-skeleton__header-container">
      <slot name="header-container">
        <div class="vc-widget-skeleton__header">
          <slot name="header">
            <div></div>
          </slot>
        </div>
      </slot>
    </div>

    <div class="vc-widget-skeleton__slot-container">
      <slot name="default-container">
        <div class="vc-widget-skeleton__slot">
          <slot>
            <div v-for="i in [1, 2, 3, 4, 5]" :key="i"></div>
          </slot>
        </div>
      </slot>
    </div>

    <div v-if="foot || $slots.footer || $slots['footer-container']" class="vc-widget-skeleton__footer-container">
      <slot name="footer-container">
        <div class="vc-widget-skeleton__footer">
          <slot name="footer">
            <div></div>
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  head?: boolean;
  foot?: boolean;
  noShadow?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

withDefaults(defineProps<IProps>(), {
  size: "md",
});
</script>

<style lang="scss">
.vc-widget-skeleton {
  $sizeLG: "";

  // VcWidget's surface knobs, so a theme that reshapes the widget reshapes the placeholder
  // standing in for it. Not --vc-widget-divide-color: this component's rules are placeholder
  // bars, not content. The fallbacks are its own long-standing values, not the widget's, so an
  // untouched theme renders exactly as before.
  --border-color: var(--vc-widget-border-color, theme("colors.neutral.100"));
  --bg-color: var(--vc-widget-bg-color, theme("colors.additional.50"));
  --radius: var(--vc-widget-radius, theme("borderRadius.DEFAULT"));
  --shadow: var(--vc-widget-shadow, theme("boxShadow.md"));

  @apply relative border border-[--border-color] bg-[--bg-color] rounded-[--radius] divide-y animate-pulse;

  box-shadow: var(--shadow);

  // Each size's inset reads VcWidget's padding knobs first, for the same reason the surface
  // knobs above are mirrored: a placeholder that keeps the kit's inset while the widget it
  // stands in for takes the page's would jump the moment the real content arrives. One `--pad`
  // per size, read by all three, because the widget it stands in for is one inset on four sides —
  // a hardcoded 16/20 here left the placeholder shorter than the content that replaced it.
  --p-x: var(--vc-widget-padding-x, var(--pad));
  --p-t: var(--vc-widget-padding-top, var(--pad));
  --p-b: var(--vc-widget-padding-bottom, var(--pad));

  &--size {
    &--xs {
      --pad: theme("padding.4");
      --header-p-y: theme("padding[2.5]");
      --placeholder-h: 1.125rem;
    }

    &--sm {
      --pad: theme("padding.4");
      --header-p-y: theme("padding.3");
      --placeholder-h: 1.375rem;
    }

    &--md {
      --pad: theme("padding.6");
      --header-p-y: theme("padding.3");
      --placeholder-h: 1.625rem;
    }

    &--lg {
      $sizeLG: &;

      --pad: theme("padding.5");
      --header-p-y: theme("padding.4");
      --placeholder-h: 2.625rem;

      @apply divide-none;

      @media (min-width: theme("screens.lg")) {
        --pad: theme("padding.7");
      }
    }
  }

  &--no-shadow {
    // Same reason as VcWidget's, on the same knob — but the fallback stays this component's
    // own colour, which is a step lighter than the widget's.
    --border-color: var(--vc-widget-no-shadow-border-color, theme("colors.neutral.100"));

    @apply shadow-none;
  }

  &__header-container {
    *:not(:has(*)) {
      @apply h-[--placeholder-h] rounded bg-neutral-100;

      &:not([class*="w-"]) {
        @apply w-2/3;
      }
    }
  }

  &__header {
    @apply flex items-start gap-2 px-[--p-x] py-[--header-p-y];
  }

  &__slot-container {
    *:not(:has(*)) {
      @apply mb-2 h-4 rounded bg-neutral-100 last:mb-0;

      &:not([class*="w-"]) {
        &:nth-child(even) {
          @apply w-4/5;
        }

        &:nth-child(odd) {
          @apply w-2/5;
        }

        &:nth-child(3n + 3) {
          @apply w-3/5;
        }

        &:nth-child(4n + 4) {
          @apply w-full;
        }

        &:nth-child(5n + 5) {
          @apply w-1/5;
        }
      }
    }
  }

  &__slot {
    @apply pt-[--p-t] pb-[--p-b] px-[--p-x];

    #{$sizeLG} & {
      @apply pt-0;
    }

    *:first-child > & {
      #{$sizeLG} & {
        @apply pt-5;
      }
    }
  }

  &__footer-container {
    *:not(:has(*)) {
      @apply h-4 rounded bg-neutral-100;

      &:not([class*="w-"]) {
        @apply w-1/3;
      }
    }
  }

  &__footer {
    @apply py-4 px-[--p-x];
  }
}
</style>
