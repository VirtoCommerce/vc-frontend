<template>
  <div
    aria-describedby="popover"
    ref="triggerNode"
    @mouseenter="toggleTooltip(true)"
    @mouseleave="toggleTooltip(false)"
  >
    <slot name="trigger" />
  </div>

  <div id="popover" ref="tooltipNode" v-show="isShown">
    <slot name="content" />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, onUnmounted, PropType } from "vue";
import { bottom, createPopper, Instance, Placement } from "@popperjs/core";

const props = defineProps({
  placement: {
    type: String as PropType<Placement>,
    default: bottom,
  },
  xOffset: {
    type: Number,
    default: 0,
  },
  yOffset: {
    type: Number,
    default: 6,
  },
});

const triggerNode = shallowRef<HTMLElement | null>(null);
const tooltipNode = shallowRef<HTMLElement | null>(null);

const isShown = ref(false);
let tooltipInstance: Instance | undefined = undefined;

function createTooltip(): void {
  tooltipInstance = createPopper(triggerNode.value!, tooltipNode.value!, {
    placement: props.placement,
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
    tooltipInstance?.update();
  } else {
    tooltipInstance?.destroy();
  }
}

onUnmounted(() => {
  tooltipInstance?.destroy();
});
</script>
