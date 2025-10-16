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
  size?: VcBadgeSizeType;
  variant?: VcBadgeVariantType;
  rounded?: boolean;
  truncate?: boolean;
  nowrap?: boolean;
  square?: boolean;
  maxWidth?: string;
}

withDefaults(defineProps<IProps>(), {
  color: "primary",
  size: "md",
  variant: "solid",
});
</script>

<style lang="scss">
.vc-badge {
  $colors: primary, secondary, neutral, info, success, warning, danger, accent;

  $truncate: "";
  $square: "";

  --props-max-width: v-bind(maxWidth);
  --max-width: var(--props-max-width, var(--vc-badge-max-width, 100%));
  --radius: var(--vc-badge-radius, var(--vc-radius, 0.5rem));

  @apply flex-none inline-flex align-top min-h-[--size] min-w-[--size] max-w-[--max-width] border rounded-[--radius] font-bold bg-[--bg-color] border-[--border-color] text-[--text-color];

  &--size {
    &--xs {
      --size: 1rem;
      --vc-icon-size: 0.625rem;

      @apply gap-1 px-0.5 text-xxs;

      &--dot {
        @apply size-1.5;
      }
    }

    &--sm {
      --size: 1.125rem;
      --vc-icon-size: 0.75rem;

      @apply gap-1.5 px-0.5 text-xs/[1.2];

      &--dot {
        @apply size-2;
      }
    }

    &--md {
      --size: 1.375rem;
      --vc-icon-size: 0.875rem;

      @apply gap-1.5 px-1 text-sm/[1.2];

      &--dot {
        @apply size-2.5;
      }
    }

    &--lg {
      --size: 1.625rem;
      --vc-icon-size: 1rem;

      @apply gap-1.5 px-1 text-base/[1.25];

      &--dot {
        @apply size-3;
      }
    }
  }

  &--rounded {
    @apply rounded-full;
  }

  &--nowrap {
    @apply whitespace-nowrap;
  }

  &--truncate {
    $truncate: &;
  }

  &--square {
    $square: &;

    @apply p-0;
  }

  @each $color in $colors {
    &--solid--#{$color} {
      --bg-color: var(--color-#{$color}-500);
      --border-color: var(--color-#{$color}-500);

      &:not([class*="--warning"]) {
        --text-color: var(--color-additional-50);
      }

      &[class*="--warning"] {
        --text-color: var(--color-neutral-900);
      }
    }

    &--solid-light--#{$color} {
      --bg-color: var(--color-#{$color}-100);
      --border-color: var(--color-#{$color}-100);
      --text-color: var(--color-#{$color}-800);
      --vc-icon-color: var(--color-#{$color}-700);
    }

    &--outline--#{$color} {
      --bg-color: var(--color-additional-50);
      --border-color: var(--color-#{$color}-500);
      --vc-icon-color: var(--color-#{$color}-700);

      &:not([class*="--warning"]) {
        --text-color: var(--color-#{$color}-500);
      }

      &[class*="--warning"] {
        --text-color: var(--color-warning-700);
      }
    }

    &--outline-dark--#{$color} {
      --bg-color: var(--color-#{$color}-100);
      --border-color: var(--color-#{$color}-500);
      --text-color: var(--color-#{$color}-800);
      --vc-icon-color: var(--color-#{$color}-700);
    }
  }

  &__content {
    @apply grow gap-[inherit] text-center self-center [word-break:break-word];

    &:has(.vc-icon) {
      @apply flex items-center;
    }

    &:not(:has(.vc-icon:first-child)) {
      @apply ps-0.5;
    }

    &:not(:has(.vc-icon:last-child)) {
      @apply pe-0.5;
    }

    #{$truncate} &,
    #{$truncate} & * {
      @apply truncate;
    }

    #{$square} & {
      @apply justify-center;
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
