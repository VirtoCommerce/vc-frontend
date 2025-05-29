<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
.badges-wrapper {
  --decorative-corner-radius: theme("borderRadius.sm");
  --decorative-size: calc(var(--decorative-corner-radius) * 2);
  --padding: theme("spacing.1");

  @apply absolute -left-px -top-px flex items-center gap-1 z-[1] bg-additional-50 max-w-full rounded-br-[var(--decorative-size)] pb-[var(--padding)] pr-[var(--padding)] pl-px pt-px;

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
