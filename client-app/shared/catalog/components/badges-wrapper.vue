<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
.badges-wrapper {
  --corner-radius: 4px;

  @apply absolute -left-px -top-px flex items-center gap-2 rounded-br-lg bg-additional-50 z-[1];

  &:not(:empty) {
    @apply pb-1.5 pr-1.5 pl-px pt-px;
  }

  &::after,
  &::before {
    content: "";
    @apply absolute size-2;

    background-image: radial-gradient(
      circle at right bottom,
      transparent calc(var(--corner-radius) * 2),
      var(--color-additional-50) calc(var(--corner-radius) * 2)
    );
  }

  &::after {
    @apply -right-2 top-0;
  }

  &::before {
    @apply left-0 -bottom-2;
  }
}
</style>
