<template>
  <div class="wishlist-card-skeleton">
    <div class="wishlist-card-skeleton__title-row">
      <div class="wishlist-card-skeleton__title">&nbsp;</div>

      <div class="wishlist-card-skeleton__badge">&nbsp;</div>
    </div>

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

  @media (min-width: theme("screens.md")) {
    @apply flex items-center gap-6 px-5;
  }

  &__title-row {
    @apply flex items-center gap-2 pe-10;

    @media (min-width: theme("screens.md")) {
      @apply contents;
    }
  }

  &__title {
    @apply h-6 w-40 max-w-[60%] bg-neutral-100 text-base;
  }

  &__badge {
    @apply h-5 w-8 rounded-full bg-neutral-100;

    @media (min-width: theme("screens.md")) {
      @apply -ms-4 me-auto;
    }
  }

  &__meta-row {
    @apply flex items-center pt-4;

    @media (min-width: theme("screens.md")) {
      @apply contents pt-0;
    }
  }

  &__date {
    @apply h-5 w-24 bg-neutral-100;
  }

  &__status {
    @apply ms-auto h-5 w-20 bg-neutral-100;

    @media (min-width: theme("screens.md")) {
      @apply ms-0;
    }
  }

  &__dropdown {
    @apply absolute right-4 top-4 size-8 bg-neutral-100;

    @media (min-width: theme("screens.md")) {
      @apply static;
    }
  }
}
</style>
