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
        'vc-badge--dot': !$slots.default,
        'vc-badge--square': square,
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
  square?: boolean;
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
  $square: "";

  --size: 1.125rem;
  --vc-icon-size: 0.75rem;

  @apply flex-none inline-flex align-top gap-1 border rounded-sm font-bold min-h-[var(--size)] min-w-[var(--size)];

  &--size {
    &--sm {
      @apply px-0.5 text-xxs/[1.375];

      &--dot {
        @apply w-1.5 h-1.5;
      }
    }

    &--md {
      --vc-icon-size: 0.875rem;
      --size: 1.375rem;

      @apply px-1 text-xs/[1.35];

      &--dot {
        @apply w-2 h-2;
      }
    }

    &--lg {
      --vc-icon-size: 1rem;
      --size: 1.625rem;

      @apply px-1.5 text-base/[1.375];

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

  &--dot {
    @apply min-h-0;
  }

  &--square {
    $square: &;

    @apply min-w-[var(--size)] px-0;
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
    @apply grow text-center self-center;

    #{$square} & {
      @apply justify-center;
    }

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
    }
  }
}
</style>
