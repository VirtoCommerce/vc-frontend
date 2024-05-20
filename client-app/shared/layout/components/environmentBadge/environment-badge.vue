<template>
  <div v-if="!!envName" :class="`fixed top-0 z-[21] flex h-1 w-full justify-center bg-[--color-${badgeColor}-500]`">
    <VcBadge class="h-[22px] min-w-17 items-center rounded-b-md" :color="badgeColor">
      {{ $t(`env.${envName}`) }}
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

console.log("ENV", import.meta.env);

// const { themeContext } = useThemeContext();
// const envName = themeContext.value.storeSettings?.envName || "";
const envName = ""; // TODO: Uncomment above lines and remove this line after adding envName property to storeSettings
const badgeColor: VcBadgeColorType = badgesColors[envName];
</script>
