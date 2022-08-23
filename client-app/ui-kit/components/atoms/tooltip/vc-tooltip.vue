<template>
  <div class="inline-flex relative">
    <div
      :aria-describedby="`popover-${$.uid}`"
      ref="triggerNode"
      @mouseenter="trigger === 'hover' && toggleTooltip(true)"
      @mouseleave="trigger === 'hover' && toggleTooltip(false)"
      @click="trigger === 'click' && toggleTooltip(!isShown)"
    >
      <slot name="trigger" />
    </div>

    <div class="z-50" :id="`popover-${$.uid}`" ref="tooltipNode" v-show="isShown">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, onUnmounted, PropType, watch } from "vue";
import { bottom, createPopper, Instance, Placement, PositioningStrategy } from "@popperjs/core";
import { onClickOutside } from "@vueuse/core";

const props = defineProps({
  placement: {
    type: String as PropType<Placement>,
    default: bottom,
  },
  strategy: {
    type: String as PropType<PositioningStrategy>,
    default: "absolute",
  },
  xOffset: {
    type: Number,
    default: 0,
  },
  yOffset: {
    type: Number,
    default: 6,
  },
  trigger: {
    type: String as PropType<"hover" | "click">,
    default: "hover",
  },
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

const emit = defineEmits<{ (e: "shown", isShown: boolean): void }>();

watch(isShown, (value: boolean) => emit("shown", value));

onClickOutside(
  tooltipNode,
  () => {
    toggleTooltip(false);
  },
  { ignore: [triggerNode] }
);

onUnmounted(() => {
  tooltipInstance?.destroy();
});
</script>
