<template>
  <div class="vc-product-properties">
    <slot />
  </div>
</template>

<style lang="scss">
.vc-product-properties {
  $self: &;

  @at-root .vc-product-card {
    #{$self} {
      grid-area: properties;
    }

    &--view-mode {
      &--grid #{$self} {
        --vc-property-font-size: theme("fontSize.sm");

        @apply order-4 mt-3;

        @container (min-width: theme("containers.xxs")) {
          --vc-property-font-size: theme("fontSize.xs");
        }
      }

      &--list {
        #{$self} {
          @apply hidden;

          @container (min-width: theme("containers.3xl")) {
            @apply block mt-0 ms-3 w-[9.75rem];
          }

          @container (min-width: theme("containers.5xl")) {
            @apply w-60;
          }
        }
      }

      &--item {
        #{$self} {
          @apply mt-1;

          @container (min-width: theme("containers.2xl")) {
            @apply mt-0 ms-3 w-[8.75rem];
          }

          @container (min-width: theme("containers.3xl")) {
            @apply w-[9.75rem];
          }

          @container (min-width: theme("containers.4xl")) {
            @apply w-60;
          }
        }
      }
    }
  }
}
</style>
