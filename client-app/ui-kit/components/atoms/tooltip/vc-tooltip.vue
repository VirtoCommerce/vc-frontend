<template>
  <VcPopover
    class="vc-tooltip"
    :placement="placement"
    :strategy="strategy"
    :hover="hover"
    :disabled="disabled"
    :offset-options="offsetOptions"
    :flip-options="flipOptions"
    :shift-options="shiftOptions"
    :width="width"
    role="tooltip"
    :enable-teleport="enableTeleport"
    :teleport-selector="teleportSelector"
  >
    <template v-if="$slots.default" #default="{ opened, triggerProps }">
      <slot
        :opened="opened"
        :trigger-props="{ ...triggerProps, 'aria-describedby': tooltipContentId }"
        :tooltip-id="tooltipContentId"
      />
    </template>

    <template v-else-if="$slots.trigger" #trigger>
      <slot name="trigger" />
    </template>

    <template #content>
      <div :id="tooltipContentId" class="vc-tooltip__content">
        <slot name="content" />
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { useComponentId } from "@/ui-kit/composables";
export interface IEmits {
  (event: "shown", isShown: boolean): void;
}

export interface IProps {
  placement?: VcTooltipPlacementType;
  strategy?: VcTooltipStrategyType;
  flipOptions?: VcTooltipFlipOptionsType;
  offsetOptions?: VcTooltipOffsetOptionsType;
  shiftOptions?: VcTooltipShiftOptionsType;
  disabled?: boolean;
  hover?: boolean;
  width?: string;
  enableTeleport?: boolean;
  teleportSelector?: string;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  placement: "bottom",
  offsetOptions: 6,
  hover: true,
  width: "max-content",
});

const tooltipContentId = useComponentId("vc-tooltip");
</script>

<style lang="scss">
.vc-tooltip {
  --radius: var(--vc-tooltip-radius, var(--vc-radius, 0.5rem));

  &__content {
    @apply max-w-full rounded-[--radius] bg-additional-50 py-1.5 px-3.5 text-xs text-neutral-800 shadow-md;
  }
}
</style>
