<template>
  <div class="stat-widget" :class="`stat-widget--${accent}`" :aria-busy="loading || undefined">
    <div class="stat-widget__head">
      <!-- Decorator slot ahead of the accent icon; the layout puts its drag affordance here. -->
      <slot name="leading" />

      <VcIcon class="stat-widget__icon" :name="icon" :size="15" />

      <span class="stat-widget__label">{{ label }}</span>
    </div>

    <!-- Figures only for a received response, so a pending or failed metric can't read as a genuine 0.
         Loading outranks the error so a retry shows the spinner, not the last failure (VCST-5586). -->
    <!-- aria-hidden: the dash is a visual placeholder; screen readers get aria-busy on the card instead. -->
    <div v-if="loading" class="stat-widget__value stat-widget__value--pending" aria-hidden="true">—</div>

    <!-- Native live region, so a failure replacing the figures is announced (Sonar S6819). -->
    <output v-else-if="errorText" class="stat-widget__error">
      <VcIcon name="exclamation-circle" :size="16" />

      <span>{{ errorText }}</span>
    </output>

    <template v-else>
      <div class="stat-widget__value">{{ value }}</div>

      <div v-if="sub" class="stat-widget__sub">{{ sub }}</div>

      <div v-if="delta" class="stat-widget__delta" :class="`stat-widget__delta--${deltaTone}`">
        <VcIcon v-if="deltaIcon" :name="deltaIcon" :size="14" />

        <span>{{ delta }}</span>
      </div>
    </template>

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
  // Already-localized (like `label`); its presence *is* the error state and outranks the figures.
  errorText?: string;
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

  // Two line boxes, wrapped or not, so every figure in the row starts at the same height — a one-line
  // caption used to pull its card's value 13px above its neighbours'. `lh` is the caption's own line
  // box, so the reserve tracks the type scale; `flex` centers a short caption on the icon's line.
  &__label {
    @apply flex min-h-[2lh] items-center text-xs font-bold uppercase tracking-wide text-neutral-500;
  }

  &__value {
    @apply text-3xl font-bold leading-tight text-neutral-900;

    // Muted so the placeholder doesn't read as a figure.
    &--pending {
      @apply text-neutral-300;
    }
  }

  // `mt-auto` pins it where the delta row would sit, keeping card heights even.
  &__error {
    @apply mt-auto flex items-center gap-1.5 pt-1.5 text-sm font-bold text-danger-600;
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
