<template>
  <div
    :class="[
      'vc-product-actions',
      `vc-product-actions--direction--${direction}`,
      {
        'vc-product-actions--background': withBackground,
      },
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  direction?: "horizontal" | "vertical";
  withBackground?: boolean;
}

withDefaults(defineProps<IProps>(), {
  direction: "horizontal",
});
</script>

<style lang="scss">
.vc-product-actions {
  @apply flex gap-2 w-fit empty:hidden;

  &--direction {
    &--horizontal {
      --vc-icon-size: 1.25rem;

      @container (min-width: theme("containers.xl")) {
        --vc-icon-size: 1rem;
      }
    }

    &--vertical {
      --vc-icon-size: 1.25rem;

      @apply flex-col;
    }
  }

  &--background {
    @apply bg-additional-50 rounded-3xl p-2;
  }

  .vc-icon {
    @apply block;
  }
}
</style>
