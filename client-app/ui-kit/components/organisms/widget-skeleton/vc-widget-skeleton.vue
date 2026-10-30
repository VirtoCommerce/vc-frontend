<template>
  <VcWidget
    :size="size"
    :shadow="!noShadow"
    :class="['vc-widget-skeleton', `vc-widget-skeleton--size--${size}`]"
    v-bind="widgetAttrs"
  >
    <template v-if="$slots['header-container']" #header-container>
      <div class="vc-widget-skeleton__header-container">
        <slot name="header-container" />
      </div>
    </template>

    <template v-else-if="head || $slots.header" #header>
      <div class="vc-widget-skeleton__header">
        <slot name="header">
          <div></div>
        </slot>
      </div>
    </template>

    <template v-if="$slots['default-container']" #default-container>
      <div class="vc-widget-skeleton__slot-container">
        <slot name="default-container" />
      </div>
    </template>

    <template v-else #default>
      <div class="vc-widget-skeleton__slot">
        <slot>
          <div v-for="i in [1, 2, 3, 4, 5]" :key="i"></div>
        </slot>
      </div>
    </template>

    <template v-if="$slots['footer-container']" #footer-container>
      <div class="vc-widget-skeleton__footer-container">
        <slot name="footer-container" />
      </div>
    </template>

    <template v-else-if="foot || $slots.footer" #footer>
      <div class="vc-widget-skeleton__footer">
        <slot name="footer">
          <div></div>
        </slot>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { omitBy } from "lodash-es";
import { camelize, computed, useAttrs } from "vue";

/** Renders a VcWidget; its frame props, classes and listeners pass through, its title, icons and collapsible do not. */
interface IProps {
  head?: boolean;
  foot?: boolean;
  noShadow?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<IProps>(), {
  size: "md",
});

const WIDGET_CONTENT_PROPS = ["title", "prependIcon", "appendIcon", "collapsible"];

const attrs = useAttrs();
const widgetAttrs = computed(() => omitBy(attrs, (_, name) => WIDGET_CONTENT_PROPS.includes(camelize(name))));
</script>

<style lang="scss">
.vc-widget-skeleton {
  @apply animate-pulse;

  &--size {
    &--xs {
      --placeholder-h: 1.125rem;
    }

    &--sm {
      --placeholder-h: 1.375rem;
    }

    &--md {
      --placeholder-h: 1.625rem;
    }

    &--lg {
      --placeholder-h: 2.625rem;
    }
  }

  &__header-container,
  &__header {
    *:not(:has(*)) {
      @apply h-[--placeholder-h] rounded bg-neutral-100;

      &:not([class*="w-"]) {
        @apply w-2/3;
      }
    }
  }

  &__header {
    @apply flex grow items-center gap-2;
  }

  &__slot-container,
  &__slot {
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

  &__footer-container,
  &__footer {
    *:not(:has(*)) {
      @apply h-4 rounded bg-neutral-100;

      &:not([class*="w-"]) {
        @apply w-1/3;
      }
    }
  }
}
</style>
