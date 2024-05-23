<template>
  <div
    v-if="shouldShowBadge"
    :class="`fixed top-0 z-[21] flex h-1 w-full justify-center bg-[--color-${badgeColor}-500]`"
  >
    <VcBadge class="h-[22px] min-w-17 items-center rounded-b-md" :color="badgeColor">
      {{ environmentName }}
    </VcBadge>
  </div>
</template>

<script setup lang="ts">
import { useEnvironmentName } from "@/core/composables/useEnvironmentName";

const { badgeColor, environmentName, shouldShowBadge } = useEnvironmentName();
</script>
