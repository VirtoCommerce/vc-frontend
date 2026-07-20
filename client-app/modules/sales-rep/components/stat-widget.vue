<template>
  <div class="stat-widget" :class="`stat-widget--${accent}`">
    <div class="stat-widget__head">
      <VcIcon class="stat-widget__icon" :name="icon" :size="15" />

      <span class="stat-widget__label">{{ label }}</span>
    </div>

    <div class="stat-widget__value">{{ value }}</div>

    <div v-if="sub" class="stat-widget__sub">{{ sub }}</div>

    <div v-if="delta" class="stat-widget__delta" :class="`stat-widget__delta--${deltaTone}`">
      <VcIcon v-if="deltaIcon" :name="deltaIcon" :size="14" />

      <span>{{ delta }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StatWidgetAccentType, StatWidgetToneType } from "../types/widgets";

interface IProps {
  // Already-localized label; keeping the component i18n-agnostic makes it reusable anywhere.
  label: string;
  value: string;
  icon: string;
  accent?: StatWidgetAccentType;
  sub?: string;
  delta?: string;
  deltaTone?: StatWidgetToneType;
  deltaIcon?: string;
}

// accent/deltaTone need defaults — they build CSS class names (`--${accent}`). The optional
// string props (sub/delta/deltaIcon) are only used in v-if/interpolation, so undefined is fine.
withDefaults(defineProps<IProps>(), {
  accent: "neutral",
  deltaTone: "positive",
});
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.stat-widget {
  $accents: (
    primary: var(--color-primary-500),
    secondary: var(--color-secondary-500),
    success: var(--color-success-500),
    warning: var(--color-warning-500),
    info: var(--color-info-500),
    neutral: var(--color-neutral-400),
  );

  @apply flex h-full flex-col gap-1.5 rounded-[--vc-radius] border border-neutral-200 bg-additional-50 p-4 shadow-sm;

  // Accent bar on the inline-start edge — logical property so it flips in RTL. A single custom
  // property feeds both the bar and the icon, collapsing six near-identical modifiers into a loop.
  border-inline-start: 4px solid var(--stat-widget-accent);

  @each $name, $color in $accents {
    &--#{$name} {
      --stat-widget-accent: #{$color};
    }
  }

  &__head {
    @apply flex items-center gap-2;
  }

  &__icon {
    color: var(--stat-widget-accent);
  }

  &__label {
    @apply text-xs font-bold uppercase tracking-wide text-neutral-500;
  }

  &__value {
    @apply text-3xl font-bold leading-tight text-neutral-900;
  }

  &__sub {
    @apply text-xs text-neutral-500;
  }

  &__delta {
    @apply mt-auto flex items-center gap-1 pt-1.5 text-sm font-bold;

    &--positive {
      @apply text-success-600;
    }

    &--negative {
      @apply text-danger-600;
    }

    &--neutral {
      @apply text-neutral-500;
    }
  }
}
</style>
