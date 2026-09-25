<template>
  <aside
    v-if="!isIgnored"
    :class="`fixed top-0 z-[21] flex h-1 w-full justify-center bg-[--color-${badgeColor}-500]`"
    :aria-label="`Environment indicator: ${environmentName}`"
  >
    <VcBadge class="h-[22px] min-w-17 items-center" :color="badgeColor" size="sm" rounded>
      {{ environmentName }}
    </VcBadge>
  </aside>
</template>

<script setup lang="ts">
import { useEnvironmentName } from "@/core/composables/useEnvironmentName";
import { COLORS } from "@/ui-kit/constants";

const BADGE_COLORS: Record<string, VcBadgeColorType> = {
  dev: COLORS.secondary,
  qa: COLORS.info,
  demo: COLORS.success,
};

const { environmentName, isIgnored } = useEnvironmentName();
const badgeColor: VcBadgeColorType = BADGE_COLORS[environmentName?.toLowerCase()] ?? COLORS.neutral;
</script>
