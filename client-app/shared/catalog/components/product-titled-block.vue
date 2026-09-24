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
    @apply flex items-center gap-2;
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
    // 20/36, read off the design's own DESCRIPTION heading. The size was already right; the leading
    // was not — 28 against 36, which is what made the row sit tight under its rule. The design steps
    // this to 32/38 above 1900, which is not followed here: the project's scale carries no such
    // screen, and a bare pixel breakpoint is out.
    @apply grow text-xl/[2.25rem] font-bold uppercase text-neutral-950;
  }
}
</style>
