<template>
  <div
    :class="[
      'vc-widget',
      `vc-widget--size--${size}`,
      {
        'vc-widget--collapsed': _collapsed,
        'vc-widget--shadow': shadow,
      },
    ]"
  >
    <component
      :is="collapsible ? 'button' : 'div'"
      v-if="title || $slots.header"
      :type="collapsible ? 'button' : null"
      class="vc-widget__header-container"
      @click="toggleCollapse()"
    >
      <slot name="header-container" v-bind="{ collapsible, collapsed: _collapsed }">
        <span class="vc-widget__header">
          <slot name="header" v-bind="{ collapsible, collapsed: _collapsed }">
            <span v-if="prependIcon || $slots.prepend" class="vc-widget__prepend-append">
              <slot name="prepend">
                <VcHexagonIcon v-if="prependIcon" :icon="prependIcon" />
              </slot>
            </span>

            <span class="vc-widget__title">
              {{ title }}
            </span>

            <span v-if="collapsible || appendIcon || $slots.append" class="vc-widget__prepend-append">
              <slot name="append" v-bind="{ collapsible, collapsed: _collapsed }">
                <VcIcon
                  v-if="collapsible"
                  :class="['vc-widget__append-icon', { 'vc-widget__append-icon--rotate': _collapsed }]"
                  name="chevron-up"
                  size="sm"
                />

                <VcIcon v-else-if="appendIcon" class="vc-widget__append-icon" :name="appendIcon" size="sm" />
              </slot>
            </span>
          </slot>
        </span>
      </slot>
    </component>

    <div v-show="!_collapsed" class="vc-widget__slot-container">
      <slot name="default-container">
        <div class="vc-widget__slot">
          <slot />
        </div>
      </slot>
    </div>

    <div v-show="!_collapsed" class="vc-widget__footer-container">
      <slot name="footer-container">
        <div v-if="$slots.footer" class="vc-widget__footer">
          <slot name="footer" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";

export interface IProps {
  title?: string;
  prependIcon?: string;
  appendIcon?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  shadow?: boolean;
  fullSizeContent?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  shadow: true,
});

const _collapsed = ref(false);

function toggleCollapse() {
  if (props.collapsible) {
    _collapsed.value = !_collapsed.value;
  }
}

watchEffect(() => {
  _collapsed.value = props.collapsed;
});
</script>

<style lang="scss">
.vc-widget {
  $collapsed: "";

  $sizeXS: "";
  $sizeSM: "";
  $sizeMD: "";
  $sizeLG: "";

  @apply relative border border-[--color-neutral-100] bg-[--color-additional-50] text-[--color-neutral-950] rounded divide-y;

  &--size {
    &--xs {
      $sizeXS: &;

      --padding-x: 1rem;
      --padding-y: 0.25rem;
      --header-height: 2.375rem;
    }

    &--sm {
      $sizeSM: &;

      --padding-x: 1rem;
      --padding-y: 0.5rem;
      --header-height: 2.625rem;
    }

    &--md {
      $sizeMD: &;

      --padding-x: 1.5rem;
      --padding-y: 0.5rem;
      --header-height: 3.125rem;
    }

    &--lg {
      $sizeLG: &;

      --padding-x: 1.5rem;
      --padding-y: 1rem;
      --header-height: 3.875rem;

      @apply divide-none;

      @media (min-width: theme("screens.lg")) {
        --padding-x: 1.75rem;
      }
    }
  }

  &--collapsed {
    $collapsed: &;
  }

  &--shadow {
    @apply shadow-md;
  }

  &__header-container {
    @apply flex items-center min-h-[--header-height] w-full empty:hidden;

    &,
    & > * {
      @apply rounded-t-[inherit];
    }
  }

  &__header {
    @apply flex items-start px-[--padding-x] py-[--padding-y] w-full text-start;

    #{$sizeXS} & {
      --title-min-h: calc(var(--header-height) - 0.75rem);

      @apply gap-1.5 text-sm;
    }

    #{$sizeSM} & {
      --title-min-h: calc(var(--header-height) - 0.75rem);

      @apply gap-2 text-base;
    }

    #{$sizeMD} & {
      --title-min-h: calc(var(--header-height) - 1rem);

      @apply gap-2 text-xl;
    }

    #{$sizeLG} & {
      --title-min-h: calc(var(--header-height) - 1.25rem);

      @apply gap-2 text-xl;
    }

    --vc-hexagon-icon-size: var(--title-min-h);
  }

  &__prepend-append {
    @apply flex-none flex items-center min-h-[--title-min-h];
  }

  &__title {
    @apply flex flex-col justify-center min-h-[--title-min-h] grow font-bold uppercase;
  }

  &__slot {
    @apply pt-4 pb-5 px-[--padding-x];

    #{$sizeLG} & {
      @apply pt-0;
    }

    *:first-child > & {
      #{$sizeLG} & {
        @apply pt-5;
      }
    }
  }

  &__append-icon {
    @apply text-[--color-primary-500] transition-all;

    &--rotate {
      @apply rotate-180;
    }
  }

  &__footer-container {
    @apply rounded-b-[inherit] empty:hidden;

    & > * {
      @apply rounded-b-[inherit];
    }
  }

  &__footer {
    @apply py-4 px-[--padding-x];
  }
}
</style>
