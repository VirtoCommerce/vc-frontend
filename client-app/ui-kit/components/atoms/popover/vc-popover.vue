<template>
  <div ref="triggerNode" aria-describedby="popover" @click="togglePopover()">
    <slot name="trigger" />
  </div>

  <div v-show="isShown" v-bind="$attrs" id="popover" ref="popoverNode" class="rounded border bg-white shadow-lg">
    <div id="arrow" class="border-t border-l" data-popper-arrow></div>

    <h3 v-if="title || showCloseButton" class="flex h-14 items-center justify-between px-5 text-lg font-bold">
      <span v-if="title" class="flex grow">
        {{ title }}
      </span>
      <i
        v-if="showCloseButton"
        class="fas fa-times cursor-pointer text-red-400 hover:text-red-700"
        @click="togglePopover(false)"
      />
    </h3>
    <slot name="content" />
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { bottom, createPopper, Instance, Placement } from "@popperjs/core";
import { isDefined, onClickOutside } from "@vueuse/core";
import { ref, shallowRef, onUnmounted, PropType } from "vue";

const emit = defineEmits<{
  (event: "toggle", value: boolean): void;
}>();

const props = defineProps({
  showCloseButton: Boolean,

  title: {
    type: String,
    default: undefined,
  },

  xOffset: {
    type: Number,
    default: 0,
  },

  placement: {
    type: String as PropType<Placement>,
    default: bottom,
  },
});

const triggerNode = shallowRef<HTMLElement | null>(null);
const popoverNode = shallowRef<HTMLElement | null>(null);

const isShown = ref(false);
let popoverInstance: Instance | undefined = undefined;

function createPopover(): void {
  popoverInstance = createPopper(triggerNode.value!, popoverNode.value!, {
    placement: props.placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [props.xOffset, 20],
        },
      },
      {
        name: "flip",
        options: {
          fallbackPlacements: [props.placement],
        },
      },
    ],
  });
}

function togglePopover(show?: boolean): void {
  isShown.value = isDefined(show) ? show : !isShown.value;
  if (isShown.value) {
    createPopover();
    popoverInstance?.update();
  }
  emit("toggle", isShown.value);
}

onUnmounted(() => {
  popoverInstance?.destroy();
});

onClickOutside(
  popoverNode,
  () => {
    if (isShown.value) {
      togglePopover(false);
    }
  },
  { ignore: [triggerNode] }
);
</script>

<style scoped>
#arrow,
#arrow::before {
  position: absolute;
  width: 16px;
  height: 16px;
  background: inherit;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: "";
  transform: rotate(45deg);
}

#popover[data-popper-placement^="top"] > #arrow {
  bottom: -8px;
  border-right: inherit;
  border-bottom: inherit;
}

#popover[data-popper-placement^="bottom"] > #arrow {
  top: -8px;
  border-top: inherit;
  border-left: inherit;
}

#popover[data-popper-placement^="left"] > #arrow {
  right: -8px;
  border-top: inherit;
  border-right: inherit;
}

#popover[data-popper-placement^="right"] > #arrow {
  left: -8px;
  border-bottom: inherit;
  border-left: inherit;
}
</style>
