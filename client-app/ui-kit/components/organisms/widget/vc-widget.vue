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
                <VcIcon v-if="prependIcon" class="vc-widget__prepend-icon" :name="prependIcon" />
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

    <div v-show="!_collapsed" v-if="$slots.default || $slots['default-container']" class="vc-widget__slot-container">
      <slot name="default-container">
        <div v-if="$slots.default" class="vc-widget__slot" :aria-labelledby="ARIAIds.title">
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
import { uniqueId } from "lodash-es";
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

  // The body's own inset. Public, because a page that wants a roomier plate has to be able to
  // say so by name: these three used to be reachable only as `--p-x`/`--p-t`/`--p-b`, which are
  // this block's private spelling — an app setting them was writing into the kit's internals,
  // and they inherit, so the value also landed on every widget nested below. The horizontal one
  // steps up with the size; the knob wins over that step wherever it is set.
  --p-x: var(--vc-widget-padding-x, theme("padding.4"));
  --p-t: var(--vc-widget-padding-top, theme("padding.4"));
  --p-b: var(--vc-widget-padding-bottom, theme("padding.5"));
  --border-color: var(--vc-widget-border-color, theme("colors.neutral.200"));
  --divide-color: var(--vc-widget-divide-color, var(--border-color));
  --bg-color: var(--vc-widget-bg-color, theme("colors.additional.50"));
  --radius: var(--vc-widget-radius, var(--vc-radius, 0.5rem));
  // Exposed so a theme can give the widget its own elevation — a theme whose surfaces are
  // plates needs a shadow that survives dark mode, where this one's black is invisible.
  --shadow: var(--vc-widget-shadow, theme("boxShadow.md"));
  --header-gap: theme("gap.2");

  @apply relative border border-[--border-color] bg-[--bg-color] text-neutral-950 text-base rounded-[--radius] divide-y divide-[--divide-color] bg-center;

  // Raw, not `shadow-[--shadow]`: Tailwind reads a bare custom property there as a shadow
  // COLOUR and drops the box-shadow declaration altogether.
  box-shadow: var(--shadow);

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
        --p-x: var(--vc-widget-padding-x, theme("padding.6"));
      }
    }

    &--lg {
      --header-min-h: 4.375rem;
      --header-gap: theme("gap[2.5]");
      --title-text: theme("fontSize.xl");
      --icon-size: 1.25rem;
      --shape-size: 2.5rem;

      @media (min-width: theme("screens.lg")) {
        --p-x: var(--vc-widget-padding-x, theme("padding.7"));
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
    // With the shadow gone the outline is the widget's only edge, so this one does not read
    // the border colour a theme clears in exchange for a shadow — it has its own knob.
    --border-color: var(--vc-widget-no-shadow-border-color, theme("colors.neutral.200"));

    @apply shadow-none;
  }

  &--no-border {
    @apply border-none;
  }

  &__header-container {
    @apply w-full text-start empty:hidden;

    &,
    & > * {
      // The widget's own curve, not a fixed step: `rounded-t` is 4px whatever --radius says, so
      // on a theme that rounds its plates to 28 the header's corners cut inside the plate — and
      // on a collapsible widget those corners are a button, whose focus ring follows them.
      border-radius: var(--radius) var(--radius) 0 0;

      // Collapsed, the header IS the whole plate, so it rounds on all four.
      #{$collapsed} & {
        border-radius: var(--radius);
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
    @apply font-geologica flex flex-col justify-center min-w-0 grow text-[length:--title-text] font-bold break-words;

    // The display face is set a touch tight, the same as every other heading it stands beside —
    // the face is drawn for it and reads loose at a title's size without it.
    letter-spacing: -0.02em;
  }

  &__slot {
    @apply pt-[--p-t] pb-[--p-b] px-[--p-x] empty:hidden;
  }

  &__prepend-icon {
    --vc-icon-color: theme("colors.primary.500");
  }

  &__append-icon {
    @apply text-primary transition-all;

    &--rotate {
      @apply rotate-180;
    }
  }

  &__footer-container {
    @apply empty:hidden;

    &,
    & > * {
      // The same curve the header takes, at the other end of the plate.
      border-radius: 0 0 var(--radius) var(--radius);
    }
  }

  &__footer {
    @apply py-4 px-[--p-x];
  }
}
</style>
