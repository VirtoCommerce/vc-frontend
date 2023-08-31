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

  @apply inline-block rounded-full font-bold text-center;

  @media screen {
    @apply border;
  }

  &--size {
    &--xs {
      @apply text-xxs;

      @media screen {
        @apply px-1;
      }
    }

    &--sm {
      @apply text-xs;

      @media screen {
        @apply py-0.5 px-2;
      }
    }

    &--md {
      @apply text-sm;

      @media screen {
        @apply py-[3px] px-3;
      }
    }
  }

  &--truncate {
    @apply truncate max-w-full;
  }

  @media screen {
    @each $color in $colors {
      &--solid--#{$color} {
        @media screen {
          @apply bg-[color:var(--color-#{$color}-500)]
          border-[color:var(--color-#{$color}-500)];
        }
        @apply text-[color:var(--color-additional-50)];
      }

      &--solid-light--#{$color} {
        @media screen {
          @apply bg-[color:var(--color-#{$color}-50)]
          border-[color:var(--color-#{$color}-50)];
        }
        @apply text-[color:var(--color-#{$color}-800)];
      }

      &--outline--#{$color} {
        @media screen {
          @apply bg-[color:var(--color-additional-50)]
          border-[color:var(--color-#{$color}-500)];
        }
        @apply text-[color:var(--color-#{$color}-800)];
      }

      &--outline-dark--#{$color} {
        @media screen {
          @apply bg-[color:var(--color-#{$color}-50)]
          border-[color:var(--color-#{$color}-500)];
        }
        @apply text-[color:var(--color-#{$color}-800)];
      }
    }
  }
}
</style>
