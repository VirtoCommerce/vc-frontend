<template>
  <div class="mission-card-skeleton" aria-hidden="true">
    <div class="mission-card-skeleton__banner"></div>

    <div class="mission-card-skeleton__body">
      <div class="mission-card-skeleton__note">&nbsp;</div>

      <div class="mission-card-skeleton__progress">
        <div class="mission-card-skeleton__track"></div>

        <div class="mission-card-skeleton__percent">&nbsp;</div>
      </div>

      <div class="mission-card-skeleton__title">&nbsp;</div>

      <div class="mission-card-skeleton__footer">
        <div class="mission-card-skeleton__date">&nbsp;</div>

        <div class="mission-card-skeleton__button"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.mission-card-skeleton {
  @apply flex animate-pulse flex-col overflow-hidden rounded-[--vc-radius] border border-neutral-200 bg-additional-50 shadow-md;

  &__banner {
    @apply h-52 shrink-0 bg-neutral-100;
  }

  &__body {
    @apply flex flex-1 flex-col p-4;
  }

  &__note {
    @apply mb-2 w-28 rounded-[--vc-radius] bg-neutral-100 text-sm;
  }

  &__progress {
    @apply mb-3.5 flex items-center gap-2.5;
  }

  &__track {
    @apply h-2 flex-1 rounded-full bg-neutral-100;
  }

  &__percent {
    @apply w-10 rounded-[--vc-radius] bg-neutral-100 text-sm;
  }

  &__title {
    @apply mb-4 w-3/4 rounded-[--vc-radius] bg-neutral-100 text-base;
  }

  &__footer {
    @apply mt-auto flex items-center justify-between border-t border-neutral-200 pt-3.5;
  }

  &__date {
    @apply w-24 rounded-[--vc-radius] bg-neutral-100 text-sm;
  }

  &__button {
    @apply size-[2.375rem] rounded-[--vc-radius] bg-neutral-100;
  }
}
</style>
