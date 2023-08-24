<template>
  <span
    :class="[
      'vc-badge',
      `vc-badge--size--${size}`,
      `vc-badge--${variant}--${color}`,
      { 'vc-badge--truncate': truncate },
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
interface IProps {
  color?: VcBadgeColorType;
  size?: "xs" | "sm" | "md";
  variant?: VcBadgeVariantType;
  truncate?: boolean;
}

withDefaults(defineProps<IProps>(), {
  color: "primary",
  size: "md",
  variant: "solid",
});
</script>

<style scoped lang="scss">
.vc-badge {
  $colors: primary, secondary, neutral, info, success, warning, danger;

  @apply inline-block border rounded-full font-bold text-center;

  &--size {
    &--xs {
      @apply px-1 text-xxs;
    }

    &--sm {
      @apply py-0.5 px-2 text-xs;
    }

    &--md {
      @apply py-[3px] px-3 text-sm;
    }
  }

  &--truncate {
    @apply truncate;
  }

  @each $color in $colors {
    &--solid--#{$color} {
      @apply bg-[color:var(--color-#{$color}-500)]
      border-[color:var(--color-#{$color}-500)]
      text-[color:var(--color-additional-50)];
    }

    &--solid-light--#{$color} {
      @apply bg-[color:var(--color-#{$color}-50)]
      border-[color:var(--color-#{$color}-50)]
      text-[color:var(--color-#{$color}-800)];
    }

    &--outline--#{$color} {
      @apply bg-[color:var(--color-additional-50)]
      border-[color:var(--color-#{$color}-500)]
      text-[color:var(--color-#{$color}-800)];
    }

    &--outline-dark--#{$color} {
      @apply bg-[color:var(--color-#{$color}-50)]
      border-[color:var(--color-#{$color}-500)]
      text-[color:var(--color-#{$color}-800)];
    }
  }
}
</style>
