<template>
  <VcTooltip :y-offset="4" :x-offset="0" :placement="placement" trigger="click">
    <template #trigger>
      <VcButton icon="cog" color="secondary" variant="outline" size="xs" />
    </template>

    <template #content>
      <div
        class="flex select-none flex-col divide-y rounded bg-[--color-additional-50] text-sm font-bold text-[--color-accent-600] shadow-xl"
      >
        <slot>
          <button
            v-for="action in actions"
            :key="action.label"
            type="button"
            class="flex items-center gap-2.5 whitespace-nowrap p-3"
            :disabled="action.disabled"
            :title="action.title"
            @click="action.onClick"
          >
            <VcIcon :class="action.iconClass" :name="action.icon" size="sm" />
            {{ action.label }}
          </button>
        </slot>
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
export interface IProps {
  placement?: VcTooltipPlacement;
  actions?: {
    label: string;
    icon: string;
    iconClass: string;
    onClick: () => void;
    disabled: boolean;
    title?: string;
  }[];
}

withDefaults(defineProps<IProps>(), {
  placement: "bottom-end",
  actions: () => [],
});
</script>
