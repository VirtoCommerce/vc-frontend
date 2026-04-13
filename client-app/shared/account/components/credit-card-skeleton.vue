<template>
  <div class="credit-card-skeleton">
    <div class="credit-card-skeleton__number">
      <div class="credit-card-skeleton__placeholder credit-card-skeleton__placeholder--wide">&nbsp;</div>
    </div>

    <div class="credit-card-skeleton__expire">
      <div class="credit-card-skeleton__placeholder credit-card-skeleton__placeholder--medium">&nbsp;</div>
    </div>

    <div class="credit-card-skeleton__action">
      <div class="credit-card-skeleton__placeholder credit-card-skeleton__placeholder--small">&nbsp;</div>
    </div>
  </div>
</template>

<style lang="scss">
.credit-card-skeleton {
  @apply flex flex-col border-y bg-additional-50 pb-4 pt-4.5 shadow-sm md:flex-row md:items-center md:rounded md:border-x md:py-0;

  &__number {
    @apply grow px-6 text-lg md:py-5 md:text-base;
  }

  &__expire {
    @apply mt-1.5 shrink-0 px-6 text-sm md:mt-0 md:text-base;
  }

  &__action {
    @apply hidden shrink-0 px-6 md:flex;
  }

  &__placeholder {
    @apply bg-neutral-100;

    &--wide {
      @apply w-8/12;
    }

    &--medium {
      @apply w-32;
    }

    &--small {
      @apply h-7 w-16;
    }
  }
}
</style>
