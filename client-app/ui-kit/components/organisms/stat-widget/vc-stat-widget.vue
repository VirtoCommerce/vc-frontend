<template>
  <div class="vc-stat-widget" :class="`vc-stat-widget--color--${color}`">
    <div class="vc-stat-widget__head">
      <span v-if="$slots.prepend" class="vc-stat-widget__prepend">
        <slot name="prepend" />
      </span>

      <VcIcon v-if="icon" class="vc-stat-widget__icon" :name="icon" :size="15" />

      <span class="vc-stat-widget__label">{{ label }}</span>
    </div>

    <output class="vc-stat-widget__status">{{ statusText }}</output>

    <div v-if="loading" class="vc-stat-widget__value vc-stat-widget__value--pending" aria-hidden="true">—</div>

    <div v-else-if="errorText" class="vc-stat-widget__error" aria-hidden="true">
      <VcIcon name="exclamation-circle" :size="16" />

      <span>{{ errorText }}</span>
    </div>

    <template v-else>
      <div class="vc-stat-widget__value">
        {{ value }}

        <span v-if="valueSuffix" class="vc-stat-widget__unit">{{ valueSuffix }}</span>
      </div>

      <div v-if="sub" class="vc-stat-widget__sub">{{ sub }}</div>

      <div v-if="delta" class="vc-stat-widget__delta" :class="`vc-stat-widget__delta--color--${deltaColor}`">
        <VcIcon v-if="deltaIcon" :name="deltaIcon" :size="14" />

        <span>{{ delta }}</span>
      </div>
    </template>

    <!-- No backdrop: the figures are already replaced by the dash, so there is nothing to veil. -->
    <VcLoaderOverlay v-if="loading" no-bg />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface IProps {
  /** Metric caption. Every string prop arrives already localized and formatted: the card translates nothing. */
  label: string;
  /** The figure itself, pre-formatted ("$12,480.00", "34"). */
  value: string;
  /** Icon before the label, in the accent color. */
  icon?: string;
  /** Accent of the start-edge bar, the icon and the `prepend` slot. */
  color?: VcStatWidgetColorType;
  /** De-emphasized unit after the value ("items"), so the number stays the focal point. */
  valueSuffix?: string;
  /** Secondary line under the value. */
  sub?: string;
  /** Comparison line, pinned to the bottom of the card. */
  delta?: string;
  /** Color of `delta`, e.g. `success` for growth and `danger` for a drop. */
  deltaColor?: VcStatWidgetColorType;
  /** Icon before `delta`, e.g. `chevron-up`. */
  deltaIcon?: string;
  /** Data in flight: a dash replaces the figures and a loader covers the card. Outranks `errorText`. */
  loading?: boolean;
  /** Load failure message; when set, it replaces the figures. */
  errorText?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  color: "neutral",
  deltaColor: "neutral",
});

const { t } = useI18n();

const statusText = computed(() => {
  if (props.loading) {
    return t("ui_kit.messages.loading_text");
  }
  return props.errorText ?? "";
});
</script>

<style lang="scss">
.vc-stat-widget {
  $colors: primary, secondary, neutral, accent, info, success, warning, danger;

  --accent-color: var(--color-neutral-500);
  --radius: var(--vc-stat-widget-radius, var(--vc-radius, 0.5rem));

  @apply relative flex min-h-full flex-col gap-1.5 rounded-[--radius] border border-neutral-200 bg-additional-50 p-4 shadow-sm;

  // Logical property, so the accent bar flips in RTL.
  border-inline-start: 0.25rem solid var(--accent-color);

  &--color {
    @each $color in $colors {
      &--#{$color} {
        --accent-color: var(--color-#{$color}-500);
      }
    }
  }

  &__head {
    --vc-icon-color: var(--accent-color);

    @apply flex items-center gap-2;
  }

  &__prepend {
    @apply inline-flex text-[--accent-color];
  }

  &__label {
    @apply flex min-h-[2lh] items-center text-xs font-bold uppercase tracking-wide text-neutral-600;
  }

  &__status {
    @apply sr-only;
  }

  &__value {
    @apply text-3xl font-bold leading-tight text-neutral-900;

    &--pending {
      @apply text-neutral-300;
    }
  }

  &__error {
    @apply mt-auto flex items-center gap-1.5 pt-1.5 text-sm font-bold text-danger-600;
  }

  &__unit {
    @apply text-sm font-normal text-neutral-600;
  }

  &__sub {
    @apply text-xs text-neutral-600;
  }

  &__delta {
    --delta-color: var(--color-neutral-600);

    @apply mt-auto flex items-center gap-1 pt-1.5 text-sm font-bold text-[--delta-color];

    &--color {
      @each $color in $colors {
        &--#{$color} {
          --delta-color: var(--color-#{$color}-600);
        }
      }
    }
  }
}
</style>
