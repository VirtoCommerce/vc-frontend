<template>
  <VcPopover
    class="vc-tooltip"
    :placement="placement"
    :strategy="strategy"
    :hover="hover"
    :offset-options="offsetOptions"
    :flip-options="flipOptions"
    :shift-options="shiftOptions"
    :width="width"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>

    <template #content>
      <div class="vc-tooltip__content">
        <slot name="content" />
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "shown", isShown: boolean): void;
}

export interface IProps {
  placement?: VcTooltipPlacementType;
  strategy?: VcTooltipStrategyType;
  flipOptions?: VcTooltipFlipOptionsType;
  offsetOptions?: VcTooltipOffsetOptionsType;
  shiftOptions?: VcTooltipShiftOptionsType;
  hover?: boolean;
  width?: string;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  placement: "bottom",
  offsetOptions: 6,
  hover: true,
});
</script>

<style lang="scss">
.vc-tooltip {
  @apply relative;

  &__content {
    @apply max-w-full rounded-sm bg-additional-50 py-1.5 px-3.5 text-xs text-neutral-800 shadow-md;
  }
}
</style>
