<template>
  <div class="reporting-kpi-tile" :data-test-id="testId">
    <span class="reporting-kpi-tile__label">{{ label }}</span>

    <strong class="reporting-kpi-tile__value">{{ value }}</strong>

    <ReportingChangeBadge v-slot="{ text }" class="reporting-kpi-tile__change" :change="change ?? null">
      {{ t("shared.reporting.kpi.vs_last_year", { change: text }) }}
    </ReportingChangeBadge>

    <span v-if="caption" class="reporting-kpi-tile__caption">{{ caption }}</span>

    <progress
      v-if="progress !== undefined"
      class="reporting-kpi-tile__progress"
      :value="clampedProgress"
      max="1"
      :aria-label="label"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ReportingChangeBadge from "./reporting-change-badge.vue";

interface IProps {
  label: string;
  value: string;
  /** Percent vs last year; the badge is hidden without one. */
  change?: number | null;
  caption?: string;
  /** 0–1; draws the bar under the caption. */
  progress?: number;
  testId?: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const clampedProgress = computed(() => Math.min(1, Math.max(0, props.progress ?? 0)));
</script>

<style lang="scss">
.reporting-kpi-tile {
  @apply flex min-w-0 flex-col items-start gap-1 rounded-[--vc-radius] border border-neutral-200 p-3;

  &__label {
    @apply text-xs font-bold text-neutral-600;
  }

  &__value {
    @apply text-2xl font-bold text-neutral-950;
  }

  &__caption {
    @apply text-xs text-neutral-600;
  }

  &__progress {
    @apply mt-1 block h-1 w-full appearance-none overflow-hidden rounded-full bg-neutral-200;

    &::-webkit-progress-bar {
      @apply bg-neutral-200;
    }

    &::-webkit-progress-value {
      @apply rounded-full bg-primary-500;
    }

    &::-moz-progress-bar {
      @apply rounded-full bg-primary-500;
    }
  }
}
</style>
