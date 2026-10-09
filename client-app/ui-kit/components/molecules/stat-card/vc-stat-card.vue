<template>
  <div
    :class="[
      'vc-stat-card stat-widget',
      `vc-stat-card--color--${color} stat-widget--${color}`,
      { 'vc-stat-card--placeholder': placeholder },
    ]"
    :aria-busy="loading || undefined"
  >
    <!-- Every `stat-widget*` class is a legacy alias of the `vc-stat-card*` class beside it: the ai-tools
         regression suites (Frontend/sales-rep) select on them. Remove them once the suites use `vc-stat-card*`. -->

    <!-- Bars in the card's own line boxes, so a placeholder is exactly as tall as the card it stands in for. -->
    <template v-if="placeholder">
      <div class="vc-stat-card__bar vc-stat-card__label stat-widget__label vc-stat-card__bar--label"></div>

      <div class="vc-stat-card__bar vc-stat-card__value stat-widget__value vc-stat-card__bar--value"></div>

      <div class="vc-stat-card__bar vc-stat-card__sub stat-widget__sub vc-stat-card__bar--sub"></div>

      <div class="vc-stat-card__bar vc-stat-card__delta stat-widget__delta vc-stat-card__bar--delta"></div>
    </template>

    <template v-else>
      <div class="vc-stat-card__head stat-widget__head">
        <!-- Decorator slot ahead of the icon, e.g. a drag affordance. Its content can color itself with
             `--vc-stat-card-accent` to match the edge bar. -->
        <slot name="leading" />

        <VcIcon v-if="icon" class="vc-stat-card__icon stat-widget__icon" :name="icon" :size="15" />

        <span class="vc-stat-card__label stat-widget__label">{{ label }}</span>
      </div>

      <!-- Figures only for a received response, so a pending or failed metric can't read as a genuine 0.
           Loading outranks the error so a retry shows the spinner, not the last failure (VCST-5586). -->
      <!-- aria-hidden: the dash is a visual placeholder; screen readers get aria-busy on the card instead. -->
      <div
        v-if="loading"
        class="vc-stat-card__value stat-widget__value vc-stat-card__value--pending stat-widget__value--pending"
        aria-hidden="true"
      >
        —
      </div>

      <!-- Native live region, so a failure replacing the figures is announced (Sonar S6819). -->
      <output v-else-if="errorText" class="vc-stat-card__error stat-widget__error">
        <VcIcon name="exclamation-circle" :size="16" />

        <span>{{ errorText }}</span>
      </output>

      <template v-else>
        <div class="vc-stat-card__value stat-widget__value">
          {{ value }}

          <span v-if="valueSuffix" class="vc-stat-card__unit stat-widget__unit">{{ valueSuffix }}</span>
        </div>

        <div v-if="sub" class="vc-stat-card__sub stat-widget__sub">{{ sub }}</div>

        <div
          v-if="delta"
          class="vc-stat-card__delta stat-widget__delta"
          :class="`vc-stat-card__delta--${deltaTone} stat-widget__delta--${deltaTone}`"
        >
          <VcIcon v-if="deltaIcon" :name="deltaIcon" :size="14" />

          <span>{{ delta }}</span>
        </div>
      </template>

      <VcLoaderOverlay v-if="loading" />
    </template>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  /** Already localized: the card is i18n-agnostic, so it renders whatever caption it is given. */
  label?: string;
  /** The figure, already formatted. */
  value?: string;
  icon?: string;
  /** The edge bar and icon. A color outside the palette goes through `--vc-stat-card-accent` instead. */
  color?: VcStatCardColorType;
  /** Unit after the value ("items"), rendered smaller so the number stays the focal point. */
  valueSuffix?: string;
  sub?: string;
  delta?: string;
  deltaTone?: VcStatCardToneType;
  deltaIcon?: string;
  /** A dash in place of the figures and a spinner over the card while the figure is being fetched. */
  loading?: boolean;
  /** Already localized, like `label`; its presence *is* the error state and outranks the figures. */
  errorText?: string;
  /** Skeleton mode: the card's box with a pulsing bar where each line goes, before anything is known. */
  placeholder?: boolean;
}

// color/deltaTone need defaults (they build class names); other optional props are fine as undefined.
withDefaults(defineProps<IProps>(), {
  color: "neutral",
  deltaTone: "positive",
});
</script>

<style lang="scss">
.vc-stat-card {
  $colors: primary, secondary, neutral, accent, info, success, warning, danger;

  // `relative` anchors the loader overlay; `overflow-hidden` clips its backdrop to the rounded corners.
  @apply relative flex h-full flex-col gap-1.5 overflow-hidden rounded-[--vc-radius] border border-neutral-200 bg-additional-50 p-4 shadow-sm;

  // Logical property so the accent bar flips in RTL; one custom property feeds the bar, the icon and
  // whatever the `leading` slot draws. Set it on the card itself to use a color outside the palette.
  border-inline-start: 4px solid var(--vc-stat-card-accent);

  @each $color in $colors {
    &--color--#{$color} {
      --vc-stat-card-accent: var(--color-#{$color}-500);
    }
  }

  // Neutral is the absence of emphasis, so its bar is a shade lighter than the others.
  &--color--neutral {
    --vc-stat-card-accent: var(--color-neutral-400);
  }

  &--placeholder {
    @apply animate-pulse;
  }

  // Ahead of the line rules on purpose: a bar takes the height of the line it stands in for, and the label's
  // two-line reserve below wins over this, so a placeholder's value bar starts where the real value will.
  &__bar {
    @apply min-h-[1lh] rounded bg-neutral-100;

    &--label {
      @apply w-2/3;
    }

    &--value {
      @apply w-1/2;
    }

    &--sub {
      @apply w-3/4;
    }

    &--delta {
      @apply w-1/2;
    }
  }

  &__head {
    @apply flex items-center gap-2;
  }

  &__icon {
    color: var(--vc-stat-card-accent);
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

  &__unit {
    @apply text-sm font-normal text-neutral-500;
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
