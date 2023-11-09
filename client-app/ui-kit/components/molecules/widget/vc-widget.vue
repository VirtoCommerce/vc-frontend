<template>
  <div
    :class="[
      'vc-widget',
      `vc-widget--size--${size}`,
      {
        'vc-widget--collapsed': _collapsed,
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
            <slot name="prepend-icon">
              <span v-if="prependIcon" class="vc-widget__icon">
                <VcHexagonIcon :icon="prependIcon" />
              </span>
            </slot>

            <span class="vc-widget__title">
              {{ title }}
            </span>

            <slot name="append-icon" v-bind="{ collapsible, collapsed: _collapsed }">
              <span v-if="collapsible" class="vc-widget__icon">
                <VcIcon
                  :class="['vc-widget__append-icon', { 'vc-widget__append-icon--rotate': _collapsed }]"
                  name="chevron-up"
                  size="sm"
                />
              </span>

              <span v-else-if="appendIcon" class="vc-widget__icon">
                <VcIcon class="vc-widget__append-icon" :name="appendIcon" size="sm" />
              </span>
            </slot>
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
  fullSizeContent?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
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

  @apply relative border border-[--color-neutral-100] bg-[--color-additional-50] text-[--color-neutral-950] rounded shadow-md;

  &--size {
    &--xs {
      $sizeXS: &;

      --padding-x: 1rem;
      --header-height: 2.375rem;
    }

    &--sm {
      $sizeSM: &;

      --padding-x: 1rem;
      --header-height: 2.625rem;
    }

    &--md {
      $sizeMD: &;

      --padding-x: 1.5rem;
      --header-height: 3.125rem;
    }

    &--lg {
      $sizeLG: &;

      --padding-x: 1.75rem;
      --header-height: 3.875rem;

      @apply rounded-none divide-none;

      @media (min-width: theme("screens.md")) {
        @apply rounded;
      }
    }
  }

  &--collapsed {
    $collapsed: &;
  }

  &__header-container {
    @apply flex items-center w-full empty:hidden;

    &,
    & > * {
      @apply rounded-t-[inherit];
    }
  }

  &__header {
    @apply flex min-h-[--header-height] px-[--padding-x] w-full text-start font-bold uppercase border-b;

    #{$sizeXS} & {
      --vc-hexagon-icon-size: calc(var(--header-height) - 0.75rem);

      @apply gap-1.5 py-1 text-sm;
    }

    #{$sizeSM} & {
      --vc-hexagon-icon-size: calc(var(--header-height) - 0.75rem);

      @apply gap-2 py-2 text-base;
    }

    #{$sizeMD} & {
      --vc-hexagon-icon-size: calc(var(--header-height) - 1rem);

      @apply gap-2 py-2 text-xl;
    }

    #{$sizeLG} & {
      --vc-hexagon-icon-size: calc(var(--header-height) - 1.25rem);

      @apply gap-2 py-4 text-xl border-b-0;
    }

    #{$collapsed} & {
      @apply border-b-0;
    }
  }

  &__icon {
    @apply flex-none flex items-center;
  }

  &__title {
    @apply flex flex-col justify-center min-h-[--vc-hexagon-icon-size] grow;
  }

  &__slot {
    @apply pt-4 pb-5 px-[--padding-x];

    #{$sizeLG} & {
      @apply pt-0;

      &:first-child {
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
    @apply py-4 px-[--padding-x] border-t;
  }
}
</style>
