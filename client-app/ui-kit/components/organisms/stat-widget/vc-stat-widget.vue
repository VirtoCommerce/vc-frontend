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

    <div v-else-if="hasError" class="vc-stat-widget__error" aria-hidden="true">
      <span class="vc-stat-widget__line-icon">
        <VcIcon name="exclamation-circle" :size="16" />
      </span>

      <span>{{ errorText }}</span>
    </div>

    <template v-else>
      <div v-if="!hasValue" class="vc-stat-widget__value vc-stat-widget__value--pending" aria-hidden="true">—</div>

      <div v-else class="vc-stat-widget__value">
        {{ value }}

        <span v-if="valueSuffix" class="vc-stat-widget__value-suffix">{{ valueSuffix }}</span>
      </div>

      <div v-if="description" class="vc-stat-widget__description">{{ description }}</div>

      <div v-if="delta" class="vc-stat-widget__delta" :class="`vc-stat-widget__delta--color--${deltaColor}`">
        <span v-if="deltaIcon" class="vc-stat-widget__line-icon">
          <VcIcon :name="deltaIcon" :size="14" />
        </span>

        <span>{{ delta }}</span>
      </div>
    </template>

    <VcLoaderOverlay v-if="loading" no-bg />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface IProps {
  /** Metric caption. Every string prop arrives already localized and formatted; the card translates none of them. */
  label: string;
  /** The figure itself, pre-formatted ("$12,480.00", "34"). Without it the card shows a dash. */
  value?: string;
  /** Icon before the label, in the accent color. */
  icon?: string;
  /** Accent of the start-edge bar, the icon and the `prepend` slot. */
  color?: VcStatWidgetColorType;
  /** De-emphasized unit after the value ("items"), so the number stays the focal point. */
  valueSuffix?: string;
  /** Secondary line under the value. */
  description?: string;
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

defineSlots<{
  /** Content before the icon (added next to it, not instead of it), painted in the accent color, e.g. a drag handle. */
  prepend?: () => unknown;
}>();

const { t } = useI18n();

const hasValue = computed(() => !!props.value?.trim());
const hasError = computed(() => !!props.errorText?.trim());

const statusText = computed(() => {
  if (props.loading) {
    return t("ui_kit.stat_widget.loading", { label: props.label });
  }
  return hasError.value ? t("ui_kit.stat_widget.error", { label: props.label, error: props.errorText }) : "";
});
</script>

<style lang="scss">
.vc-stat-widget {
  $colors: primary, secondary, accent, info, success, warning, danger;

  --accent-color: var(--color-neutral-500);
  --bg-color: var(--vc-stat-widget-bg-color, var(--color-additional-50));
  --border-color: var(--vc-stat-widget-border-color, var(--color-neutral-200));
  --radius: var(--vc-stat-widget-radius, var(--vc-radius, 0.5rem));

  @apply relative isolate flex flex-col gap-1.5 rounded-[--radius] border border-[--border-color] border-s-4 border-s-[--accent-color] bg-[--bg-color] p-4 shadow-sm;

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
    @apply block min-h-[2lh] min-w-0 content-center text-xs font-bold uppercase tracking-wide text-neutral-600 [overflow-wrap:break-word];
  }

  &__status {
    @apply sr-only;
  }

  &__value {
    --value-color: var(--color-neutral-900);

    @apply text-3xl font-bold leading-tight text-[--value-color];

    &--pending {
      --value-color: var(--color-neutral-300);
    }
  }

  &__value-suffix {
    @apply text-sm font-normal text-neutral-600;
  }

  &__description {
    @apply text-xs text-neutral-600;
  }

  &__error {
    @apply mt-auto flex items-start gap-1.5 pt-1.5 text-sm font-bold text-danger-700;
  }

  &__delta {
    --delta-color: var(--color-neutral-700);

    @apply mt-auto flex items-start gap-1 pt-1.5 text-sm font-bold text-[--delta-color];

    &--color {
      @each $color in $colors {
        &--#{$color} {
          --delta-color: var(--color-#{$color}-700);
        }
      }
    }
  }

  &__line-icon {
    @apply inline-flex h-[1lh] shrink-0 items-center;
  }
}
</style>
