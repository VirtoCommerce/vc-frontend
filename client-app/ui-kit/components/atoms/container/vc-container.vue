<template>
  <div class="vc-container">
    <div class="vc-container__wrapper">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.vc-container {
  @apply grow bg-neutral-50 p-6 md:pb-9 lg:px-8 2xl:px-12;

  &__wrapper {
    @apply mx-auto max-w-[87.75rem];
  }
}
</style>
