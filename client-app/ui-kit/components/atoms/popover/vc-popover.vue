<template>
  <div>
    <div
      v-if="!disableTriggerEvents"
      ref="triggerNode"
      :aria-describedby="`popover-${$.uid}`"
      tabindex="0"
      role="button"
      @mouseenter="trigger === 'hover' && open()"
      @mouseleave="trigger === 'hover' && close()"
      @focus="trigger === 'hover' && open()"
      @blur="trigger === 'hover' && close()"
      @click="trigger === 'click' && toggle()"
      @keyup="trigger === 'click' && toggle()"
    >
      <slot name="trigger" v-bind="{ toggle, open, close, opened: isShown }" />
    </div>

    <div v-else ref="triggerNode" :aria-describedby="`popover-${$.uid}`">
      <slot name="trigger" v-bind="{ toggle, open, close, opened: isShown }" />
    </div>

    <div v-show="isShown" :id="`popover-${$.uid}`" ref="popoverNode" :style="{ zIndex, width }">
      <slot name="content" v-bind="{ close }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { bottom, createPopper } from "@popperjs/core";
import { onClickOutside } from "@vueuse/core";
import { ref, shallowRef, onUnmounted, watch } from "vue";
import type { Instance, PositioningStrategy } from "@popperjs/core";

interface IEmits {
  (event: "toggle", value: boolean): void;
}

interface IProps {
  placement?: VcPopoverPlacement;
  strategy?: PositioningStrategy;
  xOffset?: number | string;
  yOffset?: number | string;
  trigger?: "hover" | "click";
  disabled?: boolean;
  zIndex?: number | string;
  width?: string;
  disableTriggerEvents?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  placement: bottom,
  strategy: "absolute",
  xOffset: 0,
  yOffset: 0,
  trigger: "hover",
  zIndex: 1,
});

const triggerNode = shallowRef<HTMLElement | null>(null);
const popoverNode = shallowRef<HTMLElement | null>(null);

const isShown = ref(false);
let popoverInstance: Instance | null = null;

function create(): void {
  popoverInstance = createPopper(triggerNode.value!, popoverNode.value!, {
    placement: props.placement,
    strategy: props.strategy,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [props.xOffset, props.yOffset],
        },
      },
      {
        name: "arrow",
      },
    ],
  });
}

function toggle(): void {
  if (props.disabled) {
    return;
  }

  if (isShown.value) {
    close();
  } else {
    open();
  }
}

function open(): void {
  isShown.value = true;

  create();
}

function close(): void {
  isShown.value = false;

  popoverInstance?.destroy();
  popoverInstance = null;
}

onClickOutside(
  triggerNode,
  () => {
    close();
  },
  { ignore: [popoverNode] },
);

watch(isShown, (value: boolean) => emit("toggle", value));

onUnmounted(() => {
  popoverInstance?.destroy();
});
</script>
