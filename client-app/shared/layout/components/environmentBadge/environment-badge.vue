<template>
  <div
    v-if="!!environmentName"
    :class="`fixed top-0 z-[21] flex h-1 w-full justify-center bg-[--color-${badgeColor}-500]`"
  >
    <VcBadge class="h-[22px] min-w-17 items-center rounded-b-md" :color="badgeColor">
      {{ $t(`env.${environmentName}`) }}
    </VcBadge>
  </div>
</template>

<script setup lang="ts">
// import { useThemeContext } from "@/core/composables";
import { COLORS } from "@/core/constants";

const badgesColors: Record<string, VcBadgeColorType> = {
  dev: COLORS.secondary,
  qa: COLORS.info,
  demo: COLORS.success,
};

// const { themeContext } = useThemeContext();
// const environmentName = themeContext.value.storeSettings?.environmentName || "";
const environmentName = ""; // TODO: Uncomment above lines and remove this line after adding environmentName property to storeSettings
const badgeColor: VcBadgeColorType = badgesColors[environmentName];
</script>
