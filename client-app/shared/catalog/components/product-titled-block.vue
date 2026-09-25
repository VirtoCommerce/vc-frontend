<template>
  <div class="product-titled-block">
    <div class="product-titled-block__header">
      <VcShape :icon="icon" class="product-titled-block__shape" mask="circle" />

      <h2 class="product-titled-block__title">{{ title }}</h2>

      <slot name="after" />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  icon: string;
  title: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.product-titled-block {
  @apply space-y-4;

  &__header {
    // 10 to the disc, the gap a marked widget head already keeps.
    @apply flex items-center gap-2.5;
  }

  &__shape {
    // The design's mark for a block: a 36px disc in the warm mid step, its glyph drawn a touch
    // finer than the kit's default so it does not fill the disc. The kit's own default is a 40px
    // hexagon in secondary-500 — a different shape, a size up and a rung darker.
    --vc-shape-size: 2.25rem;
    // 20 in a 36 disc, the design's pair. The kit sizes a shape's glyph at half the disc, which
    // on 36 is 18 and leaves the mark reading smaller than the ones beside it.
    --vc-shape-icon-size: 1.25rem;
    --vc-shape-bg-color: theme("colors.secondary.400");
    --vc-icon-stroke: 1.6;
  }

  &__title {
    // The same head a marked widget draws, because the two render the SAME section: `description`
    // picks this block when the body collapses and a VcWidget when it does not. So: the display
    // face at its own tracking, the shared heading weight, and the disc's height for a leading so
    // the row stays one line. The caps came off with every other section head (Ilya, 24.09.2026).
    @apply grow break-words font-geologica text-xl/[2.25rem] text-neutral-950;

    font-weight: var(--vc-typography-heading-font-weight, 700);
    letter-spacing: -0.02em;
  }
}
</style>
