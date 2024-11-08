<template>
  <div class="vc-product-vendor">
    <slot />
  </div>
</template>

<style lang="scss">
.vc-product-vendor {
  @apply text-xs font-bold empty:hidden;

  @at-root .vc-product-card & {
    grid-area: vendor;

    @apply mt-1 self-start;
  }
}
</style>
