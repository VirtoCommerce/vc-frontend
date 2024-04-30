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

  @apply relative border border-[--color-neutral-100] bg-[--color-additional-50] rounded divide-y shadow-md animate-pulse;

  &--size {
    &--xs {
      --p-x: theme("padding.4");
      --header-p-y: theme("padding[2.5]");
      --placeholder-h: 1.125rem;
    }

    &--sm {
      --p-x: theme("padding.4");
      --header-p-y: theme("padding.3");
      --placeholder-h: 1.375rem;
    }

    &--md {
      --p-x: theme("padding.6");
      --header-p-y: theme("padding.3");
      --placeholder-h: 1.625rem;
    }

    &--lg {
      $sizeLG: &;

      --p-x: theme("padding.5");
      --header-p-y: theme("padding.4");
      --placeholder-h: 2.625rem;

      @apply divide-none;

      @media (min-width: theme("screens.lg")) {
        --p-x: theme("padding.7");
      }
    }
  }

  &--no-shadow {
    @apply shadow-none;
  }

  &__header-container {
    *:not(:has(*)) {
      @apply h-[--placeholder-h] rounded bg-[--color-neutral-100];

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
      @apply mb-2 h-4 rounded bg-[--color-neutral-100] last:mb-0;

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
    @apply pt-4 pb-5 px-[--p-x];

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
      @apply h-4 rounded bg-[--color-neutral-100];

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
