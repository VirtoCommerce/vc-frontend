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
  @apply flex h-full flex-col gap-1.5 rounded-lg border border-l-4 border-neutral-200 bg-additional-50 p-4 shadow-sm;

  &--primary {
    @apply border-l-primary;

    .stat-widget__icon {
      @apply text-primary;
    }
  }

  &--secondary {
    @apply border-l-secondary;

    .stat-widget__icon {
      @apply text-secondary;
    }
  }

  &--success {
    @apply border-l-success;

    .stat-widget__icon {
      @apply text-success;
    }
  }

  &--warning {
    @apply border-l-warning;

    .stat-widget__icon {
      @apply text-warning;
    }
  }

  &--info {
    @apply border-l-info;

    .stat-widget__icon {
      @apply text-info;
    }
  }

  &--neutral {
    @apply border-l-neutral-400;

    .stat-widget__icon {
      @apply text-neutral-400;
    }
  }

  &__head {
    @apply flex items-center gap-2;
  }

  &__label {
    @apply text-xs font-semibold uppercase tracking-wide text-neutral-500;
  }

  &__value {
    @apply text-3xl font-bold leading-tight text-neutral-900;
  }

  &__sub {
    @apply text-xs text-neutral-500;
  }

  &__delta {
    @apply mt-auto flex items-center gap-1 pt-1.5 text-[13px] font-bold;

    &--positive {
      @apply text-success-600;
    }

    &--negative {
      @apply text-danger-600;
    }
  }
}
</style>
