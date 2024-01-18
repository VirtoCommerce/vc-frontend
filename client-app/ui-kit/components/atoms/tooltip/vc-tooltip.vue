<template>
  <div class="relative">
    <div
      ref="triggerNode"
      :class="triggerCustomClasses"
      :aria-describedby="`popover-${$.uid}`"
      tabindex="0"
      @mouseenter="trigger === 'hover' && toggleTooltip(true)"
      @mouseleave="trigger === 'hover' && toggleTooltip(false)"
      @click="trigger === 'click' && toggleTooltip(!isShown)"
      @focus="toggleTooltip(true)"
      @blur="toggleTooltip(false)"
    >
      <slot name="trigger" />
    </div>

    <div v-show="isShown" :id="`popover-${$.uid}`" ref="tooltipNode" class="z-50">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { bottom, createPopper } from "@popperjs/core";
import { onClickOutside } from "@vueuse/core";
import { onUnmounted, ref, shallowRef, watch } from "vue";
import type { Instance, PositioningStrategy } from "@popperjs/core";

export interface IEmits {
  (event: "shown", isShown: boolean): void;
}

export interface IProps {
  placement?: VcTooltipPlacement;
  strategy?: PositioningStrategy;
  xOffset?: number;
  yOffset?: number;
  trigger?: "hover" | "click";
  triggerCustomClasses?: string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  placement: bottom,
  strategy: "absolute",
  xOffset: 0,
  yOffset: 6,
  trigger: "hover",
});

const triggerNode = shallowRef<HTMLElement | null>(null);
const tooltipNode = shallowRef<HTMLElement | null>(null);

const isShown = ref(false);
let tooltipInstance: Instance | null = null;

function createTooltip(): void {
  tooltipInstance = createPopper(triggerNode.value!, tooltipNode.value!, {
    placement: props.placement,
    strategy: props.strategy,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [props.xOffset, props.yOffset],
        },
      },
    ],
  });
}

function toggleTooltip(show: boolean): void {
  isShown.value = show;

  if (isShown.value) {
    createTooltip();
  } else {
    tooltipInstance?.destroy();
    tooltipInstance = null;
  }
}

watch(isShown, (value: boolean) => emit("shown", value));

onClickOutside(
  tooltipNode,
  () => {
    toggleTooltip(false);
  },
  { ignore: [triggerNode] },
);

onUnmounted(() => {
  tooltipInstance?.destroy();
});
</script>
