<template>
  <div class="card-labels">
    <VcImage class="card-labels__item" src="visa.svg" alt="" />
    <VcImage class="card-labels__item" src="maestro.svg" alt="" />
    <VcImage class="card-labels__item" src="mastercard.svg" alt="" />
  </div>
</template>

<style lang="scss">
.card-labels {
  @apply flex items-start gap-3 pt-0.5 xl:ml-6 xl:w-1/3 xl:gap-4;

  &__item {
    @apply w-14 flex shrink-0 rounded border border-neutral-200;
  }
}
</style>
