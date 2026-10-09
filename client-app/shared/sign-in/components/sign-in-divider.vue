<template>
  <div class="sign-in-divider">
    <slot />
  </div>
</template>

<style lang="scss">
.sign-in-divider {
  @apply relative flex flex-col items-center uppercase;

  @media (width > theme("screens.sm")) {
    @apply flex-row;
  }

  &::before,
  &::after {
    @apply content-[''] absolute h-px w-[calc(50%-2rem)] top-1/2 bg-neutral-300;

    @media (width > theme("screens.sm")) {
      @apply h-[calc(50%-2rem)] w-px;
    }
  }

  &::before {
    @apply left-0;

    @media (width > theme("screens.sm")) {
      @apply top-2 left-1/2;
    }
  }

  &::after {
    @apply right-0;

    @media (width > theme("screens.sm")) {
      @apply top-auto bottom-2 left-1/2;
    }
  }
}
</style>
