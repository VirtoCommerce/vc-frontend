<template>
  <span class="mission-date-badge">
    <VcBadge :color="severity" />

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
  @apply flex items-center gap-2 text-sm font-bold text-neutral-600;
}
</style>
