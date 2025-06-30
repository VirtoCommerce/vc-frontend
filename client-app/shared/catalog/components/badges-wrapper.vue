<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
.badges-wrapper {
  --decorative-size: calc(theme("borderRadius.sm") * 2);

  @apply absolute -left-px -top-px flex items-center gap-1 z-[1] bg-additional-50 max-w-full rounded-br-[var(--decorative-size)] pb-1 pr-1 pl-px pt-px;

  &:empty {
    @apply hidden;
  }

  &::after,
  &::before {
    @apply content-[''] absolute size-[var(--decorative-size)];

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
