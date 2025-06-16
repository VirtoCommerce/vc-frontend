<template>
  <div :class="['vc-carousel-pagination', `vc-carousel-pagination--size--${size}`]"></div>
</template>

<script setup lang="ts">
interface IProps {
  size?: "xs" | "sm" | "md";
}

withDefaults(defineProps<IProps>(), {
  size: "md",
});
</script>

<style lang="scss">
@reference "tailwindcss";

.vc-carousel-pagination {
  --swiper-pagination-color: var(--color-primary-500);
  --swiper-pagination-bullet-inactive-opacity: 1;
  --swiper-pagination-bullet-inactive-color: var(--color-additional-50);

  @apply flex justify-center flex-wrap gap-y-1;

  &--size {
    &--xs {
      --swiper-pagination-bullet-size: 0.5rem;
      --swiper-pagination-bullet-horizontal-gap: 0.25rem;
      --outline-width: 1px;
    }

    &--sm {
      --swiper-pagination-bullet-size: 0.75rem;
      --outline-width: 2px;
    }
  }

  & > * {
    @apply outline outline-[length:--outline-width] -outline-offset-[--outline-width] outline-[--swiper-pagination-color];

    &[class*="-active"] {
      @apply shadow-[0_0_0_var(--outline-width)_var(--color-additional-50)];
    }
  }
}
</style>
