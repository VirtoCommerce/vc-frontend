<template>
  <!-- sidebar back cover -->
  <div
    :class="{ hidden: !isVisible }"
    class="fixed z-40 inset-0 w-full h-full bg-gray-800 opacity-95"
    @click="onHide"
  />
  <!-- Sidebar content -->
  <div :class="{ hidden: !isVisible }" v-bind="$attrs" class="fixed z-50 inset-0 h-full overflow-y-auto bg-white">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { toRefs, watch } from "vue";
import { turnOnBodyTouchNone, turnOffBodyTouchNone } from "@/core/utilities";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const { isVisible } = toRefs(props);

watch(isVisible, (value) => {
  if (value) {
    turnOnBodyTouchNone();
  } else {
    turnOffBodyTouchNone();
  }
});

const emit = defineEmits(["hide"]);

function onHide() {
  emit("hide");
}
</script>
