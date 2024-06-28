<template>
  <div
    :class="[
      'vc-widget',
      `vc-widget--size--${size}`,
      {
        'vc-widget--collapsed': _collapsed,
        'vc-widget--no-shadow': noShadow,
      },
    ]"
  >
    <component
      :is="collapsible ? 'button' : 'div'"
      v-if="title || $slots.title || $slots.header || $slots['header-container']"
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
              <slot name="title">
                {{ title }}
              </slot>
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

    <div v-if="$slots.footer || $slots['footer-container']" v-show="!_collapsed" class="vc-widget__footer-container">
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

export interface IEmits {
  (event: "toggleCollapse", value: boolean): void;
}

interface IProps {
  title?: string;
  prependIcon?: string;
  appendIcon?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  noShadow?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
});

const _collapsed = ref(false);

function toggleCollapse() {
  if (props.collapsible) {
    _collapsed.value = !_collapsed.value;
    emit("toggleCollapse", _collapsed.value);
  }
}

watchEffect(() => {
  _collapsed.value = props.collapsed;
});
</script>

<style lang="scss">
.vc-widget {
  $collapsed: "";

  $sizeLG: "";

  --p-x: theme("padding.4");

  @apply relative border border-[--color-neutral-100] bg-[--color-additional-50] text-[--color-neutral-950] text-base rounded divide-y shadow-md;

  @media (max-width: theme("screens.md")) {
    .vc-container & {
      @apply -mx-4.5;
    }
  }

  &--size {
    &--xs {
      --header-p-y: theme("padding.[1.5]");
      --header-gap: theme("gap.[1.5]");
      --title-text: theme("fontSize.sm");
      --title-min-h: 1.625rem;
    }

    &--sm {
      --header-p-y: theme("padding.[1.5]");
      --header-gap: theme("gap.2");
      --title-text: theme("fontSize.base");
      --title-min-h: 1.875rem;
    }

    &--md {
      --header-p-y: theme("padding.2");
      --header-gap: theme("gap.2");
      --title-text: theme("fontSize.xl");
      --title-min-h: 2.125rem;

      @media (min-width: theme("screens.lg")) {
        --p-x: theme("padding.6");
      }
    }

    &--lg {
      $sizeLG: &;

      --header-p-y: theme("padding.4");
      --header-gap: theme("gap.2");
      --title-text: theme("fontSize.xl");
      --title-min-h: 2.625rem;

      @apply divide-none;

      @media (min-width: theme("screens.lg")) {
        --p-x: theme("padding.7");
      }
    }
  }

  &--collapsed {
    $collapsed: &;
  }

  &--no-shadow {
    @apply shadow-none;
  }

  &__header-container {
    @apply w-full text-start empty:hidden;

    &,
    & > * {
      @apply rounded-t;

      #{$collapsed} & {
        @apply rounded-b;
      }
    }
  }

  &__header {
    --vc-hexagon-icon-size: var(--title-min-h);

    @apply flex items-start gap-[--header-gap] px-[--p-x] py-[--header-p-y] w-full;
  }

  &__prepend-append {
    --vc-icon-size: 1.25rem;

    @apply flex-none flex items-center min-h-[--title-min-h];
  }

  &__title {
    @apply flex flex-col justify-center min-h-[--title-min-h] min-w-0 grow text-[length:--title-text] font-bold uppercase;
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

  &__append-icon {
    @apply text-[--color-primary-500] transition-all;

    &--rotate {
      @apply rotate-180;
    }
  }

  &__footer-container {
    @apply rounded-b empty:hidden;

    & > * {
      @apply rounded-b;
    }
  }

  &__footer {
    @apply py-4 px-[--p-x];
  }
}
</style>
