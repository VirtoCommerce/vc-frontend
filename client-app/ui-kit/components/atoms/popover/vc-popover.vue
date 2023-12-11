<template>
  <div>
    <div
      ref="triggerNode"
      :aria-describedby="`popover-${$.uid}`"
      tabindex="0"
      role="button"
      @mouseenter="trigger === 'hover' && open()"
      @mouseleave="trigger === 'hover' && close()"
      @focus="trigger === 'hover' && open()"
      @blur="trigger === 'hover' && close()"
      @click="trigger === 'click' && toggle(!isShown)"
      @keyup="trigger === 'click' && toggle(!isShown)"
    >
      <slot name="trigger" />
    </div>

    <div v-show="isShown" :id="`popover-${$.uid}`" ref="popoverNode" :style="{ zIndex }">
      <slot name="content" :close="close" />
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
    ],
  });
}

function toggle(show: boolean): void {
  if (props.disabled) {
    return;
  }

  isShown.value = show;

  if (isShown.value) {
    create();
  } else {
    popoverInstance?.destroy();
    popoverInstance = null;
  }
}

function open(): void {
  if (!isShown.value) {
    toggle(true);
  }
}

function close(): void {
  if (isShown.value) {
    toggle(false);
  }
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
