<template>
  <router-link
    v-slot="{ isActive, href, navigate }"
    :to="link.route ?? ''"
    custom
    :tabindex="link.route ? 0 : undefined"
  >
    <component
      :is="link.route ? 'a' : 'button'"
      v-bind="$attrs"
      :href="href"
      :class="['bottom-header-link', { 'bottom-header-link--active': isActive && link.route }]"
      @click="(e: MouseEvent) => (link.route ? navigate(e) : undefined)"
    >
      <span class="bottom-header-link__mark">
        <slot name="icon">
          <VcIcon v-if="link.icon" :name="link.icon" :size="24" class="bottom-header-link__icon" />
        </slot>

        <transition mode="out-in" name="scale">
          <VcBadge v-if="count" class="bottom-header-link__badge" rounded nowrap size="sm" max-width="none">
            {{ $n(count, { style: "decimal", notation: "compact" }) }}
          </VcBadge>
        </transition>
      </span>

      <span class="bottom-header-link__label">
        <slot />
      </span>
    </component>
  </router-link>
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  link: ExtendedMenuLinkType;
  count?: number;
}

defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<IProps>(), {
  count: 0,
});
</script>

<style lang="scss">
.bottom-header-link {
  // What the pinned header collapses, declared here because it belongs to this block and set
  // from the plate as plain custom properties — the plate cannot reach into this file's
  // elements, and this file cannot know it is inside a plate. Every default is the resting
  // value, so the link renders as before wherever nothing sets them.
  --pad-x: var(--header-link-pad-x, theme("padding.3"));
  --label-max-h: var(--header-link-label-max-h, 1rem);
  --label-max-w: var(--header-link-label-max-w, 8rem);
  --label-opacity: var(--header-link-label-opacity, 1);
  // `inherit` is the resting value on purpose: the size is the row's own text-xs, read off the
  // parent rather than restated here, so the two cannot drift.
  --label-font-size: var(--header-link-label-font-size, inherit);

  @apply flex flex-col items-center gap-0.5 text-xs tracking-wide;

  padding-inline: var(--pad-x);
  color: var(--header-bottom-link-color);
  // The row settles as one: the item's own inset rides the same curve and the same time as the
  // height it is collapsing with, or it snaps a frame apart from it.
  transition: padding-inline var(--stick-ease, 0.25s cubic-bezier(0.4, 0, 0.2, 1));

  &:hover {
    color: var(--header-bottom-link-hover-color);
  }

  &--active {
    color: var(--header-bottom-link-active-color);
  }

  &__mark {
    @apply relative;
  }

  &__icon {
    @apply mb-0.5 text-secondary-600;
  }

  &__badge {
    @apply absolute -right-3 -top-2 transition-transform;
  }

  &__label {
    // The label SHRINKS away, it is not cut away: the type itself rides the curve, so the item
    // narrows from the first frame and no glyph is ever half a letter. The two maxima stay as
    // the bound — they guard a translation wider than 8rem and close the item at the end — but
    // with the type shrinking they no longer reach the text: it is always the narrower of the
    // two. Left to them alone the label held its full size for the first half of the curve and
    // was then guillotined from the right in the last 100ms, which is what read as a snap.
    @apply block overflow-hidden;

    // A ratio, not the xs pair's 0.875rem: an absolute leading keeps the line box open at its
    // resting height while the type inside it shrinks, and the box clips the glyphs instead.
    // 7/6 is that same pair, 14 over 12, so the label is unchanged at rest.
    line-height: 1.16667;

    max-height: var(--label-max-h);
    max-width: var(--label-max-w);
    font-size: var(--label-font-size);
    opacity: var(--label-opacity);
    // One curve for all four, or the label fades out before it has finished shrinking and the
    // last frames are a snap again: the fade used to land at 150ms against the geometry's 250.
    transition:
      max-height var(--stick-ease, 0.25s cubic-bezier(0.4, 0, 0.2, 1)),
      max-width var(--stick-ease, 0.25s cubic-bezier(0.4, 0, 0.2, 1)),
      font-size var(--stick-ease, 0.25s cubic-bezier(0.4, 0, 0.2, 1)),
      opacity var(--stick-ease, 0.25s cubic-bezier(0.4, 0, 0.2, 1));
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &__label {
      transition: none;
    }
  }
}
</style>
