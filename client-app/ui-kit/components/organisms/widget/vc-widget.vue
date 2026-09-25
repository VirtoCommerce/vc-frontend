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
        'vc-widget--nested': nested,
        'vc-widget--icon-shape': iconShape,
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
                <!-- A span, not the shape's default div: a collapsible widget draws this header
                     as a button, and flow content inside one is invalid. -->
                <VcShape
                  v-if="prependIcon && iconShape"
                  class="vc-widget__prepend-shape"
                  :icon="prependIcon"
                  mask="circle"
                  tag="span"
                />

                <VcIcon v-else-if="prependIcon" class="vc-widget__prepend-icon" :name="prependIcon" />
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
  /**
   * The widget already sits inside someone else's shell — a plate, a sidebar, a column. It then
   * draws no plate of its own and keeps no side inset, because two nested insets in a row push the
   * content 36-52px off the edge and break its alignment with everything else in that shell.
   */
  nested?: boolean;
  /**
   * Draws the prepended icon on a disc and sets the title to match, which is how this theme marks
   * the head of a content block. Off by default: a widget that is a panel rather than a block — a
   * checkout section, a cart summary — keeps the bare glyph. Retune it with the
   * `--vc-widget-icon-shape-*` variables rather than per call site.
   */
  iconShape?: boolean;
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
  // and they inherit, so the value also landed on every widget nested below. The inset steps up
  // with the size; a knob wins over that step wherever it is set.
  //
  // One inset, four sides: `--pad` is that step. The horizontal one used to be the only one that
  // grew with the size, so a `md` widget stood its body 24 off the sides and 16/20 off the top and
  // bottom — plain to read once the body is a bordered table, whose box then sits closer to the
  // plate's top edge than to either side.
  --pad: theme("padding.4");
  --p-x: var(--vc-widget-padding-x, var(--pad));
  --p-t: var(--vc-widget-padding-top, var(--pad));
  --p-b: var(--vc-widget-padding-bottom, var(--pad));
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
      // The widget reaches past the container's inset on a narrow screen. Keyed to a token
      // because the amount is only right against the inset it was chosen for: a theme with a
      // narrower page gutter has to be able to stop the widget going off the screen. The
      // default is the value this rule has always had.
      margin-inline: var(--vc-widget-container-margin-x, -1.125rem);
    }

    #{$self} & {
      @apply mx-0;
    }
  }

  &--collapsible {
    $collapsible: &;
  }

  // Chromeless: the shell around it already drew the plate. Expressed entirely through this
  // block's own tokens rather than by re-declaring the paint, so it cannot fall out of step with
  // the base rule and so a theme that overrides `--vc-widget-*` from outside still loses here —
  // which is the point, since the plate it would be painting is not this widget's to draw.
  //
  // The rows go with it: a nested widget's list has to stand on the same vertical as its own
  // heading, and `--vc-menu-item-padding-x` is the kit's public name for that inset. The hover
  // plate still spans the full width of the shell, which is what the account sidebar does too.
  //
  // Compounded with the block's own class on purpose. The size rules below set `--p-x` as well, at
  // one class each, and they are written after this one — so at equal specificity they won, and a
  // nested widget at the DEFAULT `md` kept a 24px inset while its rows had already given theirs up:
  // exactly the misalignment the variant exists to remove. Measured on the running page before this
  // line: `--p-x` came back 1.5rem at md and 1.75rem at lg, 0px only at sm and xs.
  &--nested#{$self} {
    --bg-color: transparent;
    --border-color: transparent;
    --divide-color: transparent;
    --shadow: none;
    --radius: 0;
    --p-x: 0px;
    --vc-menu-item-padding-x: 0px;
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
        --pad: theme("padding.6");
      }
    }

    &--lg {
      --header-min-h: 4.375rem;
      --header-gap: theme("gap[2.5]");
      --title-text: theme("fontSize.xl");
      --icon-size: 1.25rem;
      --shape-size: 2.5rem;

      @media (min-width: theme("screens.lg")) {
        --pad: theme("padding.7");
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
    @apply font-geologica flex flex-col justify-center min-w-0 grow text-[length:--title-text] break-words;

    // The same knob the typography block's headings read: a widget's title is one of them, set in
    // the same face, and a theme that lightens its headings has to reach this one too or the page
    // carries two weights. The kit's own weight stays the fallback.
    font-weight: var(--vc-typography-heading-font-weight, 700);

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

  // The block head's mark. The four numbers live here and nowhere else, so a theme retunes every
  // marked widget in the app from one place instead of per call site.
  &__prepend-shape {
    --vc-shape-size: var(--vc-widget-icon-shape-size, 2.25rem);
    // The kit sizes a shape's glyph at half its disc, which on 36 is 18 and leaves the mark reading
    // smaller than the title beside it.
    --vc-shape-icon-size: var(--vc-widget-icon-shape-icon-size, 1.25rem);
    --vc-shape-bg-color: var(--vc-widget-icon-shape-bg-color, theme("colors.secondary.400"));
    --vc-icon-stroke: var(--vc-widget-icon-shape-icon-stroke, 1.6);
  }

  &--icon-shape {
    // A marked head draws no rule under it: the disc already says where the block starts, and the
    // rule under it made a second, weaker edge a few pixels below the first.
    @apply divide-none;

    // The widget's OWN head, through a direct child: a marked block can hold plain widgets of its
    // own — the configuration block holds one per section — and a descendant selector set those at
    // the outer head's leading.
    > #{$self}__header-container #{$self}__title {
      // The title is led to the disc's own height, so the head is one row however a theme resizes
      // the mark. It used to be set in caps here as well; the design took the caps off every
      // section head (Ilya, 24.09.2026), which also gives the display face its own tracking back.
      line-height: var(--vc-widget-icon-shape-size, 2.25rem);
    }
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
