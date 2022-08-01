<template>
  <div
    aria-describedby="popover"
    ref="triggerNode"
    @mouseenter="toggleTooltip(true)"
    @mouseleave="toggleTooltip(false)"
  >
    <slot name="trigger" />
  </div>

  <div class="bg-white border shadow-lg py-1.5 px-3.5" id="popover" ref="tooltipNode" v-show="isShown">
    {{ content }}
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, onUnmounted } from "vue";
import { createPopper, Instance } from "@popperjs/core";

defineProps({
  content: {
    type: String,
    required: true,
  },
});

const triggerNode = shallowRef<HTMLElement | null>(null);
const tooltipNode = shallowRef<HTMLElement | null>(null);

const isShown = ref(false);
let tooltipInstance: Instance | undefined = undefined;

function createTooltip(): void {
  tooltipInstance = createPopper(triggerNode.value!, tooltipNode.value!, {
    placement: "bottom",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [-15, 6],
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
  }
}

onUnmounted(() => {
  tooltipInstance?.destroy();
});
</script>
