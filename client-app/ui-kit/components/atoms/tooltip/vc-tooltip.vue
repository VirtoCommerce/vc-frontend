<template>
  <VcPopover
    class="vc-tooltip"
    :placement="placement"
    :strategy="strategy"
    :hover="hover"
    :offset-options="offsetOptions"
    :flip-options="flipOptions"
    :shift-options="shiftOptions"
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
import type { OffsetOptions, ShiftOptions, FlipOptions, Placement, Strategy } from "@floating-ui/vue";

export interface IEmits {
  (event: "shown", isShown: boolean): void;
}

export interface IProps {
  placement?: Placement;
  strategy?: Strategy;
  flipOptions?: FlipOptions;
  offsetOptions?: OffsetOptions;
  shiftOptions?: ShiftOptions;
  hover?: boolean;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  offsetOptions: 6,
});
</script>

<style lang="scss">
.vc-tooltip {
  &__content {
    @apply max-w-full rounded-sm bg-additional-50 py-1.5 px-3.5 text-xs text-neutral-800 shadow-md;
  }
}
</style>
