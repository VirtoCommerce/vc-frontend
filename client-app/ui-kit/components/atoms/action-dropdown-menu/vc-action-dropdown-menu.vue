<template>
  <VcTooltip :y-offset="4" :x-offset="0" :placement="placement" trigger="click">
    <template #trigger>
      <VcButton icon="cog" color="secondary" variant="outline" size="xs" />
    </template>

    <template #content>
      <div
        class="flex select-none flex-col divide-y rounded bg-[--color-additional-50] text-sm font-bold text-[--color-accent-600] shadow-xl"
      >
        <slot />
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
export interface IProps {
  placement?: VcTooltipPlacement;
}

withDefaults(defineProps<IProps>(), {
  placement: "bottom-end",
});
</script>
