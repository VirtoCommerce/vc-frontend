<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
.badges-wrapper {
  --corner-radius: 4px;
  --decorative-size: calc(var(--corner-radius) * 2);

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
      transparent var(--decorative-size),
      var(--color-additional-50) var(--decorative-size)
    );
  }

  &::after {
    @apply top-0 -right-[var(--decorative-size)];
  }

  &::before {
    @apply left-0 -bottom-[var(--decorative-size)];
  }
}
</style>
