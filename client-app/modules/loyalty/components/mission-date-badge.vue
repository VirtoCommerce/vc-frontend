<template>
  <span class="mission-date-badge">
    <VcBadge class="mission-date-badge__dot" :color="severity" />

    {{ label }}
  </span>
</template>

<script setup lang="ts">
import type { MissionDateSeverityType } from "../composables";

interface IProps {
  severity: MissionDateSeverityType;
  label: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.mission-date-badge {
  // Private name because re-declaring a --color-vc-* key from itself on one element is a cycle:
  // the dot reads this instead. A preset that tunes the solid fill wins, otherwise shade 700.
  @each $color in (warning, danger, success) {
    --mission-date-badge-#{$color}-bg: var(--color-vc-background-solid-#{$color}, theme("colors.#{$color}.700"));
    --mission-date-badge-#{$color}-border: var(--color-vc-border-solid-#{$color}, theme("colors.#{$color}.700"));
  }

  @apply flex items-center gap-2 text-sm font-bold text-neutral-600;

  &__dot {
    // The dot is a non-text status indicator (WCAG 1.4.11) and the untuned palette fills miss 3:1
    // on the card surface: warning-500 in light (2.09:1), and warning/danger/success-400 in the
    // dark presets that leave the shared key alone (2.40-2.89:1). Light reads the component key,
    // the dark layer reads the shared one, so both families have to be set.
    @each $color in (warning, danger, success) {
      --vc-badge-solid-#{$color}-bg: var(--mission-date-badge-#{$color}-bg);
      --vc-badge-solid-#{$color}-border: var(--mission-date-badge-#{$color}-border);
      --color-vc-background-solid-#{$color}: var(--mission-date-badge-#{$color}-bg);
      --color-vc-border-solid-#{$color}: var(--mission-date-badge-#{$color}-border);
    }
  }
}
</style>
