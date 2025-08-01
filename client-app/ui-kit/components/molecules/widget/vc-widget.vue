<template>
  <section
    :class="[
      'vc-widget',
      `vc-widget--size--${size}`,
      {
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
        <div class="vc-widget__slot" :aria-labelledby="ARIAIds.title">
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
  $collapsed: "";

  $sizeLG: "";

  --p-x: theme("padding.4");
  --border-color: var(--vc-widget-border-color, theme("colors.neutral.200"));
  --divide-color: var(--vc-widget-divide-color, var(--border-color));
  --bg-color: var(--vc-widget-bg-color, theme("colors.additional.50"));
  --radius: var(--vc-widget-radius, var(--vc-radius, 0.5rem));

  @apply relative border border-[--border-color] bg-[--bg-color] text-neutral-950 text-base rounded-[--radius] divide-y divide-[--divide-color] shadow-md bg-center;

  @media (width < theme("screens.md")) {
    .vc-container & {
      @apply -mx-4.5;
    }

    #{$self} & {
      @apply mx-0;
    }
  }

  &--size {
    &--xs {
      --header-min-height: 2.5rem;
      --header-gap: theme("gap.[1.5]");
      --title-text: theme("fontSize.sm");
      --title-min-h: 1.625rem;
      --slot-p-t: theme("padding.4");
    }

    &--sm {
      --header-min-height: 2.75rem;
      --header-gap: theme("gap.2");
      --title-text: theme("fontSize.base");
      --title-min-h: 1.875rem;
      --slot-p-t: theme("padding.4");
    }

    &--md {
      --header-min-height: 3.25rem;
      --header-gap: theme("gap.2");
      --title-text: theme("fontSize.xl");
      --title-min-h: 2.125rem;
      --slot-p-t: theme("padding.4");

      @media (min-width: theme("screens.lg")) {
        --p-x: theme("padding.6");
      }
    }

    &--lg {
      $sizeLG: &;

      --header-min-height: 4rem;
      --header-gap: theme("gap.2");
      --title-text: theme("fontSize.xl");
      --title-min-h: 2.75rem;
      --slot-p-t: theme("padding[3.5]");

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
    --vc-hexagon-icon-size: var(--title-min-h);

    @apply flex items-center gap-[--header-gap] px-[--p-x] py-1 w-full min-h-[--header-min-height];

    #{$sizeLG} & {
      @apply items-end;
    }
  }

  &__prepend-append {
    --vc-icon-size: 1.25rem;

    @apply flex-none flex items-center min-h-[--title-min-h];
  }

  &__title {
    @apply flex flex-col justify-center min-h-[--title-min-h] min-w-0 grow text-[length:--title-text] font-bold uppercase break-words;
  }

  &__slot {
    @apply pt-[--slot-p-t] pb-5 px-[--p-x];

    *:first-child > & {
      #{$sizeLG} & {
        --slot-p-t: theme("padding.5");
      }
    }
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
