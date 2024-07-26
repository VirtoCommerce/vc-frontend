<template>
  <div class="two-column polygon-bg">
    <div class="two-column__container" :class="$attrs.class">
      <div :class="['two-column__content', breakpointClassName('flex-row')]">
        <div :class="['two-column__column', 'two-column__column--left', breakpointClassName('w-1/2')]">
          <slot name="left"></slot>
        </div>
        <slot></slot>
        <div
          :class="[
            'two-column__column',
            'two-column__column--right',
            breakpointClassName('w-1/2'),
            alwaysShowRight ? 'block' : breakpointClassName('block'),
          ]"
        >
          <slot name="right"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreakpointsType } from "@/core/constants";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<IProps>(), {
  breakpoint: "lg",
});

interface IProps {
  alwaysShowRight?: boolean;
  breakpoint?: BreakpointsType;
}

function breakpointClassName(className: string): string {
  return `${props.breakpoint}:${className}`;
}
</script>

<style lang="scss">
.two-column {
  @apply grow lg:mt-20;

  &__container {
    @apply container mx-auto px-7 pb-52 pt-5;
  }

  &__content {
    @apply flex gap-8 flex-col lg:gap-x-[5.625rem];
  }

  &__column {
    @apply w-full;

    &--right {
      @apply hidden;
    }
  }
}
</style>
