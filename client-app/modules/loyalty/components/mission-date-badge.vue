<template>
  <span class="mission-date-badge" :class="`mission-date-badge--${severity}`">
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
  --dot-color: theme("colors.success.500");

  @apply flex items-center gap-2 text-sm font-bold text-neutral-600;

  &--warning {
    --dot-color: theme("colors.warning.500");
  }

  &--danger {
    --dot-color: theme("colors.danger.500");
  }

  // VcBadge darkens a solid dot to -700 for contrast; the design keeps the -500 fill.
  & &__dot.vc-badge {
    --bg-color: var(--dot-color);
    --border-color: var(--dot-color);
  }
}
</style>
