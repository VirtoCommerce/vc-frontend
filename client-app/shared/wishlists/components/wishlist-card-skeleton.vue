<template>
  <div class="wishlist-card-skeleton">
    <div class="wishlist-card-skeleton__title-row">
      <div class="wishlist-card-skeleton__title">&nbsp;</div>

      <div class="wishlist-card-skeleton__badge">&nbsp;</div>
    </div>

    <div class="wishlist-card-skeleton__description">&nbsp;</div>

    <div class="wishlist-card-skeleton__meta-row">
      <div class="wishlist-card-skeleton__date">&nbsp;</div>

      <div class="wishlist-card-skeleton__status">&nbsp;</div>
    </div>

    <div class="wishlist-card-skeleton__dropdown">&nbsp;</div>
  </div>
</template>

<style lang="scss">
.wishlist-card-skeleton {
  @apply relative rounded-[--vc-radius] bg-additional-50 p-4 text-sm shadow-md;

  @container (min-width: theme("containers.xl")) {
    @apply grid items-center gap-x-6 px-5;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
  }

  &__title-row {
    @apply flex items-center gap-2 pe-10;

    @container (min-width: theme("containers.xl")) {
      @apply min-w-0 pe-0;
    }
  }

  &__title {
    @apply h-6 w-40 max-w-[60%] bg-neutral-100 text-base;
  }

  &__badge {
    @apply h-5 w-8 shrink-0 rounded-full bg-neutral-100;
  }

  &__description {
    @apply hidden h-5 bg-neutral-100;

    @container (min-width: theme("containers.xl")) {
      @apply block;
    }
  }

  &__meta-row {
    @apply flex items-center pt-4;

    @container (min-width: theme("containers.xl")) {
      @apply contents pt-0;
    }
  }

  &__date {
    @apply h-5 w-24 bg-neutral-100;
  }

  &__status {
    @apply ms-auto h-5 w-20 bg-neutral-100;

    @container (min-width: theme("containers.xl")) {
      @apply ms-0;
    }
  }

  &__dropdown {
    @apply absolute right-4 top-4 size-8 bg-neutral-100;

    @container (min-width: theme("containers.xl")) {
      @apply static;
    }
  }
}
</style>
