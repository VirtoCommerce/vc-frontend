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
    @apply grow text-xl font-bold uppercase text-neutral-950;
  }
}
</style>
