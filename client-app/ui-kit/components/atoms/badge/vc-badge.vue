<template>
  <span
    :class="[
      'vc-badge',
      `vc-badge--size--${size}${$slots.default ? '' : '--dot'}`,
      `vc-badge--${variant}--${color}`,
      {
        'vc-badge--rounded': rounded,
        'vc-badge--truncate': truncate,
        'vc-badge--nowrap': nowrap,
      },
    ]"
  >
    <span v-if="$slots.default" class="vc-badge__content">
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
interface IProps {
  color?: VcBadgeColorType;
  size?: "sm" | "md" | "lg";
  variant?: VcBadgeVariantType;
  rounded?: boolean;
  truncate?: boolean;
  nowrap?: boolean;
}

withDefaults(defineProps<IProps>(), {
  color: "primary",
  size: "md",
  variant: "solid",
});
</script>

<style lang="scss">
.vc-badge {
  $colors: primary, secondary, neutral, info, success, warning, danger;

  $truncate: "";

  @apply flex-none inline-flex align-top border rounded-sm font-bold text-center;

  &--size {
    &--sm {
      --vc-icon-size: 0.625rem;

      @apply min-w-[1rem] gap-1 px-0.5 text-xxs/[1.375];

      &--dot {
        @apply w-1.5 h-1.5;
      }
    }

    &--md {
      --vc-icon-size: 0.75rem;

      @apply min-w-[1.125rem] gap-1 px-1 text-xs/[1.35];

      &--dot {
        @apply w-2 h-2;
      }
    }

    &--lg {
      --vc-icon-size: 0.875rem;

      @apply min-w-[1.375rem] gap-1 px-1.5 text-sm;

      &--dot {
        @apply w-2.5 h-2.5;
      }
    }
  }

  &--rounded {
    @apply rounded-full;
  }

  &--truncate {
    $truncate: &;
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
      text-[color:var(--color-#{$color}-700)];
    }

    &--outline--#{$color} {
      @apply bg-[color:var(--color-additional-50)]
      border-[color:var(--color-#{$color}-500)]
      text-[color:var(--color-#{$color}-700)];
    }

    &--outline-dark--#{$color} {
      @apply bg-[color:var(--color-#{$color}-50)]
      border-[color:var(--color-#{$color}-500)]
      text-[color:var(--color-#{$color}-700)];
    }
  }

  &__content {
    @apply grow;

    &:has(.vc-icon):has(:not(.vc-icon)) {
      @apply inline-flex items-center gap-[inherit];
    }

    #{$truncate} & {
      @apply truncate;
    }

    & > * {
      @apply text-left;

      #{$truncate} & {
        @apply truncate;
      }

      &:not(.vc-icon) {
        @apply px-0.5;
      }
    }
  }
}
</style>
