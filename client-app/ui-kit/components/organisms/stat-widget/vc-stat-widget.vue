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
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

interface IProps {
  /** Metric caption. Every string prop arrives already localized and formatted: the card translates nothing. */
  label: string;
  /** The figure itself, pre-formatted ("$12,480.00", "34"). Not needed while `loading` or on `errorText`. */
  value?: string;
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

// Empty on the first render: a live region that appears together with its text is not reliably
// announced, so a card mounted already loading or failed fills it in only after mount.
const isMounted = ref(false);

// Names the metric: a row of cards going busy at once would otherwise read "Loading..." with no hint which.
const statusText = computed(() => {
  if (!isMounted.value) {
    return "";
  }
  if (props.loading) {
    return t("ui_kit.stat_widget.loading", { label: props.label });
  }
  return props.errorText ? t("ui_kit.stat_widget.error", { label: props.label, error: props.errorText }) : "";
});

onMounted(() => {
  isMounted.value = true;
});
</script>

<style lang="scss">
.vc-stat-widget {
  $colors: primary, secondary, neutral, accent, info, success, warning, danger;

  --accent-color: var(--color-neutral-500);
  --bg-color: var(--vc-stat-widget-bg-color, var(--color-additional-50));
  --border-color: var(--vc-stat-widget-border-color, var(--color-neutral-200));
  --radius: var(--vc-stat-widget-radius, var(--vc-radius, 0.5rem));

  // `isolate` keeps the loader overlay's z-index inside the card; `border-s-4` is logical, so the
  // accent bar flips in RTL.
  @apply relative isolate flex min-w-0 flex-col gap-1.5 rounded-[--radius] border border-[--border-color] border-s-4 border-s-[--accent-color] bg-[--bg-color] p-4 shadow-sm;

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
    @apply flex min-h-[2lh] items-center text-xs font-bold uppercase tracking-wide text-neutral-600 [overflow-wrap:anywhere];
  }

  &__status {
    @apply sr-only;
  }

  &__value {
    @apply text-3xl font-bold leading-tight text-neutral-900 [overflow-wrap:anywhere];

    &--pending {
      @apply text-neutral-300;
    }
  }

  &__error {
    @apply mt-auto flex items-center gap-1.5 pt-1.5 text-sm font-bold text-danger-700;
  }

  &__unit {
    @apply text-sm font-normal text-neutral-600;
  }

  &__sub {
    @apply text-xs text-neutral-600;
  }

  &__delta {
    --delta-color: var(--color-neutral-700);

    @apply mt-auto flex items-center gap-1 pt-1.5 text-sm font-bold text-[--delta-color];

    &--color {
      @each $color in $colors {
        &--#{$color} {
          --delta-color: var(--color-#{$color}-700);
        }
      }
    }
  }
}
</style>
