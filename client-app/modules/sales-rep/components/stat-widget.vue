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

    <VcLoaderOverlay v-if="loading" />
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
  // Shows a spinner overlay over the card while the statistics query is in flight.
  loading?: boolean;
}

// accent/deltaTone need defaults (they build CSS class names); other optional props are fine as undefined.
withDefaults(defineProps<IProps>(), {
  accent: "neutral",
  deltaTone: "positive",
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.stat-widget {
  $accents: (
    primary: var(--color-primary-500),
    secondary: var(--color-secondary-500),
    success: var(--color-success-500),
    warning: var(--color-warning-500),
    info: var(--color-info-500),
    neutral: var(--color-neutral-400),
  );

  // `relative` anchors the loader overlay; `overflow-hidden` clips its backdrop to the rounded corners.
  @apply relative flex h-full flex-col gap-1.5 overflow-hidden rounded-[--vc-radius] border border-neutral-200 bg-additional-50 p-4 shadow-sm;

  // Logical property so the accent bar flips in RTL; one custom property feeds both bar and icon.
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
