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
    // Collapsed by max-height and max-width rather than display, so the row sinks with the rest
    // of the header instead of jumping a frame early. The WIDTH matters as much as the height:
    // left at its own size a hidden label still holds the item open, the icons stand at uneven
    // steps and the search field gains nothing.
    @apply block overflow-hidden;

    max-height: var(--label-max-h);
    max-width: var(--label-max-w);
    opacity: var(--label-opacity);
    transition:
      max-height var(--stick-ease, 0.25s cubic-bezier(0.4, 0, 0.2, 1)),
      max-width var(--stick-ease, 0.25s cubic-bezier(0.4, 0, 0.2, 1)),
      opacity 0.15s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &__label {
      transition: none;
    }
  }
}
</style>
