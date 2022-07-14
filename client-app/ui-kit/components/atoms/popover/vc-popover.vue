<template>
  <div aria-describedby="popover" ref="triggerNode" @click="togglePopover()">
    <slot name="trigger" />
  </div>

  <div class="bg-white border shadow-lg rounded" id="popover" ref="popoverNode" v-show="popoverShow">
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
import { ref, shallowRef, onUnmounted } from "vue";
import { isDefined, onClickOutside } from "@vueuse/core";
import { createPopper, Instance } from "@popperjs/core";

const emit = defineEmits<{
  (event: "shown", value: boolean): void;
}>();

defineProps({
  title: String,
  showCloseButton: Boolean,
});

const triggerNode = shallowRef<HTMLElement | null>(null);
const popoverNode = shallowRef<HTMLElement | null>(null);

const popoverShow = ref(false);
let popoverInstance: Instance | undefined = undefined;

function createPopover(): void {
  popoverInstance = createPopper(triggerNode.value!, popoverNode.value!, {
    placement: "bottom",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 20],
        },
      },
      {
        name: "flip",
        options: {
          fallbackPlacements: ["bottom"],
        },
      },
    ],
  });
}

function togglePopover(state?: boolean): void {
  popoverShow.value = isDefined(state) ? state : !popoverShow.value;
  if (popoverShow.value) {
    createPopover();
    popoverInstance?.update();
  }
  emit("shown", popoverShow.value);
}

onUnmounted(() => {
  popoverInstance?.destroy();
});

onClickOutside(popoverNode, () => togglePopover(false), { ignore: [triggerNode] });
</script>

<style scoped>
#arrow,
#arrow::before {
  position: absolute;
  top: -2px;
  left: -3px;
  width: 16px;
  height: 16px;
  background: inherit;
  border-top: inherit;
  border-left: inherit;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: "";
  transform: rotate(45deg);
}

#popover[data-popper-placement^="bottom"] > #arrow {
  top: -8px;
}
</style>
