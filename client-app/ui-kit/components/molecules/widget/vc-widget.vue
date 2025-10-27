<template>
  <section
    :class="[
      'vc-widget',
      `vc-widget--size--${size}`,
      {
        'vc-widget--collapsible': collapsible,
        'vc-widget--collapsed': _collapsed,
        'vc-widget--no-shadow': !shadow,
        'vc-widget--no-border': !border,
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
                <VcShape v-if="prependIcon" :icon="prependIcon" />
              </slot>
            </span>

            <span :id="ARIAIds.title" class="vc-widget__title">
              <slot name="title">
                {{ title }}
              </slot>
            </span>

            <span v-if="collapsible || appendIcon || $slots.append" class="vc-widget__prepend-append">
              <slot name="append" v-bind="{ collapsible, collapsed: _collapsed }">
                <VcIcon
                  v-if="collapsible"
                  :class="['vc-widget__append-icon', { 'vc-widget__append-icon--rotate': _collapsed }]"
                  name="chevron-up-thin"
                />

                <VcIcon v-else-if="appendIcon" class="vc-widget__append-icon" :name="appendIcon" />
              </slot>
            </span>
          </slot>
        </span>
      </slot>
    </component>

    <div v-show="!_collapsed" class="vc-widget__slot-container">
      <slot name="default-container">
        <div v-if="!!$slots.default" class="vc-widget__slot" :aria-labelledby="ARIAIds.title">
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
  </section>
</template>

<script setup lang="ts">
import { uniqueId } from "lodash";
import { computed, ref, watchEffect } from "vue";

export interface IEmits {
  (event: "toggleCollapse", value: boolean): void;
}

interface IProps {
  title?: string;
  prependIcon?: string;
  appendIcon?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  shadow?: boolean;
  border?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  shadow: true,
  border: true,
});

const _collapsed = ref(false);

const ARIAIds = computed(() => {
  return {
    title: props.title && uniqueId("title"),
  };
});

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
  $self: &;
  $collapsible: "";
  $collapsed: "";

  --p-x: theme("padding.4");
  --border-color: var(--vc-widget-border-color, theme("colors.neutral.200"));
  --divide-color: var(--vc-widget-divide-color, var(--border-color));
  --bg-color: var(--vc-widget-bg-color, theme("colors.additional.50"));
  --radius: var(--vc-widget-radius, var(--vc-radius, 0.5rem));
  --header-gap: theme("gap.2");

  @apply relative border border-[--border-color] bg-[--bg-color] text-neutral-950 text-base rounded-[--radius] divide-y divide-[--divide-color] shadow-md bg-center;

  @media (width < theme("screens.md")) {
    .vc-container & {
      @apply -mx-4.5;
    }

    #{$self} & {
      @apply mx-0;
    }
  }

  &--collapsible {
    $collapsible: &;
  }

  &--size {
    &--xs {
      --header-min-h: 2.375rem;
      --title-text: theme("fontSize.sm");
      --icon-size: 0.875rem;
      --shape-size: 1.75rem;
    }

    &--sm {
      --header-min-h: 2.875rem;
      --title-text: theme("fontSize.base");
      --icon-size: 1rem;
      --shape-size: 2rem;
    }

    &--md {
      --header-min-h: 3.125rem;
      --title-text: theme("fontSize.lg");
      --icon-size: 1.25rem;
      --shape-size: 2.25rem;

      @media (min-width: theme("screens.sm")) {
        --p-x: theme("padding.6");
      }
    }

    &--lg {
      --header-min-h: 4.375rem;
      --header-gap: theme("gap[2.5]");
      --title-text: theme("fontSize.xl");
      --icon-size: 1.25rem;
      --shape-size: 2.5rem;

      @media (min-width: theme("screens.sm")) {
        --p-x: theme("padding.7");
      }

      &:not(#{$collapsible}) {
        @apply divide-none;
      }
    }
  }

  &--collapsed {
    $collapsed: &;
  }

  &--no-shadow {
    @apply shadow-none;
  }

  &--no-border {
    @apply border-none shadow-none;
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
    @apply flex items-center gap-[--header-gap] min-h-[--header-min-h] px-[--p-x] py-1 w-full;
  }

  &__prepend-append {
    --vc-shape-size: var(--shape-size);
    --vc-icon-size: var(--icon-size);

    @apply flex-none flex items-center;
  }

  &__title {
    @apply flex flex-col justify-center min-w-0 grow text-[length:--title-text] font-bold uppercase break-words;
  }

  &__slot {
    @apply pt-4 pb-5 px-[--p-x] empty:hidden;
  }

  &__append-icon {
    @apply fill-primary transition-all;

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
