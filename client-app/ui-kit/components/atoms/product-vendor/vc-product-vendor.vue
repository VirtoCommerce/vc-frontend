<template>
  <div class="vc-product-vendor">
    <slot />
  </div>
</template>

<style lang="scss">
.vc-product-vendor {
  $self: &;

  @apply text-xs font-bold;

  @at-root .vc-product-card {
    &--view-mode {
      &--grid #{$self} {
        @apply order-3 mt-1 min-h-3.5;
      }

      &--list #{$self},
      &--item #{$self} {
        grid-area: vendor;

        @apply mt-1 self-start;
      }
    }
  }
}
</style>
