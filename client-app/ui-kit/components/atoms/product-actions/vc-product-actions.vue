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
  $self: &;

  @apply flex w-fit empty:hidden;

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
    @apply bg-additional-50 rounded-full p-1;
  }

  .vc-icon {
    @apply block;
  }

  @at-root .vc-product-card {
    &--view-mode {
      &--grid #{$self} {
        @apply absolute -top-4 -right-[1.1rem];
      }

      &--list #{$self} {
        grid-area: actions;

        @apply mt-2.5;

        @container (min-width: theme("containers.xl")) {
          @apply mt-0;
        }
      }

      &--item #{$self} {
        @apply hidden;
      }
    }
  }
}
</style>
