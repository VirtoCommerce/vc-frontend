<template>
  <div class="vc-container">
    <div class="vc-container__wrapper">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.vc-container {
  @apply grow pt-6 pb-8 bg-[color:var(--color-body-bg)];

  &__wrapper {
    @apply mx-auto max-w-screen-2xl lg:px-5 2xl:px-18;
  }
}
</style>
