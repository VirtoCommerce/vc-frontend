<template>
  <div aria-describedby="popover" ref="triggerNode" @click="togglePopover()">
    <slot name="trigger" />
  </div>

  <div class="bg-white border shadow-lg rounded" v-bind="$attrs" id="popover" ref="popoverNode" v-show="isShown">
    <div class="border-t border-l" id="arrow" data-popper-arrow></div>

    <h3 class="flex justify-between font-bold items-center text-lg h-14 px-5" v-if="title || showCloseButton">
      <span class="flex flex-grow" v-if="title">
        {{ title }}
      </span>
      <i
        class="fas fa-times text-red-400 hover:text-red-700 cursor-pointer"
        @click="togglePopover(false)"
        v-if="showCloseButton"
      />
    </h3>
    <slot name="content" />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onUnmounted, PropType } from "vue";
import { isDefined, onClickOutside } from "@vueuse/core";
import { bottom, createPopper, Instance, Placement } from "@popperjs/core";

const emit = defineEmits<{
  (event: "toggle", value: boolean): void;
}>();

const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  showCloseButton: {
    type: Boolean,
    default: true,
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
