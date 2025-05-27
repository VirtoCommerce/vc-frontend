<template>
  <div class="badges-wrapper" :class="`badges-wrapper--${size}`">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  size?: "sm" | "md" | "lg";
}

withDefaults(defineProps<IProps>(), {
  size: "lg",
});
</script>

<style lang="scss">
.badges-wrapper {
  @apply absolute -left-px -top-px flex items-center gap-1 z-[1] bg-additional-50 flex-wrap max-w-full rounded-br-[var(--decorative-size)];

  --corner-radius: v-bind(size === "lg" ? "4px": "2px");
  --decorative-size: calc(var(--corner-radius) * 2);

  &--lg:not(:empty) {
    @apply pb-[7px] pr-[7px];

    .vc-badge {
      @apply min-h-[1.625rem];
    }
  }

  &--md:not(:empty) {
    @apply pb-[3px] pr-[3px];

    .vc-badge {
      @apply min-h-[1.375rem];
    }
  }

  &--sm:not(:empty) {
    @apply pb-0.5 pr-0.5;

    .vc-badge {
      @apply min-h-4;
    }
  }

  &:not(:empty) {
    @apply pl-px pt-px;

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
}
</style>
